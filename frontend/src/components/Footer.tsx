import React from 'react';
import { HeartHandshake, ShieldAlert, CheckCircle } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { translations } from '../locales/translations';

export const Footer: React.FC = () => {
  const { language } = useRole();
  const t = translations[language];

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs mt-auto">
      {/* Disclaimer Banner */}
      <div className="bg-amber-950/40 border-b border-amber-800/40 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-3 text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs font-medium">
            <span className="font-bold text-amber-300">Hackathon Prototype Notice: </span>
            {t.sihDisclaimer} Not designed to replace eSanjeevani or ABHA/ABDM; built to solve the inter-facility continuity and follow-up closure gap.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center gap-2 text-white">
              <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <span className="font-bold text-base tracking-tight">Swasthya Setu</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              “Don’t just create a referral. Make sure the referral gets completed.”
              A continuous coordination pipeline connecting Patients, Primary Health Centres, Receiving Hospitals, and Community Health Workers.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-teal-400 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              SIH 2026 Problem Statement SIH26133
            </div>
          </div>

          <div>
            <h5 className="text-white font-semibold text-xs mb-2 uppercase tracking-wider">Demo User Roles</h5>
            <ul className="space-y-1 text-slate-400 text-[11px]">
              <li><span className="text-slate-300 font-medium">Patient:</span> patient@demo.com</li>
              <li><span className="text-slate-300 font-medium">Health Worker:</span> worker@demo.com</li>
              <li><span className="text-slate-300 font-medium">Facility:</span> facility@demo.com</li>
              <li><span className="text-slate-300 font-medium">Admin:</span> admin@demo.com</li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-xs mb-2 uppercase tracking-wider">Continuity Stages</h5>
            <p className="text-[11px] text-slate-400">
              Referred → Accepted → Received → Treatment Completed → Follow-Up Required → Follow-Up Done → Closed
            </p>
            <div className="mt-3 text-[10px] text-slate-500">
              Built for Smart India Hackathon 2026 Prototype Evaluation.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
