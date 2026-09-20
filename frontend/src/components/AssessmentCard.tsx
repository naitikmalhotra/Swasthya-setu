import React from 'react';
import { SymptomAssessment } from '../types';
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  Stethoscope,
  Building2,
  ArrowRight,
  Info,
  PhoneCall
} from 'lucide-react';

interface AssessmentCardProps {
  assessment: SymptomAssessment;
  onFindCentres?: (centreType: string, urgency: string) => void;
  language?: 'en' | 'hi';
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
  assessment,
  onFindCentres,
  language = 'en'
}) => {
  const getUrgencyConfig = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'emergency':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-900',
          badge: 'bg-rose-600 text-white animate-pulse',
          icon: <ShieldAlert className="w-5 h-5 text-rose-600" />,
          label: language === 'hi' ? 'आपातकालीन / तुरंत 108 पर कॉल करें' : 'EMERGENCY / Seek Immediate Care',
          color: 'rose'
        };
      case 'high':
        return {
          bg: 'bg-orange-50 border-orange-200 text-orange-900',
          badge: 'bg-orange-600 text-white',
          icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
          label: language === 'hi' ? 'उच्च / आज ही अस्पताल जाएं' : 'HIGH / Visit Centre Today',
          color: 'orange'
        };
      case 'moderate':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-900',
          badge: 'bg-amber-500 text-slate-900 font-bold',
          icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
          label: language === 'hi' ? 'मध्यम / 24 घंटे में डॉक्टर से मिलें' : 'MODERATE / Consult Doctor Soon',
          color: 'amber'
        };
      default: // low
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          badge: 'bg-emerald-600 text-white',
          icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
          label: language === 'hi' ? 'कम / नियमित परामर्श' : 'LOW / Routine Consultation',
          color: 'emerald'
        };
    }
  };

  const urgencyConfig = getUrgencyConfig(assessment.urgency);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden transition-all my-4">
      {/* Urgency Alert Bar */}
      <div className={`p-4 border-b flex items-center justify-between ${urgencyConfig.bg}`}>
        <div className="flex items-center gap-2.5">
          {urgencyConfig.icon}
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {language === 'hi' ? 'अनुमानित गंभीरता स्तर' : 'Triage Urgency Classification'}
            </div>
            <div className="text-sm font-bold mt-0.5">{urgencyConfig.label}</div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${urgencyConfig.badge}`}>
          {assessment.urgency}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Emergency Alert Hotline Callout */}
        {assessment.urgency?.toLowerCase() === 'emergency' && (
          <div className="bg-rose-100 border border-rose-300 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold">
              <PhoneCall className="w-4 h-4 text-rose-600 animate-bounce" />
              <span>National Ambulance Emergency: Call 108 immediately.</span>
            </div>
            <a
              href="tel:108"
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow transition-colors"
            >
              Call 108
            </a>
          </div>
        )}

        {/* Symptoms Identified */}
        {assessment.symptoms && assessment.symptoms.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              {language === 'hi' ? 'पहचाने गए लक्षण' : 'Reported Symptoms'}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {assessment.symptoms.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Explanation & Next Steps */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {assessment.explanation}
          </p>
          {assessment.next_steps && (
            <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
              <span className="font-bold text-slate-800">
                {language === 'hi' ? 'अगला कदम: ' : 'Recommended Action: '}
              </span>
              {assessment.next_steps}
            </div>
          )}
        </div>

        {/* Possible Conditions & Recommendations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 mb-1">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              <span>{language === 'hi' ? 'अनुशंसित विशेषज्ञता' : 'Recommended Specialty'}</span>
            </div>
            <div className="text-sm font-bold text-teal-950">
              {assessment.recommended_specialty || 'General Physician'}
            </div>
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-800 mb-1">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'hi' ? 'सुझाई गई सुविधा' : 'Recommended Facility Type'}</span>
            </div>
            <div className="text-sm font-bold text-indigo-950">
              {assessment.recommended_centre_type || 'Primary Health Centre (PHC)'}
            </div>
          </div>
        </div>

        {/* Medical Safety Disclaimer */}
        <div className="flex items-start gap-2 p-3 bg-slate-100/80 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            {assessment.disclaimer ||
              '⚠️ This is an AI-assisted triage tool, not a definitive medical diagnosis. Please consult a qualified doctor for proper diagnosis and treatment.'}
          </span>
        </div>

        {/* Action Button: Find Nearby Facility */}
        {onFindCentres && (
          <button
            onClick={() =>
              onFindCentres(
                assessment.recommended_centre_type || 'PHC',
                assessment.urgency || 'Moderate'
              )
            }
            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold rounded-xl shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <span>
              {language === 'hi'
                ? 'नज़दीकी स्वास्थ्य केंद्र खोजें एवं स्लॉट बुक करें'
                : 'Find Recommended Centres & Book Slot'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
