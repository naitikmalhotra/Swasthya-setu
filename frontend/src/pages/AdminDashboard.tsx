import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { AdminAnalytics, FacilityHealthMetric } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { FacilityDetailModal } from '../components/FacilityDetailModal';
import {
  ShieldCheck,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Pill,
  FlaskConical,
  BarChart3,
  TrendingUp,
  Activity,
  Filter,
  RefreshCw,
  ChevronRight,
  Check,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("ALL");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to load admin analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        Aggregating district public health analytics & continuity metrics...
      </div>
    );
  }

  // Filter facilities by district
  const filteredMetrics = analytics.facility_metrics.filter(m => {
    if (selectedDistrict !== "ALL" && m.district !== selectedDistrict) return false;
    return true;
  });

  // Recharts color palettes
  const STATUS_COLORS: Record<string, string> = {
    'REFERRED': '#6366f1',
    'ACCEPTED': '#0ea5e9',
    'PATIENT_RECEIVED': '#f59e0b',
    'TREATMENT_COMPLETED': '#a855f7',
    'FOLLOW_UP_REQUIRED': '#f97316',
    'FOLLOW_UP_COMPLETED': '#14b8a6',
    'CLOSED': '#10b981'
  };

  const pieData = Object.entries(analytics.status_distribution).map(([status, count]) => ({
    name: status.replace(/_/g, ' '),
    value: count,
    color: STATUS_COLORS[status] || '#94a3b8'
  }));

  const facilityBarData = analytics.referrals_by_facility.map(f => ({
    name: f.facility_name.split(' ')[0] + ' ' + (f.facility_name.split(' ')[1] || ''),
    count: f.count,
    district: f.district
  })).slice(0, 7);

  const funnelData = analytics.funnel_stages.map(fn => ({
    stage: fn.stage,
    count: fn.count,
    desc: fn.description
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Government Health Administration Oversight</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            District Healthcare Coordination & Continuity Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Real-time tracking of public health referrals, drop-off rates, and facility supply gaps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-white/10 text-slate-300">
            Prototype Data
          </span>
          <button
            onClick={loadData}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Refresh Analytics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main KPI Row (8 Essential Indicators) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Facilities"
          value={analytics.total_facilities}
          subtitle="DH, CHC, PHC, Sub-Centres"
          icon={<Building2 className="w-5 h-5" />}
          variant="blue"
        />
        <StatCard
          title="Active Referrals"
          value={analytics.active_referrals}
          subtitle="Patients in care pipeline"
          icon={<Clock className="w-5 h-5" />}
          variant="amber"
        />
        <StatCard
          title="Completed Referrals"
          value={analytics.completed_referrals}
          subtitle={`${analytics.completion_rate_percentage}% Completion Rate`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="emerald"
        />
        <StatCard
          title="Follow-ups Due Today"
          value={analytics.follow_ups_due}
          subtitle="Assigned to community ANMs"
          icon={<Calendar className="w-5 h-5" />}
          variant="purple"
        />
        <StatCard
          title="Overdue Follow-ups"
          value={analytics.overdue_follow_ups}
          subtitle="High drop-off risk"
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="rose"
          alert={analytics.overdue_follow_ups > 0}
        />
        <StatCard
          title="Medicine Shortages"
          value={analytics.medicine_shortages_count}
          subtitle="Low/Out of stock drugs"
          icon={<Pill className="w-5 h-5" />}
          variant="rose"
          alert={analytics.medicine_shortages_count > 0}
        />
        <StatCard
          title="Diagnostic Gaps"
          value={analytics.diagnostic_gaps_count}
          subtitle="Unavailable test equipment"
          icon={<FlaskConical className="w-5 h-5" />}
          variant="amber"
        />
        <StatCard
          title="Continuity Rate"
          value={`${analytics.completion_rate_percentage}%`}
          subtitle="Referral-to-Closure success"
          icon={<TrendingUp className="w-5 h-5" />}
          variant="teal"
        />
      </div>

      {/* HEALTHCARE GAPS & BOTTLENECK SUMMARY (SIH Focus Area) */}
      <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-amber-950 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Public Healthcare Gap Analysis & Resource Bottlenecks
            </h2>
            <p className="text-xs text-amber-900 mt-0.5">
              Live alerts identifying service deficits that cause rural patient hardship and referral delays.
            </p>
          </div>
          <span className="text-[11px] font-bold text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full w-fit">
            System Monitoring
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-2xs">
            <span className="text-slate-500 font-semibold block">Medicine Shortages</span>
            <span className="text-2xl font-black text-rose-700 block mt-1">
              {analytics.medicine_shortages_count} drugs
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Flagged in CHC Kishanganj & Sub-Centres
            </span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-2xs">
            <span className="text-slate-500 font-semibold block">Diagnostic Gaps</span>
            <span className="text-2xl font-black text-amber-700 block mt-1">
              {analytics.diagnostic_gaps_count} tests
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Labs offline requiring outward transport
            </span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-2xs">
            <span className="text-slate-500 font-semibold block">Pending Referrals</span>
            <span className="text-2xl font-black text-blue-700 block mt-1">
              {analytics.pending_referrals} patients
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Awaiting hospital bed confirmation
            </span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-2xs">
            <span className="text-slate-500 font-semibold block">Overdue Follow-ups</span>
            <span className="text-2xl font-black text-red-700 block mt-1">
              {analytics.overdue_follow_ups} patients
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Post-treatment check overdue &gt; 48hrs
            </span>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Referral Continuity Funnel (Key SIH Metric) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Referral Continuity Funnel (Drop-off Analysis)
              </h3>
              <p className="text-[11px] text-slate-500">
                Measures how many referrals progress through each milestone to complete closure.
              </p>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
              Continuity Pipeline
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 30, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            Notice how Swasthya Setu tracks patients post-treatment to ensure the follow-up step is completed before closing the case.
          </p>
        </div>

        {/* Chart 2: Referral Status Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Referral Status Distribution
              </h3>
              <p className="text-[11px] text-slate-500">
                Breakdown of all referrals currently in the database.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
              {analytics.total_referrals} Total
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-slate-600">
            {pieData.map((p, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                <span>{p.name} ({p.value})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* FACILITY-LEVEL MONITORING MATRIX (GOOD / WARNING / CRITICAL) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Facility Health & Readiness Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Composite readiness rating based on doctor availability, medicine inventory, diagnostics, and overdue tasks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Filter District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs bg-slate-50 font-medium text-slate-800"
            >
              <option value="ALL">All Districts</option>
              <option value="Chandanpur">Chandanpur</option>
              <option value="Kishanganj">Kishanganj</option>
              <option value="Ramgarh">Ramgarh</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 text-xs">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-700 font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3 text-left">Facility Name</th>
                <th className="px-4 py-3 text-left">District & Type</th>
                <th className="px-4 py-3 text-center">Duty Doctor</th>
                <th className="px-4 py-3 text-center">Medicine Status</th>
                <th className="px-4 py-3 text-center">Diagnostic Lab</th>
                <th className="px-4 py-3 text-center">Active Referrals</th>
                <th className="px-4 py-3 text-center">Overdue Follow-ups</th>
                <th className="px-4 py-3 text-center">Facility Status</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredMetrics.map(fm => (
                <tr key={fm.facility_id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900">{fm.facility_name}</td>
                  <td className="px-4 py-3 text-slate-500">
                    <div>{fm.type}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{fm.district}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {fm.doctor_status ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <Check className="w-3.5 h-3.5" /> Present
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                        <X className="w-3.5 h-3.5" /> Off-duty
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {fm.medicine_shortages > 0 ? (
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                        {fm.medicine_shortages} Shortage
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium">Stocked</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {fm.diagnostic_gaps > 0 ? (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">
                        {fm.diagnostic_gaps} Gaps
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-slate-800">
                    {fm.active_referrals}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {fm.overdue_follow_ups > 0 ? (
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold animate-pulse">
                        {fm.overdue_follow_ups} Overdue
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={fm.health_status} type="health" size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedFacilityId(fm.facility_id)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Facility Detail Modal */}
      <FacilityDetailModal
        facilityId={selectedFacilityId}
        onClose={() => setSelectedFacilityId(null)}
      />
    </div>
  );
};
