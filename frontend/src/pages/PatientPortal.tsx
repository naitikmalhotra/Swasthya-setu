import React, { useState, useEffect } from 'react';
import { useRole } from '../context/RoleContext';
import { translations } from '../locales/translations';
import { api } from '../api/client';
import { Facility, FacilityRecommendation, Referral } from '../types';
import { FacilityCard } from '../components/FacilityCard';
import { FacilityDetailModal } from '../components/FacilityDetailModal';
import { FacilityMap } from '../components/FacilityMap';
import { ReferralTimeline } from '../components/ReferralTimeline';
import {
  Search,
  MapPin,
  Stethoscope,
  Siren,
  Calendar,
  FileText,
  Building2,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Baby,
  Heart,
  Syringe,
  Activity
} from 'lucide-react';

export const PatientPortal: React.FC = () => {
  const { language } = useRole();
  const t = translations[language];

  // Filters
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Chandanpur");
  const [selectedRequirement, setSelectedRequirement] = useState<string>("Specialist Consultation");
  const [facilities, setFacilities] = useState<FacilityRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'find' | 'track' | 'emergency' | 'map'>('find');

  // Modal
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  // Referral tracking
  const [searchRefId, setSearchRefId] = useState<string>("REF-2026-00001");
  const [trackedReferral, setTrackedReferral] = useState<Referral | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  const requirementOptions = [
    { id: "General Treatment", label: t.requirements["General Treatment"], icon: <Stethoscope className="w-5 h-5 text-teal-600" /> },
    { id: "Specialist Consultation", label: t.requirements["Specialist Consultation"], icon: <Activity className="w-5 h-5 text-indigo-600" /> },
    { id: "Maternal Care", label: t.requirements["Maternal Care"], icon: <Heart className="w-5 h-5 text-rose-600" /> },
    { id: "Child Care", label: t.requirements["Child Care"], icon: <Baby className="w-5 h-5 text-sky-600" /> },
    { id: "Diagnostic Test", label: t.requirements["Diagnostic Test"], icon: <FileText className="w-5 h-5 text-purple-600" /> },
    { id: "Vaccination", label: t.requirements["Vaccination"], icon: <Syringe className="w-5 h-5 text-emerald-600" /> },
    { id: "Emergency", label: t.requirements["Emergency"], icon: <Siren className="w-5 h-5 text-red-600" /> }
  ];

  // Load facilities on filter changes
  useEffect(() => {
    setLoading(true);
    api.getRecommendedFacilities(selectedDistrict, selectedRequirement)
      .then(data => setFacilities(data))
      .catch(err => console.error("Error loading recommendations:", err))
      .finally(() => setLoading(false));
  }, [selectedDistrict, selectedRequirement]);

  const handleTrackSearch = async () => {
    if (!searchRefId.trim()) return;
    setTrackLoading(true);
    setTrackError(null);
    try {
      // Clean query
      let queryId = searchRefId.trim().toUpperCase();
      if (queryId.startsWith("ABHA")) {
        // Find patient first
        const patients = await api.getPatients(queryId);
        if (patients.length > 0) {
          const pDetail = await api.getPatientDetail(patients[0].id);
          if (pDetail.referrals && pDetail.referrals.length > 0) {
            queryId = pDetail.referrals[0].id;
          } else {
            throw new Error("No active referrals found for this ABHA ID.");
          }
        } else {
          throw new Error("ABHA record not found.");
        }
      }

      const ref = await api.getReferralDetail(queryId);
      setTrackedReferral(ref);
    } catch (err: any) {
      setTrackError(err.message || "Referral not found. Try REF-2026-00001");
      setTrackedReferral(null);
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Patient Portal Header */}
      <div className="bg-gradient-to-r from-blue-700 via-teal-700 to-emerald-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Accessible Rural Healthcare Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.appName}: {t.findHealthcare}
          </h1>
          <p className="text-slate-100 text-xs sm:text-sm">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Large Clear Action Tabs for Rural Accessibility */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => setActiveTab('find')}
          className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
            activeTab === 'find'
              ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-200 text-teal-900 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-teal-100/70 text-teal-700 flex items-center justify-center font-bold">
            <Search className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <span className="font-bold text-sm block">{t.findHealthcare}</span>
            <span className="text-[11px] text-slate-500">Find suitable centres</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('track')}
          className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
            activeTab === 'track'
              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200 text-blue-900 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-blue-100/70 text-blue-700 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <span className="font-bold text-sm block">{t.myReferrals}</span>
            <span className="text-[11px] text-slate-500">Live journey tracking</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
            activeTab === 'map'
              ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-200 text-purple-900 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-purple-100/70 text-purple-700 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <span className="font-bold text-sm block">{t.nearbyFacilities}</span>
            <span className="text-[11px] text-slate-500">Interactive hospital map</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('emergency')}
          className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
            activeTab === 'emergency'
              ? 'bg-red-50 border-red-500 ring-2 ring-red-200 text-red-900 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-red-100/70 text-red-700 flex items-center justify-center font-bold">
            <Siren className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <span className="font-bold text-sm block">{t.emergencyServices}</span>
            <span className="text-[11px] text-slate-500">24x7 Ambulance & Trauma</span>
          </div>
        </button>
      </div>

      {/* TAB 1: FIND SUITABLE HEALTHCARE */}
      {activeTab === 'find' && (
        <div className="space-y-6">
          {/* Controls: District & Requirement */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-teal-600" />
                Step 1: Where are you located and what care do you need?
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Swasthya Setu matches clinical capabilities so you don’t get turned away after traveling.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* District Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.selectDistrict}
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  <option value="All">{t.allDistricts}</option>
                  <option value="Chandanpur">Chandanpur District</option>
                  <option value="Kishanganj">Kishanganj District</option>
                  <option value="Ramgarh">Ramgarh District</option>
                </select>
              </div>

              {/* Requirement dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.selectRequirement}
                </label>
                <select
                  value={selectedRequirement}
                  onChange={(e) => setSelectedRequirement(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  {requirementOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Requirement Pill Selector */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Quick Category Selection:
              </span>
              <div className="flex flex-wrap gap-2">
                {requirementOptions.map(opt => {
                  const isSelected = selectedRequirement === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedRequirement(opt.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.icon}
                      <span>{opt.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Care Centers in {selectedDistrict} ({facilities.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Sorted by capability suitability for <strong>"{selectedRequirement}"</strong>
                </p>
              </div>
              <span className="text-xs bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full font-semibold hidden sm:inline">
                Verified Clinical Facilities
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                Evaluating facility capabilities and doctor availability...
              </div>
            ) : facilities.length === 0 ? (
              <div className="py-16 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                No facilities found matching your selected district and requirement.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facilities.map(fac => (
                  <FacilityCard
                    key={fac.id}
                    facility={fac}
                    onSelect={(f) => setSelectedFacilityId(f.id)}
                    language={language}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TRACK REFERRAL JOURNEY */}
      {activeTab === 'track' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {t.trackReferral}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Check where your healthcare journey currently stands in real time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={searchRefId}
                onChange={(e) => setSearchRefId(e.target.value)}
                placeholder={t.enterAbhaOrRef}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleTrackSearch}
                disabled={trackLoading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>{trackLoading ? "Searching..." : t.searchBtn}</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
              <span className="font-semibold">Quick Demo IDs:</span>
              <button
                onClick={() => { setSearchRefId("REF-2026-00001"); }}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono"
              >
                REF-2026-00001 (Urgent Cardiology)
              </button>
              <button
                onClick={() => { setSearchRefId("REF-2026-00005"); }}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono"
              >
                REF-2026-00005 (Follow-up Due)
              </button>
              <button
                onClick={() => { setSearchRefId("REF-2026-00006"); }}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono"
              >
                REF-2026-00006 (Closed Cycle)
              </button>
            </div>

            {trackError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{trackError}</span>
              </div>
            )}
          </div>

          {/* Tracked Referral Details */}
          {trackedReferral && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      REFERRAL ID: {trackedReferral.id}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      {trackedReferral.patient?.name} ({trackedReferral.patient?.age}y / {trackedReferral.patient?.gender})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Village: {trackedReferral.patient?.village}, {trackedReferral.patient?.district} • Phone: {trackedReferral.patient?.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Priority</span>
                    <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${
                      trackedReferral.priority === 'Emergency' ? 'bg-red-100 text-red-800' :
                      trackedReferral.priority === 'Urgent' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {trackedReferral.priority}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block">Referred From:</span>
                    <span className="font-semibold text-slate-800">{trackedReferral.referring_facility?.name}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block">Destination Facility:</span>
                    <span className="font-semibold text-teal-800">{trackedReferral.receiving_facility?.name}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-slate-400 block font-medium">Clinical Reason:</span>
                  <span className="text-slate-800 font-semibold">{trackedReferral.reason}</span>
                  {trackedReferral.clinical_notes && (
                    <p className="mt-1 text-slate-600 italic">“{trackedReferral.clinical_notes}”</p>
                  )}
                </div>
              </div>

              {/* Visual Timeline Component */}
              <ReferralTimeline
                currentStatus={trackedReferral.current_status}
                history={trackedReferral.history}
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INTERACTIVE FACILITY MAP */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Healthcare Network Map
              </h2>
              <p className="text-xs text-slate-500">
                OpenStreetMap view of Primary Health Centres, Community Health Centres, and District Hospitals.
              </p>
            </div>
            <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              Showing <strong>{facilities.length}</strong> facilities
            </div>
          </div>

          <FacilityMap
            facilities={facilities}
            onSelectFacility={(fac) => setSelectedFacilityId(fac.id)}
          />
        </div>
      )}

      {/* TAB 4: EMERGENCY SERVICES */}
      {activeTab === 'emergency' && (
        <div className="space-y-4">
          <div className="p-6 bg-red-50 border-2 border-red-300 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
                <Siren className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-950">Emergency & Trauma Assistance</h2>
                <p className="text-xs text-red-800">
                  Direct contact to 24x7 Casualty and Government Ambulance Services
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 bg-white rounded-xl border border-red-200 shadow-xs">
                <span className="text-xs text-slate-500 font-semibold block">National Ambulance</span>
                <span className="text-2xl font-black text-red-700 block mt-0.5">108</span>
                <span className="text-[11px] text-slate-500 mt-1 block">Toll-free emergency dispatch</span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-red-200 shadow-xs">
                <span className="text-xs text-slate-500 font-semibold block">National Health Helpline</span>
                <span className="text-2xl font-black text-slate-900 block mt-0.5">104</span>
                <span className="text-[11px] text-slate-500 mt-1 block">Medical advice & referrals</span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-red-200 shadow-xs">
                <span className="text-xs text-slate-500 font-semibold block">Chandanpur DH Casualty</span>
                <span className="text-lg font-black text-slate-900 block mt-0.5">+91 94310 11001</span>
                <span className="text-[11px] text-slate-500 mt-1 block">24x7 Emergency Desk</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Facility Detail Modal */}
      <FacilityDetailModal
        facilityId={selectedFacilityId}
        onClose={() => setSelectedFacilityId(null)}
      />
    </div>
  );
};
