import React, { useState, useEffect } from 'react';
import { useRole } from '../context/RoleContext';
import { api } from '../api/client';
import { Patient, Facility, Referral, FollowUp } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { ReferralTimeline } from '../components/ReferralTimeline';
import {
  Users,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Stethoscope,
  Calendar,
  Building2,
  X,
  Check
} from 'lucide-react';

export const HealthWorkerPortal: React.FC = () => {
  const { currentUser } = useRole();

  // Stats & Lists
  const [patients, setPatients] = useState<Patient[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [completingFollowUp, setCompletingFollowUp] = useState<FollowUp | null>(null);
  const [visitNote, setVisitNote] = useState<string>("");

  // Create Referral Form State
  const [formData, setFormData] = useState({
    patient_id: "",
    referring_facility_id: currentUser.facility_id || "FAC-PHC-01",
    receiving_facility_id: "FAC-DH-01",
    reason: "",
    required_service: "Specialist Consultation - Cardiology",
    priority: "Urgent",
    clinical_notes: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [pts, facs, refs, fols] = await Promise.all([
        api.getPatients(),
        api.getFacilities(),
        api.getReferrals({ role: 'health_worker', facilityId: currentUser.facility_id }),
        api.getFollowUps({ workerId: 'HW-01' })
      ]);
      setPatients(pts);
      setFacilities(facs);
      setReferrals(refs);
      setFollowUps(fols);
      if (pts.length > 0 && !formData.patient_id) {
        setFormData(prev => ({ ...prev, patient_id: pts[0].id }));
      }
    } catch (err) {
      console.error("Failed to load health worker portal data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [currentUser.facility_id]);

  // Handle Create Referral Submission
  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.reason.trim()) {
      alert("Please select a patient and enter the clinical referral reason.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createReferral({
        ...formData,
        referring_health_worker_id: "HW-01",
      });
      setCreateSuccess(`Referral created successfully! Assigned ID: ${res.id}`);
      setTimeout(() => {
        setCreateSuccess(null);
        setShowCreateModal(false);
        setFormData({
          patient_id: patients[0]?.id || "",
          referring_facility_id: currentUser.facility_id || "FAC-PHC-01",
          receiving_facility_id: "FAC-DH-01",
          reason: "",
          required_service: "Specialist Consultation - Cardiology",
          priority: "Urgent",
          clinical_notes: ""
        });
        loadAllData();
      }, 1500);
    } catch (err: any) {
      alert("Error creating referral: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Follow-up Completion
  const handleCompleteFollowUp = async () => {
    if (!completingFollowUp) return;
    try {
      await api.completeFollowUp(completingFollowUp.id, {
        action_by_name: currentUser.name,
        action_by_role: "Health Worker",
        notes: visitNote || "Home visit completed. Recovery verified and medication adherence checked."
      });
      setCompletingFollowUp(null);
      setVisitNote("");
      loadAllData();
    } catch (err: any) {
      alert("Error completing follow-up: " + err.message);
    }
  };

  // Filtered referrals
  const filteredReferrals = referrals.filter(r => {
    if (statusFilter !== "ALL" && r.current_status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && r.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = r.patient_name?.toLowerCase().includes(q);
      const matchId = r.id.toLowerCase().includes(q);
      const matchReason = r.reason.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchReason) return false;
    }
    return true;
  });

  // Due follow-ups
  const dueFollowUps = followUps.filter(f => f.status === 'DUE' || f.status === 'OVERDUE');

  // KPI Calculations
  const activeCount = referrals.filter(r => r.current_status !== 'CLOSED').length;
  const pendingCount = referrals.filter(r => r.current_status === 'REFERRED' || r.current_status === 'ACCEPTED').length;
  const completedCount = referrals.filter(r => r.current_status === 'CLOSED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Community Health Worker Dashboard</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {currentUser.name}
          </h1>
          <p className="text-xs text-slate-500">
            Assigned Facility: <strong>Rampur Primary Health Centre (PHC)</strong> • Sector: Rampur Block
          </p>
        </div>

        <div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Referral</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Total Patients"
          value={patients.length}
          subtitle="Registered in sector"
          icon={<Users className="w-5 h-5" />}
          variant="blue"
        />
        <StatCard
          title="Active Referrals"
          value={activeCount}
          subtitle="In-transit or admitted"
          icon={<Clock className="w-5 h-5" />}
          variant="amber"
        />
        <StatCard
          title="Pending Triage"
          value={pendingCount}
          subtitle="Awaiting hospital acceptance"
          icon={<Send className="w-5 h-5" />}
          variant="purple"
        />
        <StatCard
          title="Follow-ups Due"
          value={dueFollowUps.length}
          subtitle="Requires community visit"
          icon={<Calendar className="w-5 h-5" />}
          variant="rose"
          alert={dueFollowUps.length > 0}
        />
        <StatCard
          title="Completed Care"
          value={completedCount}
          subtitle="Closed referral loops"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="emerald"
        />
      </div>

      {/* Prominent "Follow-ups Due Today" Section (Key SIH Differentiator) */}
      <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-amber-950 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-700" />
              Follow-ups Due Today & Overdue ({dueFollowUps.length})
            </h2>
            <p className="text-xs text-amber-900 mt-0.5">
              Continuity check: Post-discharge patients requiring home visit, wound dressing, or medication check.
            </p>
          </div>
          <span className="text-[11px] font-bold text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full w-fit">
            Immediate Action Required
          </span>
        </div>

        {dueFollowUps.length === 0 ? (
          <div className="py-6 text-center text-slate-500 bg-white/70 rounded-xl border border-amber-200 text-xs">
            🎉 All scheduled follow-ups for your sector have been completed. Great job!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dueFollowUps.map(fol => (
              <div
                key={fol.id}
                className="p-4 bg-white rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        TASK: {fol.id} • {fol.referral_id}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                        {fol.patient_name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Village: {fol.patient_village} • Ph: {fol.patient_phone}
                      </p>
                    </div>
                    <StatusBadge status={fol.status} type="followup" size="sm" />
                  </div>

                  <div className="mt-2 text-xs bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="font-semibold text-slate-700">Reason: </span>
                    <span className="text-slate-600">{fol.reason}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Scheduled: <strong>{fol.scheduled_date}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setCompletingFollowUp(fol);
                      setVisitNote(`Visited ${fol.patient_name} in village. Vitals stable. Medication adherence verified.`);
                    }}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Referrals Management Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Sector Referrals Pipeline ({filteredReferrals.length})
            </h2>
            <p className="text-xs text-slate-500">
              Track referrals created from Rampur PHC through all 7 continuity milestones.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, ID, reason..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs bg-slate-50 font-medium text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="REFERRED">1. Referred</option>
              <option value="ACCEPTED">2. Accepted</option>
              <option value="PATIENT_RECEIVED">3. Patient Received</option>
              <option value="TREATMENT_COMPLETED">4. Treatment Completed</option>
              <option value="FOLLOW_UP_REQUIRED">5. Follow-Up Required</option>
              <option value="CLOSED">7. Closed & Complete</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs bg-slate-50 font-medium text-slate-700"
            >
              <option value="ALL">All Priorities</option>
              <option value="Routine">Routine</option>
              <option value="Urgent">Urgent</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
        </div>

        {/* Referral Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3 text-left">Referral ID</th>
                <th className="px-4 py-3 text-left">Patient Details</th>
                <th className="px-4 py-3 text-left">Destination Hospital</th>
                <th className="px-4 py-3 text-left">Clinical Reason & Service</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Current Stage</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">Loading referrals...</td>
                </tr>
              ) : filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">No referrals found matching the criteria.</td>
                </tr>
              ) : (
                filteredReferrals.map(ref => (
                  <tr key={ref.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{ref.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{ref.patient_name}</div>
                      <div className="text-[11px] text-slate-500">
                        {ref.patient_age}y / {ref.patient_gender} • {ref.patient_village}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {ref.receiving_facility_name}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800 font-medium line-clamp-1">{ref.reason}</div>
                      <div className="text-[10px] text-teal-700 font-semibold">{ref.required_service}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ref.priority} type="priority" size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ref.current_status} type="referral" size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={async () => {
                          const detailed = await api.getReferralDetail(ref.id);
                          setSelectedReferral(detailed);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                      >
                        <span>Inspect Journey</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE REFERRAL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-teal-700 text-white flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                  Clinical Coordination
                </span>
                <h2 className="text-lg font-bold mt-1">Create New Verified Referral</h2>
                <p className="text-xs text-teal-100 mt-0.5">
                  Connect patient to the right tertiary facility with immediate digital audit log.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReferral} className="p-6 space-y-4 text-xs">
              {createSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{createSuccess}</span>
                </div>
              )}

              {/* Patient Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  1. Select Patient:
                </label>
                <select
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                  required
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.age}y / {p.gender}) • Village: {p.village} • ABHA: {p.abha_id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Facility & Destination Facility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    2. Referring Facility (Origin):
                  </label>
                  <select
                    value={formData.referring_facility_id}
                    onChange={(e) => setFormData({ ...formData, referring_facility_id: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-teal-500"
                  >
                    {facilities.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    3. Destination Facility (Receiving):
                  </label>
                  <select
                    value={formData.receiving_facility_id}
                    onChange={(e) => setFormData({ ...formData, receiving_facility_id: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-teal-900 bg-teal-50/50 focus:ring-2 focus:ring-teal-500"
                  >
                    {facilities.filter(f => f.type.includes("Hospital") || f.type.includes("CHC")).map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Required Service & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    4. Required Clinical Service:
                  </label>
                  <select
                    value={formData.required_service}
                    onChange={(e) => setFormData({ ...formData, required_service: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Specialist Consultation - Cardiology">Specialist Consultation - Cardiology</option>
                    <option value="General Surgery & ICU">General Surgery & ICU</option>
                    <option value="Maternal Care - High Risk Obstetrics">Maternal Care - High Risk Obstetrics</option>
                    <option value="Pediatrics & Neonatal Care">Pediatrics & Neonatal Care</option>
                    <option value="Orthopedics & Fracture Care">Orthopedics & Fracture Care</option>
                    <option value="Specialist Consultation - Pulmonology">Specialist Consultation - Pulmonology</option>
                    <option value="Advanced Diagnostic Lab Workup">Advanced Diagnostic Lab Workup</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    5. Clinical Priority:
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Routine">Routine (Non-critical, OPD workup)</option>
                    <option value="Urgent">Urgent (Require attention within 24 hours)</option>
                    <option value="Emergency">Emergency (Immediate trauma / acute danger)</option>
                  </select>
                </div>
              </div>

              {/* Reason for Referral */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  6. Reason for Referral:
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g. Exertional severe chest pain, uncontrolled hypertension, needs Cardiology"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              {/* Clinical notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  7. Initial Clinical Notes & Vitals:
                </label>
                <textarea
                  value={formData.clinical_notes}
                  onChange={(e) => setFormData({ ...formData, clinical_notes: e.target.value })}
                  rows={2}
                  placeholder="BP 164/102, ECG ST-elevation in lead II/III, initial aspirin & nitrate given..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "Submitting..." : "Submit Referral (Initializes Status: REFERRED)"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REFERRAL INSPECTION MODAL */}
      {selectedReferral && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-slate-900 text-white flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-400">
                  {selectedReferral.id}
                </span>
                <h3 className="text-lg font-bold mt-0.5">
                  Referral Audit: {selectedReferral.patient?.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedReferral.patient?.age}y / {selectedReferral.patient?.gender} • Village: {selectedReferral.patient?.village}
                </p>
              </div>
              <button
                onClick={() => setSelectedReferral(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block">From (Referring Facility):</span>
                  <span className="font-bold text-slate-800">{selectedReferral.referring_facility?.name}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block">To (Receiving Hospital):</span>
                  <span className="font-bold text-teal-800">{selectedReferral.receiving_facility?.name}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-medium">Referral Reason:</span>
                <span className="font-semibold text-slate-900 text-sm block mt-0.5">{selectedReferral.reason}</span>
                {selectedReferral.clinical_notes && (
                  <p className="mt-1 text-slate-600 italic">“{selectedReferral.clinical_notes}”</p>
                )}
              </div>

              {/* Visual Timeline component */}
              <ReferralTimeline
                currentStatus={selectedReferral.current_status}
                history={selectedReferral.history}
              />
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedReferral(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-xs"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MARK FOLLOW-UP COMPLETED MODAL */}
      {completingFollowUp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-teal-700 text-white flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                  Community Health Worker Task
                </span>
                <h3 className="text-base font-bold mt-1">Record Completed Follow-Up</h3>
                <p className="text-xs text-teal-100">
                  Patient: {completingFollowUp.patient_name} • {completingFollowUp.patient_village}
                </p>
              </div>
              <button
                onClick={() => setCompletingFollowUp(null)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <span className="text-amber-800 font-semibold block">Continuity Effect:</span>
                <span className="text-amber-950 mt-0.5 block">
                  Completing this follow-up will close the loop and transition the parent referral (<strong>{completingFollowUp.referral_id}</strong>) to <strong>CLOSED</strong>.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Community Visit Observations & Clinical Vitals:
                </label>
                <textarea
                  value={visitNote}
                  onChange={(e) => setVisitNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. Visited patient at home in Rampur. BP 122/80. Wound dressing changed with sterile gauze. Patient adhering to daily medications."
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingFollowUp(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCompleteFollowUp}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Verify & Close Referral Cycle</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
