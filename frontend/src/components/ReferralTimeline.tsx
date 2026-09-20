import React from 'react';
import { ReferralHistory } from '../types';
import { CheckCircle2, Clock, CircleDot, AlertCircle, ArrowRight } from 'lucide-react';

interface ReferralTimelineProps {
  currentStatus: string;
  history?: ReferralHistory[];
}

interface StepDef {
  key: string;
  label: string;
  shortDesc: string;
}

const STAGES: StepDef[] = [
  { key: 'REFERRED', label: '1. Referred', shortDesc: 'Referral Created' },
  { key: 'ACCEPTED', label: '2. Accepted', shortDesc: 'Hospital Triage' },
  { key: 'PATIENT_RECEIVED', label: '3. Patient Received', shortDesc: 'In-person Check-in' },
  { key: 'TREATMENT_COMPLETED', label: '4. Treatment Completed', shortDesc: 'Clinical Care Delivered' },
  { key: 'FOLLOW_UP_REQUIRED', label: '5. Follow-Up Required', shortDesc: 'Community Task Created' },
  { key: 'FOLLOW_UP_COMPLETED', label: '6. Follow-Up Done', shortDesc: 'ASHA/ANM Home Check' },
  { key: 'CLOSED', label: '7. Closed & Complete', shortDesc: 'Continuity Cycle Finished' }
];

export const ReferralTimeline: React.FC<ReferralTimelineProps> = ({ currentStatus, history = [] }) => {
  const currentIdx = STAGES.findIndex(s => s.key === currentStatus.toUpperCase());
  const activeIndex = currentIdx === -1 ? 0 : currentIdx;

  // Build a lookup map of history entries by stage
  const historyMap = new Map<string, ReferralHistory>();
  history.forEach(h => {
    historyMap.set(h.status.toUpperCase(), h);
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CircleDot className="w-4 h-4 text-teal-600" />
            Referral Journey & Continuity Pipeline
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrating end-to-end patient transit from primary centre through treatment and community follow-up.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 rounded-full text-xs font-semibold text-teal-800">
          <Clock className="w-3.5 h-3.5" />
          <span>Stage {activeIndex + 1} of 7</span>
        </div>
      </div>

      {/* Horizontal Step Bar (Desktop) */}
      <div className="hidden lg:grid grid-cols-7 gap-2 my-6 relative">
        {/* Connecting line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0">
          <div
            className="h-full bg-teal-600 transition-all duration-500"
            style={{ width: `${(activeIndex / (STAGES.length - 1)) * 100}%` }}
          ></div>
        </div>

        {STAGES.map((step, idx) => {
          const isDone = idx < activeIndex || (idx === activeIndex && currentStatus === 'CLOSED');
          const isCurrent = idx === activeIndex && currentStatus !== 'CLOSED';
          const isUpcoming = idx > activeIndex;

          return (
            <div key={step.key} className="flex flex-col items-center text-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                  isDone
                    ? 'bg-teal-600 text-white ring-4 ring-teal-50'
                    : isCurrent
                    ? 'bg-white border-2 border-teal-600 text-teal-700 ring-4 ring-teal-100 animate-pulse'
                    : 'bg-white border border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>
              <span className={`text-xs mt-2 font-semibold ${isCurrent ? 'text-teal-700 font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                {step.label}
              </span>
              <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                {step.shortDesc}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detailed Vertical Log */}
      <div className="mt-4 space-y-3">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Audit Trail & Stage Logs</h5>
        <div className="space-y-2.5">
          {STAGES.map((step, idx) => {
            const histEntry = historyMap.get(step.key);
            const isPassed = idx <= activeIndex;
            const isCurrent = idx === activeIndex && currentStatus !== 'CLOSED';

            if (!histEntry && !isCurrent) {
              return null; // Don't crowd vertical log with future empty steps
            }

            return (
              <div
                key={step.key}
                className={`p-3.5 rounded-lg border text-xs transition-all ${
                  isCurrent
                    ? 'bg-teal-50/50 border-teal-300 shadow-sm'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        histEntry ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800">{step.label}</span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-[10px] bg-teal-100 text-teal-800 font-semibold rounded-full">
                        Current Active Stage
                      </span>
                    )}
                  </div>
                  {histEntry && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(histEntry.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>

                {histEntry ? (
                  <div className="mt-2 pl-7 grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="text-slate-400">Facility / Actor: </span>
                      <span className="font-medium text-slate-700">
                        {histEntry.action_by_name} ({histEntry.action_by_role})
                      </span>
                    </div>
                    {histEntry.note && (
                      <div className="sm:col-span-2 bg-white/70 p-2 rounded border border-slate-100 italic text-slate-600">
                        “{histEntry.note}”
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-1 pl-7 text-slate-500 italic">
                    Awaiting facility/worker action in portal...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
