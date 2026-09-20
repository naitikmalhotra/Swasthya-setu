import React from 'react';
import { Facility, FacilityRecommendation, NearbyFacility } from '../types';
import {
  Building2,
  MapPin,
  Clock,
  Phone,
  Stethoscope,
  Pill,
  FlaskConical,
  Siren,
  Check,
  X,
  AlertTriangle,
  Award,
  ChevronRight,
  Navigation,
  CalendarCheck,
  Volume2
} from 'lucide-react';

interface FacilityCardProps {
  facility: Facility | FacilityRecommendation | NearbyFacility;
  onSelect?: (fac: Facility) => void;
  onBookSlot?: (fac: Facility) => void;
  language?: 'en' | 'hi';
}

export const FacilityCard: React.FC<FacilityCardProps> = ({
  facility,
  onSelect,
  onBookSlot,
  language = 'en'
}) => {
  const isRec = 'is_recommended' in facility ? (facility as FacilityRecommendation).is_recommended : true;
  const score = 'match_score' in facility ? (facility as FacilityRecommendation).match_score : null;
  const reason = 'recommendation_reason' in facility ? (facility as FacilityRecommendation).recommendation_reason : null;
  const flags = 'suitability_flags' in facility ? (facility as FacilityRecommendation).suitability_flags : [];

  const distanceKm = 'distance_km' in facility ? (facility as NearbyFacility).distance_km : null;
  const etaMinutes = 'eta_minutes' in facility ? (facility as NearbyFacility).eta_minutes : null;

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Voice navigation announcement via SpeechSynthesis if supported
    if ('speechSynthesis' in window) {
      const text =
        language === 'hi'
          ? `${facility.name} के लिए दिशा-निर्देश खोले जा रहे हैं। यह लगभग ${distanceKm || ''} किलोमीटर दूर है।`
          : `Opening navigation to ${facility.name}. It is approximately ${distanceKm || ''} kilometers away. Estimated travel time is ${etaMinutes || ''} minutes.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 bg-white overflow-hidden shadow-sm hover:shadow-md ${
        isRec
          ? 'border-slate-200 ring-1 ring-teal-500/20'
          : 'border-amber-200/80 bg-amber-50/10'
      }`}
    >
      {/* Top Banner for Recommendation Context */}
      {score !== null && (
        <div
          className={`px-4 py-2 text-xs font-medium flex items-center justify-between border-b ${
            isRec
              ? 'bg-teal-50/80 text-teal-900 border-teal-100'
              : 'bg-amber-50 text-amber-900 border-amber-200'
          }`}
        >
          <div className="flex items-center gap-1.5 font-semibold">
            {isRec ? (
              <>
                <Award className="w-4 h-4 text-teal-600" />
                <span>Suitable Facility Recommendation</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Capability Notice: Referral May Be Required</span>
              </>
            )}
          </div>
          {score !== null && (
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                isRec ? 'bg-teal-600 text-white' : 'bg-amber-200 text-amber-800'
              }`}
            >
              {score}% Capability Fit
            </span>
          )}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                {facility.type}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {facility.district} • {facility.block}
              </span>
              {distanceKm !== null && (
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-teal-600" />
                  {distanceKm} km {etaMinutes ? `(~${etaMinutes} mins)` : ''}
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1.5">
              {facility.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              {facility.address}
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {facility.operating_hours}
            </span>
            <a
              href={`tel:${facility.phone}`}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              {facility.phone}
            </a>
          </div>
        </div>

        {/* Clinical Recommendation Reason Note */}
        {reason && (
          <div
            className={`mt-3 p-2.5 rounded-lg text-xs leading-relaxed border ${
              isRec
                ? 'bg-slate-50 text-slate-700 border-slate-200'
                : 'bg-amber-50/70 text-amber-900 border-amber-200'
            }`}
          >
            <span className="font-semibold text-slate-800">
              {isRec ? 'Why Recommended: ' : 'Advisory: '}
            </span>
            {reason}
          </div>
        )}

        {/* Live Availability Status Indicators */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-50 border border-slate-100">
            <Stethoscope className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] text-slate-600">Doctor:</span>
            {facility.doctor_available ? (
              <span className="font-semibold text-emerald-700 flex items-center text-[11px]">
                <Check className="w-3 h-3" /> Available
              </span>
            ) : (
              <span className="font-semibold text-rose-700 flex items-center text-[11px]">
                <X className="w-3 h-3" /> Off-duty
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-50 border border-slate-100">
            <Pill className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] text-slate-600">Pharmacy:</span>
            {facility.pharmacy_available ? (
              <span className="font-semibold text-emerald-700 flex items-center text-[11px]">
                <Check className="w-3 h-3" /> Stocked
              </span>
            ) : (
              <span className="font-semibold text-rose-700 flex items-center text-[11px]">
                <X className="w-3 h-3" /> Shortage
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-50 border border-slate-100">
            <FlaskConical className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] text-slate-600">Diagnostics:</span>
            {facility.diagnostics_available ? (
              <span className="font-semibold text-emerald-700 flex items-center text-[11px]">
                <Check className="w-3 h-3" /> Active
              </span>
            ) : (
              <span className="font-semibold text-amber-700 flex items-center text-[11px]">
                <X className="w-3 h-3" /> Referral
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 p-1.5 rounded bg-slate-50 border border-slate-100">
            <Siren className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] text-slate-600">Emergency:</span>
            {facility.emergency_available ? (
              <span className="font-semibold text-emerald-700 flex items-center text-[11px]">
                <Check className="w-3 h-3" /> 24x7
              </span>
            ) : (
              <span className="font-medium text-slate-500 text-[11px]">
                OPD Only
              </span>
            )}
          </div>
        </div>

        {/* Services Badges */}
        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Services:</span>
          {facility.services.slice(0, 5).map((s, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium"
            >
              {s}
            </span>
          ))}
          {facility.services.length > 5 && (
            <span className="text-[10px] text-slate-500 font-medium">
              +{facility.services.length - 5} more
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          {/* Navigation Action with Voice & Maps */}
          <button
            type="button"
            onClick={handleNavigate}
            title="Open Google Maps directions with voice announcement"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'रास्ता देखें' : 'Get Directions'}</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Slot Booking Action */}
            {onBookSlot && (
              <button
                type="button"
                onClick={() => onBookSlot(facility)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'स्लॉट बुक करें' : 'Book Slot'}</span>
              </button>
            )}

            {/* Profile / Details Action */}
            {onSelect && (
              <button
                type="button"
                onClick={() => onSelect(facility)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <span>{language === 'hi' ? 'विवरण' : 'Details'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

