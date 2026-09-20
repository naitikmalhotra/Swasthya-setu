import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Appointment } from '../types';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Building2,
  Stethoscope,
  Search,
  CheckCircle2,
  Navigation,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface AppointmentsPageProps {
  onBookNew?: () => void;
  language?: 'en' | 'hi';
}

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({
  onBookNew,
  language = 'en'
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadAppointments = async (phoneFilter?: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getAppointments(phoneFilter || undefined);
      setAppointments(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to fetch appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadAppointments(searchPhone.trim());
  };

  const handleNavigate = (facilityName: string) => {
    const text =
      language === 'hi'
        ? `${facilityName} के लिए दिशा-निर्देश खोले जा रहे हैं।`
        : `Opening navigation to ${facilityName}.`;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facilityName)}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-700 text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-200 border border-teal-400/30 text-xs font-semibold uppercase tracking-wider">
              Continuity & Care Tracking
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-[11px] font-semibold">
              Demo Data
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {language === 'hi' ? 'मेरी अपॉइंटमेंट्स' : 'My Appointments'}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-1">
            {language === 'hi'
              ? 'आपके द्वारा बुक किए गए सभी अस्पताल एवं डॉक्टर परामर्श स्लॉट।'
              : 'All your booked doctor consultations and clinic visits in one place.'}
          </p>
        </div>

        {onBookNew && (
          <button
            type="button"
            onClick={onBookNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-teal-900 hover:bg-teal-50 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-teal-600" />
            <span>{language === 'hi' ? 'नया स्लॉट बुक करें' : 'Book New Slot'}</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="w-full sm:w-auto flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                language === 'hi'
                  ? 'मोबाइल नंबर से खोजें (e.g. 9876543210)...'
                  : 'Filter by phone number (e.g. 9876543210)...'
              }
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
          >
            {language === 'hi' ? 'खोजें' : 'Search'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setSearchPhone('');
            loadAppointments();
          }}
          className="p-2 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
          title="Reset and refresh all appointments"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Appointments List */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <span className="text-sm font-medium">Loading appointments...</span>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-3">
          <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">
            {language === 'hi' ? 'कोई अपॉइंटमेंट नहीं मिली' : 'No Appointments Found'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            {language === 'hi'
              ? 'आपने अभी तक कोई अपॉइंटमेंट बुक नहीं की है। AI सहायक का उपयोग करके नज़दीकी स्वास्थ्य केंद्र में स्लॉट बुक करें।'
              : 'You have not booked any appointments yet. Use the AI Assistant to find nearby centres and book slots.'}
          </p>
          {onBookNew && (
            <button
              onClick={onBookNew}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'स्लॉट बुक करें' : 'Book a Slot'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((appt) => (
            <div
              key={appt.appointment_id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 space-y-3">
                {/* Header: ID + Status */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                    {appt.appointment_id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {appt.status}
                  </span>
                </div>

                {/* Facility & Doctor Info */}
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="truncate">{appt.facility_name}</span>
                  </h3>
                  <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {appt.doctor_name} ({appt.doctor_specialty || appt.department})
                    </span>
                  </div>
                </div>

                {/* Patient & Date Meta */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate font-medium">{appt.patient_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{appt.patient_phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>{appt.appointment_date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>{appt.appointment_time}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleNavigate(appt.facility_name)}
                  className="flex-1 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'दिशा-निर्देश देखें' : 'Get Directions'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
