import React from 'react';
import { useRole } from '../context/RoleContext';
import { translations } from '../locales/translations';
import {
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Stethoscope,
  Clock,
  MapPin,
  Sparkles,
  Users,
  Activity,
  FileCheck2,
  Check
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreFacilities: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onExploreFacilities }) => {
  const { language, setRole } = useRole();
  const t = translations[language];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-900 via-slate-900 to-slate-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 rounded-b-3xl shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Smart India Hackathon 2026 • Problem Statement SIH26133</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Swasthya <span className="text-teal-400">Setu</span>
          </h1>
          <p className="text-xl sm:text-2xl font-bold text-teal-100 tracking-tight">
            “{t.tagline}”
          </p>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                setRole('patient');
                onExploreFacilities();
              }}
              className="px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-teal-500/25 transition-all flex items-center gap-2"
            >
              <span>{t.findHealthcare}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setRole('health_worker');
                onGetStarted();
              }}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold text-sm sm:text-base transition-all flex items-center gap-2"
            >
              <span>Health Worker Demo Flow</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Zero Replacement of Existing Systems</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Active Follow-up Closure Engine</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Real-Time Gap Monitoring</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Patient Journey Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            The Healthcare Continuity Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Don’t Just Refer. Complete the Journey.
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Traditional rural referrals lose up to 60% of patients between diagnosis and treatment. Swasthya Setu bridges this gap across five coordinated steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 relative">
          {[
            {
              step: "01",
              title: "Find Suitable Care",
              role: "Patient",
              desc: "Smart capability matching prevents futile visits to sub-centres without doctors."
            },
            {
              step: "02",
              title: "Initiate Referral",
              role: "Health Worker",
              desc: "ASHA / ANM issues verified referral ID with clinical reason and priority."
            },
            {
              step: "03",
              title: "Hospital Triage",
              role: "District Hospital",
              desc: "Receiving hospital confirms bed/specialist availability and admits patient."
            },
            {
              step: "04",
              title: "Community Follow-up",
              role: "ASHA / ANM",
              desc: "Post-discharge recovery task routes back to the village health worker."
            },
            {
              step: "05",
              title: "Closed Continuity",
              role: "Govt Admin",
              desc: "Audited referral loop closure eliminates drop-offs and tracks public health gaps."
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative group hover:border-teal-400 transition-all"
            >
              <span className="text-3xl font-black text-slate-200 group-hover:text-teal-500 transition-colors">
                {item.step}
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-teal-600 mt-1">
                {item.role}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* The Problem vs Our Solution */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Problem */}
          <div className="p-6 sm:p-8 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-4">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-base">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>The Problem: The Rural Referral Black Hole</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              In underserved areas, paper referral slips or informal advice lead to major failures:
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">✕</span>
                <span>Patients travel 30km to basic sub-centres only to find no doctors or lab facilities.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">✕</span>
                <span>Once a referral is given, health workers have zero visibility if the patient reached the hospital.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">✕</span>
                <span>After hospital discharge, no follow-up occurs at home, causing relapse and preventable readmission.</span>
              </li>
            </ul>
          </div>

          {/* Solution */}
          <div className="p-6 sm:p-8 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-4">
            <div className="flex items-center gap-2 text-teal-900 font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span>Our Solution: Swasthya Setu Coordination Layer</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Complements existing government systems by enforcing an end-to-end continuity loop:
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-teal-200 text-teal-800 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0"><Check className="w-3 h-3" /></span>
                <span><strong>Capability-based Matching:</strong> Steers cardiac or surgical cases straight to equipped CHC/DH.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-teal-200 text-teal-800 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0"><Check className="w-3 h-3" /></span>
                <span><strong>Live 7-Stage State Machine:</strong> Tracks patient arrival, admission, surgery, and discharge.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-teal-200 text-teal-800 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0"><Check className="w-3 h-3" /></span>
                <span><strong>Closed-Loop Follow-ups:</strong> Automatically pushes post-discharge tasks to village ANM/ASHA.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Target Roles Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-8">
          Explore Portals by Role
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => { setRole('patient'); onExploreFacilities(); }}
            className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md cursor-pointer transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Patient Portal</h3>
              <p className="text-xs text-slate-500 mt-1">
                Bilingual (EN/HI) accessible interface for rural citizens to find suitable care and track their referral.
              </p>
            </div>
            <div className="text-xs font-semibold text-blue-600 flex items-center gap-1">
              <span>Open Patient Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => { setRole('health_worker'); onGetStarted(); }}
            className="p-5 rounded-xl border border-slate-200 bg-white hover:border-teal-400 hover:shadow-md cursor-pointer transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Health Worker Portal</h3>
              <p className="text-xs text-slate-500 mt-1">
                Dashboard for ANM, ASHA, and CHO to create referrals and complete assigned post-treatment follow-ups.
              </p>
            </div>
            <div className="text-xs font-semibold text-teal-600 flex items-center gap-1">
              <span>Open Worker Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => { setRole('facility'); onGetStarted(); }}
            className="p-5 rounded-xl border border-slate-200 bg-white hover:border-purple-400 hover:shadow-md cursor-pointer transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Hospital Facility Portal</h3>
              <p className="text-xs text-slate-500 mt-1">
                Queue for incoming referrals, bed triage, clinical care discharge notes, and follow-up scheduling.
              </p>
            </div>
            <div className="text-xs font-semibold text-purple-600 flex items-center gap-1">
              <span>Open Facility Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => { setRole('admin'); onGetStarted(); }}
            className="p-5 rounded-xl border border-slate-200 bg-white hover:border-rose-400 hover:shadow-md cursor-pointer transition-all space-y-3"
          >
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Admin Gap Analytics</h3>
              <p className="text-xs text-slate-500 mt-1">
                District-wide oversight of referral completion rates, medicine stockouts, and facility health matrix.
              </p>
            </div>
            <div className="text-xs font-semibold text-rose-600 flex items-center gap-1">
              <span>Open Admin Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
