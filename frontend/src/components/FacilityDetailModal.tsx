import React, { useEffect, useState } from 'react';
import { Facility, Medicine, Diagnostic } from '../types';
import { api } from '../api/client';
import { StatusBadge } from './StatusBadge';
import {
  X,
  Building2,
  Phone,
  Clock,
  MapPin,
  Pill,
  FlaskConical,
  CheckCircle,
  AlertTriangle,
  Siren,
  Stethoscope
} from 'lucide-react';

interface FacilityDetailModalProps {
  facilityId: string | null;
  onClose: () => void;
}

export const FacilityDetailModal: React.FC<FacilityDetailModalProps> = ({ facilityId, onClose }) => {
  const [data, setData] = useState<(Facility & { medicines: Medicine[]; diagnostics: Diagnostic[] }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'medicines' | 'diagnostics'>('overview');

  useEffect(() => {
    if (!facilityId) return;
    setLoading(true);
    api.getFacilityDetail(facilityId)
      .then(res => setData(res))
      .catch(err => console.error("Failed to load facility detail:", err))
      .finally(() => setLoading(false));
  }, [facilityId]);

  if (!facilityId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded">
                {data?.type || "Healthcare Facility"}
              </span>
              <span className="text-xs text-slate-400">
                {data?.district} • {data?.block}
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1 tracking-tight">
              {data?.name || "Loading facility profile..."}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              {data?.address}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Services
          </button>
          <button
            onClick={() => setActiveTab('medicines')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'medicines'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Essential Medicines ({data?.medicines?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'diagnostics'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Diagnostic Tests ({data?.diagnostics?.length || 0})</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 text-xs">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading facility details...</div>
          ) : !data ? (
            <div className="py-12 text-center text-rose-500">Failed to load facility details.</div>
          ) : (
            <>
              {/* Tab: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  {/* Availability Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">Duty Doctor</span>
                      <span className="font-bold text-slate-900 mt-1 block">
                        {data.doctor_available ? "Available On-Duty" : "Off-Duty / Nursing Only"}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">Pharmacy</span>
                      <span className="font-bold text-slate-900 mt-1 block">
                        {data.pharmacy_available ? "Dispensing Open" : "Stock Shortage"}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">Laboratory</span>
                      <span className="font-bold text-slate-900 mt-1 block">
                        {data.diagnostics_available ? "Active Sample Intake" : "Referral Needed"}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-500 block">Emergency</span>
                      <span className="font-bold text-slate-900 mt-1 block">
                        {data.emergency_available ? "24x7 Trauma / Casualty" : "Daytime OPD Only"}
                      </span>
                    </div>
                  </div>

                  {/* Contact & Hours */}
                  <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-700" />
                      <span className="text-slate-700"><strong>Hours:</strong> {data.operating_hours}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-teal-700" />
                      <a href={`tel:${data.phone}`} className="font-bold text-teal-800 hover:underline">
                        {data.phone}
                      </a>
                    </div>
                  </div>

                  {/* All Services */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-2">Available Clinical Services</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {data.services.map((srv, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-medium">{srv}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Medicines */}
              {activeTab === 'medicines' && (
                <div className="space-y-3">
                  <div className="text-[11px] text-slate-500 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Demo inventory data based on primary rural formulary. Refreshed daily.</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50 text-slate-700 font-semibold text-[11px]">
                        <tr>
                          <th className="px-4 py-2.5 text-left">Medicine Name</th>
                          <th className="px-4 py-2.5 text-left">Therapeutic Category</th>
                          <th className="px-4 py-2.5 text-left">Availability Status</th>
                          <th className="px-4 py-2.5 text-left">Estimated Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {data.medicines.map(med => (
                          <tr key={med.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2.5 font-bold text-slate-800">{med.name}</td>
                            <td className="px-4 py-2.5 text-slate-500">{med.category}</td>
                            <td className="px-4 py-2.5">
                              <StatusBadge status={med.status} type="stock" size="sm" />
                            </td>
                            <td className="px-4 py-2.5 font-mono text-slate-600">{med.quantity_range}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab: Diagnostics */}
              {activeTab === 'diagnostics' && (
                <div className="space-y-3">
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    Diagnostic availability indicates in-house testing capacity versus tests that trigger outward referral.
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50 text-slate-700 font-semibold text-[11px]">
                        <tr>
                          <th className="px-4 py-2.5 text-left">Diagnostic Test</th>
                          <th className="px-4 py-2.5 text-left">Current Status</th>
                          <th className="px-4 py-2.5 text-left">Report Turnaround</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {data.diagnostics.map(diag => (
                          <tr key={diag.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2.5 font-bold text-slate-800">{diag.name}</td>
                            <td className="px-4 py-2.5">
                              <StatusBadge status={diag.status} type="stock" size="sm" />
                            </td>
                            <td className="px-4 py-2.5 text-slate-600">{diag.turnaround_time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium text-xs transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
