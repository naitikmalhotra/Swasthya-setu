import React, { useState, useEffect } from 'react';
import { useRole } from '../context/RoleContext';
import { api } from '../api/client';
import { Referral, Medicine, Diagnostic, Facility } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { ReferralTimeline } from '../components/ReferralTimeline';
import {
  Building2,
  Inbox,
  CheckCircle2,
  UserCheck,
  Stethoscope,
  Calendar,
  Pill,
  FlaskConical,
  Clock,
  ArrowRight,
  AlertCircle,
  X,
  Check,
  Plus
} from 'lucide-react';

export const FacilityPortal: React.FC = () => {
  const { currentUser } = useRole();
  const facilityId = currentUser.facility_id || "FAC-DH-01";

  const [facility, setFacility] = useState<Facility | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<'queue' | 'inventory' | 'diagnostics'>('queue');
  const [queueFilter, setQueueFilter] = useState<'ALL' | 'INCOMING' | 'ACCEPTED' | 'ADMITTED' | 'TREATED'>('ALL');

  // Modals
  const [inspectReferral, setInspectReferral] = useState<Referral | null>(null);
  const [scheduleModalRef, setScheduleModalRef] = useState<Referral | null>(null);

  // Follow-up form
  const [followUpDate, setFollowUpDate] = useState<string>(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [followUpReason, setFollowUpReason] = useState<string>("");
  const [followUpNotes, setFollowUpNotes] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [facDetail, refs] = await Promise.all([
        api.getFacilityDetail(facilityId),
        api.getReferrals({ facilityId, role: 'facility' })
      ]);
      setFacility(facDetail);
      setMedicines(facDetail.medicines || []);
      setDiagnostics(facDetail.diagnostics || []);
      setReferrals(refs);
    } catch (err) {
      console.error("Failed to load facility portal data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [facilityId]);

  // Transition referral status handler
  const handleTransition = async (
    referralId: string,
    targetStatus: string,
    note?: string
  ) => {
    try {
      await api.transitionReferral(referralId, {
        target_status: targetStatus,
        action_by_role: "Facility Staff",
        action_by_name: currentUser.name,
        facility_id: facilityId,
        note: note || `Facility updated status to ${targetStatus}`
      });
      loadData();
      if (inspectReferral && inspectReferral.id === referralId) {
        const updated = await api.getReferralDetail(referralId);
        setInspectReferral(updated);
      }
    } catch (err: any) {
      alert("Error transitioning status: " + err.message);
    }
  };

  // Schedule follow-up submission
  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleModalRef) return;

    try {
      await api.scheduleFollowUp({
        referral_id: scheduleModalRef.id,
        patient_id: scheduleModalRef.patient_id,
        scheduled_date: followUpDate,
        reason: followUpReason || "Post-discharge clinical review & medication check",
        assigned_worker_id: "HW-01",
        assigned_facility_id: scheduleModalRef.referring_facility_id,
        notes: followUpNotes
      }, currentUser.name, "Facility Doctor");

      setScheduleModalRef(null);
      setFollowUpReason("");
      setFollowUpNotes("");
      loadData();
    } catch (err: any) {
      alert("Error scheduling follow-up: " + err.message);
    }
  };

  // Medicine status update
  const handleMedicineStatusToggle = async (med: Medicine, newStatus: string) => {
    try {
      const updated = await api.updateMedicine(facilityId, med.id, {
        status: newStatus
      });
      setMedicines(prev => prev.map(m => m.id === med.id ? updated : m));
    } catch (err: any) {
      alert("Error updating medicine: " + err.message);
    }
  };

  // Diagnostic status update
  const handleDiagnosticStatusToggle = async (diag: Diagnostic, newStatus: string) => {
    try {
      const updated = await api.updateDiagnostic(facilityId, diag.id, {
        status: newStatus
      });
      setDiagnostics(prev => prev.map(d => d.id === diag.id ? updated : d));
    } catch (err: any) {
      alert("Error updating diagnostic test: " + err.message);
    }
  };

  // Filtered referrals by queue state
  const incomingList = referrals.filter(r => r.current_status === 'REFERRED');
  const acceptedList = referrals.filter(r => r.current_status === 'ACCEPTED');
  const admittedList = referrals.filter(r => r.current_status === 'PATIENT_RECEIVED');
  const treatedList = referrals.filter(r => r.current_status === 'TREATMENT_COMPLETED');
  const followUpQueueList = referrals.filter(r => r.current_status === 'FOLLOW_UP_REQUIRED');
  const completedList = referrals.filter(r => r.current_status === 'CLOSED');

  const getFilteredReferrals = () => {
    switch (queueFilter) {
      case 'INCOMING': return incomingList;
      case 'ACCEPTED': return acceptedList;
      case 'ADMITTED': return admittedList;
      case 'TREATED': return treatedList;
      case 'ALL':
      default:
        return referrals;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-xs font-semibold border border-purple-200">
            <Building2 className="w-3.5 h-3.5" />
            <span>Hospital Receiving Facility Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {facility?.name || "Chandanpur District Hospital"}
          </h1>
          <p className="text-xs text-slate-500">
            {facility?.type} • {facility?.district} • Hours: {facility?.operating_hours}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'queue'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Triage & Inflow Queue
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Medicine Stock</span>
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'diagnostics'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Lab Tests</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Incoming Triage"
          value={incomingList.length}
          subtitle="Awaiting hospital acceptance"
          icon={<Inbox className="w-5 h-5" />}
          variant="amber"
          alert={incomingList.length > 0}
        />
        <StatCard
          title="Accepted & In-Transit"
          value={acceptedList.length}
          subtitle="En route from PHC/CHC"
          icon={<Clock className="w-5 h-5" />}
          variant="blue"
        />
        <StatCard
          title="Admitted / Checked In"
          value={admittedList.length}
          subtitle="Currently in ward / OT"
          icon={<UserCheck className="w-5 h-5" />}
          variant="purple"
        />
        <StatCard
          title="Discharge / Follow-up"
          value={treatedList.length}
          subtitle="Awaiting follow-up setup"
          icon={<Calendar className="w-5 h-5" />}
          variant="rose"
        />
        <StatCard
          title="Closed Journeys"
          value={completedList.length}
          subtitle="Full continuity finished"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="emerald"
        />
      </div>

      {/* TAB 1: REFERRAL TRIAGE & ACTION QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          {/* Quick Sub-Filter Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={() => setQueueFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  queueFilter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Referrals ({referrals.length})
              </button>
              <button
                onClick={() => setQueueFilter('INCOMING')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  queueFilter === 'INCOMING' ? 'bg-amber-600 text-white' : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                1. Incoming ({incomingList.length})
              </button>
              <button
                onClick={() => setQueueFilter('ACCEPTED')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  queueFilter === 'ACCEPTED' ? 'bg-sky-600 text-white' : 'text-sky-700 bg-sky-50 hover:bg-sky-100'
                }`}
              >
                2. Accepted ({acceptedList.length})
              </button>
              <button
                onClick={() => setQueueFilter('ADMITTED')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  queueFilter === 'ADMITTED' ? 'bg-purple-600 text-white' : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                }`}
              >
                3. Admitted ({admittedList.length})
              </button>
              <button
                onClick={() => setQueueFilter('TREATED')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  queueFilter === 'TREATED' ? 'bg-rose-600 text-white' : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                }`}
              >
                4. Treatment Done ({treatedList.length})
              </button>
            </div>

            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Actions instantly update shared database state
            </span>
          </div>

          {/* Cards / Table of Referrals with Direct Action Buttons */}
          <div className="space-y-3">
            {getFilteredReferrals().length === 0 ? (
              <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                No referrals in this queue stage.
              </div>
            ) : (
              getFilteredReferrals().map(ref => (
                <div
                  key={ref.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">{ref.id}</span>
                        <StatusBadge status={ref.priority} type="priority" size="sm" />
                        <StatusBadge status={ref.current_status} type="referral" size="sm" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {ref.patient_name} ({ref.patient_age}y / {ref.patient_gender})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Origin: <strong>{ref.referring_facility_name}</strong> • Village: {ref.patient_village} • Ph: {ref.patient_phone}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          const det = await api.getReferralDetail(ref.id);
                          setInspectReferral(det);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                      >
                        View Full History
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block font-medium">Requested Service:</span>
                      <span className="font-bold text-teal-800">{ref.required_service}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 sm:col-span-2">
                      <span className="text-slate-400 block font-medium">Clinical Reason:</span>
                      <span className="text-slate-800 font-medium">{ref.reason}</span>
                    </div>
                  </div>

                  {ref.clinical_notes && (
                    <div className="text-xs italic text-slate-600 bg-slate-50/70 p-2.5 rounded border border-slate-100">
                      Initial Notes: “{ref.clinical_notes}”
                    </div>
                  )}

                  {/* ACTION CONTROLS - State Machine Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span className="font-bold text-slate-700">Next Recommended Action:</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Step 1: Accept */}
                      {ref.current_status === 'REFERRED' && (
                        <button
                          onClick={() => handleTransition(ref.id, 'ACCEPTED', 'Facility confirmed specialist bed & triage readiness.')}
                          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept Referral (Step 2)</span>
                        </button>
                      )}

                      {/* Step 2: Mark Patient Received */}
                      {ref.current_status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleTransition(ref.id, 'PATIENT_RECEIVED', 'Patient arrived at hospital triage desk; admitted to ward.')}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Mark Patient Received (Step 3)</span>
                        </button>
                      )}

                      {/* Step 3: Mark Treatment Completed */}
                      {ref.current_status === 'PATIENT_RECEIVED' && (
                        <button
                          onClick={() => handleTransition(ref.id, 'TREATMENT_COMPLETED', 'Clinical workup and in-patient treatment completed. Vitals stable for discharge.')}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <Stethoscope className="w-4 h-4" />
                          <span>Mark Treatment Completed (Step 4)</span>
                        </button>
                      )}

                      {/* Step 4: Schedule Follow-up */}
                      {ref.current_status === 'TREATMENT_COMPLETED' && (
                        <button
                          onClick={() => {
                            setScheduleModalRef(ref);
                            setFollowUpReason(`Post-discharge follow-up for ${ref.reason}`);
                          }}
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Schedule Community Follow-up (Step 5)</span>
                        </button>
                      )}

                      {/* Direct Close option if no follow-up required */}
                      {ref.current_status !== 'CLOSED' && ref.current_status !== 'REFERRED' && (
                        <button
                          onClick={() => handleTransition(ref.id, 'CLOSED', 'Referral closed directly by hospital authority.')}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Close Referral
                        </button>
                      )}

                      {ref.current_status === 'CLOSED' && (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Full Care Continuity Finished
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MEDICINE AVAILABILITY SECTION */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-600" />
                Hospital Pharmacy Formulary & Stock Manager
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Toggle stock availability to prevent blind referrals from Primary Health Centres.
              </p>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              {medicines.length} Essential Drugs Tracked
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 text-xs">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3 text-left">Medicine Name</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Current Status</th>
                  <th className="px-4 py-3 text-left">Stock Range</th>
                  <th className="px-4 py-3 text-right">Quick Stock Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {medicines.map(med => (
                  <tr key={med.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-bold text-slate-900">{med.name}</td>
                    <td className="px-4 py-3 text-slate-500">{med.category}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={med.status} type="stock" size="sm" />
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{med.quantity_range}</td>
                    <td className="px-4 py-3 text-right space-x-1.5">
                      <button
                        onClick={() => handleMedicineStatusToggle(med, 'AVAILABLE')}
                        className={`px-2 py-1 rounded text-[10px] font-bold border ${
                          med.status === 'AVAILABLE'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        In Stock
                      </button>
                      <button
                        onClick={() => handleMedicineStatusToggle(med, 'LOW_STOCK')}
                        className={`px-2 py-1 rounded text-[10px] font-bold border ${
                          med.status === 'LOW_STOCK'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Low
                      </button>
                      <button
                        onClick={() => handleMedicineStatusToggle(med, 'OUT_OF_STOCK')}
                        className={`px-2 py-1 rounded text-[10px] font-bold border ${
                          med.status === 'OUT_OF_STOCK'
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Out
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DIAGNOSTIC AVAILABILITY SECTION */}
      {activeTab === 'diagnostics' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-teal-600" />
                Laboratory & Diagnostic Services Availability
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Hospital lab tests and diagnostic imaging capacity.
              </p>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              {diagnostics.length} Diagnostic Tests
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 text-xs">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3 text-left">Diagnostic Test</th>
                  <th className="px-4 py-3 text-left">Report Turnaround</th>
                  <th className="px-4 py-3 text-left">Current Status</th>
                  <th className="px-4 py-3 text-right">Quick Status Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {diagnostics.map(diag => (
                  <tr key={diag.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-bold text-slate-900">{diag.name}</td>
                    <td className="px-4 py-3 text-slate-600">{diag.turnaround_time}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={diag.status} type="stock" size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right space-x-1.5">
                      <button
                        onClick={() => handleDiagnosticStatusToggle(diag, 'AVAILABLE')}
                        className={`px-2 py-1 rounded text-[10px] font-bold border ${
                          diag.status === 'AVAILABLE'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Available
                      </button>
                      <button
                        onClick={() => handleDiagnosticStatusToggle(diag, 'UNAVAILABLE')}
                        className={`px-2 py-1 rounded text-[10px] font-bold border ${
                          diag.status === 'UNAVAILABLE'
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Unavailable
                      </button>
                      <button
                        onClick={() => handleDiagnosticStatusToggle(diag, 'REFERRAL_REQUIRED')}
                        className={`px-2 py-1 rounded text-[10px] font-bold border ${
                          diag.status === 'REFERRAL_REQUIRED'
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Outward Ref
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SCHEDULE FOLLOW-UP MODAL */}
      {scheduleModalRef && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-orange-600 text-white flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                  Continuity Handover
                </span>
                <h3 className="text-base font-bold mt-1">Schedule Community Follow-Up</h3>
                <p className="text-xs text-orange-100">
                  Patient: {scheduleModalRef.patient_name} • {scheduleModalRef.id}
                </p>
              </div>
              <button
                onClick={() => setScheduleModalRef(null)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleFollowUp} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-orange-50 rounded-xl border border-orange-200 text-orange-950 leading-relaxed">
                <strong>Why this matters: </strong> Hospital discharge without community follow-up is where rural patients relapse. Scheduling routes a verified task back to the village ANM/ASHA.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Scheduled Follow-up Date:
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Follow-Up Reason & Clinical Objective:
                </label>
                <input
                  type="text"
                  value={followUpReason}
                  onChange={(e) => setFollowUpReason(e.target.value)}
                  placeholder="e.g. Check post-stent medication adherence & blood pressure"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assigned Community Health Worker:
                </label>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-800">
                  Sunita Devi (ANM) • Rampur PHC Sector
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Instructions for Health Worker:
                </label>
                <textarea
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  rows={2}
                  placeholder="Check systolic BP < 130, confirm patient takes aspirin daily, report if pedal edema reoccurs..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-orange-500"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setScheduleModalRef(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Assign Follow-up (Step 5)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT REFERRAL MODAL */}
      {inspectReferral && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-slate-900 text-white flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-400">
                  {inspectReferral.id}
                </span>
                <h3 className="text-lg font-bold mt-0.5">
                  {inspectReferral.patient?.name} ({inspectReferral.patient?.age}y / {inspectReferral.patient?.gender})
                </h3>
                <p className="text-xs text-slate-400">
                  Referred from: {inspectReferral.referring_facility?.name}
                </p>
              </div>
              <button
                onClick={() => setInspectReferral(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              <ReferralTimeline
                currentStatus={inspectReferral.current_status}
                history={inspectReferral.history}
              />
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setInspectReferral(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
