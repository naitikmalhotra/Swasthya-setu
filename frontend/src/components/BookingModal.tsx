import React, { useState, useEffect } from 'react';
import { Facility, FacilitySlots, AppointmentSlot, Appointment } from '../types';
import { api } from '../api/client';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Stethoscope,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight
} from 'lucide-react';

interface BookingModalProps {
  facility: Facility;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess?: (appt: Appointment) => void;
  language?: 'en' | 'hi';
}

export const BookingModal: React.FC<BookingModalProps> = ({
  facility,
  isOpen,
  onClose,
  onBookingSuccess,
  language = 'en'
}) => {
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsData, setSlotsData] = useState<FacilitySlots | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);

  // Form fields
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [chiefComplaint, setChiefComplaint] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<Appointment | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate next 7 dates for quick filter
  const today = new Date();
  const nextDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return d.toISOString().split('T')[0];
  });

  useEffect(() => {
    if (isOpen && facility) {
      loadSlots();
      // Set default selected date to tomorrow
      if (nextDates.length > 0) {
        setSelectedDate(nextDates[0]);
      }
      setBookingResult(null);
      setErrorMsg(null);
    }
  }, [isOpen, facility]);

  const loadSlots = async () => {
    setLoadingSlots(true);
    setErrorMsg(null);
    try {
      const data = await api.getFacilitySlots(facility.id);
      setSlotsData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to load appointment slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErrorMsg('Please select a time slot first.');
      return;
    }
    if (!patientName.trim() || !patientPhone.trim()) {
      setErrorMsg('Please enter patient name and mobile number.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.bookAppointment({
        slot_id: selectedSlot.slot_id,
        patient_name: patientName.trim(),
        patient_phone: patientPhone.trim(),
        patient_age: patientAge ? parseInt(patientAge, 10) : undefined,
        patient_gender: patientGender,
        chief_complaint: chiefComplaint.trim() || undefined
      });

      setBookingResult(res);
      if (onBookingSuccess) {
        onBookingSuccess(res);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to book slot. Please try another slot.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Filter slots for the selected date
  const filteredSlots =
    slotsData?.available_slots.filter((s) => s.slot_date === selectedDate) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-700 to-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <Calendar className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">
                  {language === 'hi' ? 'अपॉइंटमेंट स्लॉट बुक करें' : 'Book Appointment Slot'}
                </h3>
                <span className="text-[10px] font-semibold bg-emerald-500/30 border border-emerald-300/40 text-emerald-100 px-2 py-0.5 rounded-full">
                  Demo Data
                </span>
              </div>
              <p className="text-xs text-teal-100 line-clamp-1">{facility.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto">
          {bookingResult ? (
            /* Success confirmation screen */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900">
                  {language === 'hi' ? 'स्लॉट सफलतापूर्वक बुक हो गया!' : 'Appointment Confirmed!'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'hi'
                    ? 'कृपया निर्धारित समय पर स्वास्थ्य केंद्र पर उपस्थित हों।'
                    : 'Please arrive 15 minutes before your scheduled appointment.'}
                </p>
              </div>

              {/* Confirmation Details Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Booking ID</span>
                  <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 text-sm">
                    {bookingResult.appointment_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient</span>
                  <span className="font-semibold text-slate-800">{bookingResult.patient_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Doctor / Dept</span>
                  <span className="font-semibold text-slate-800">
                    {bookingResult.doctor_name} ({bookingResult.department})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Facility</span>
                  <span className="font-semibold text-slate-800">{bookingResult.facility_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time</span>
                  <span className="font-bold text-slate-900">
                    {bookingResult.appointment_date} at {bookingResult.appointment_time}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm"
              >
                {language === 'hi' ? 'पूर्ण करें' : 'Done'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleBook} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Step 1: Select Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. {language === 'hi' ? 'तारीख चुनें' : 'Select Date'}
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {nextDates.map((dateStr) => {
                    const d = new Date(dateStr + 'T00:00:00');
                    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNum = d.getDate();
                    const isSelected = selectedDate === dateStr;

                    return (
                      <button
                        type="button"
                        key={dateStr}
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setSelectedSlot(null);
                        }}
                        className={`flex-shrink-0 px-3 py-2 rounded-xl text-center border transition-all ${
                          isSelected
                            ? 'bg-teal-600 border-teal-700 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-[10px] uppercase font-semibold">{dayName}</div>
                        <div className="text-base font-bold">{dayNum}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Select Time Slot & Doctor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    2. {language === 'hi' ? 'समय स्लॉट एवं डॉक्टर' : 'Select Available Slot'}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {filteredSlots.length} {language === 'hi' ? 'उपलब्ध' : 'slots open'}
                  </span>
                </div>

                {loadingSlots ? (
                  <div className="py-6 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                    <span className="text-xs">Loading available slots...</span>
                  </div>
                ) : filteredSlots.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                    No slots open for this date. Please choose another date above.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {filteredSlots.map((slot) => {
                      const isSelected = selectedSlot?.slot_id === slot.slot_id;
                      return (
                        <button
                          type="button"
                          key={slot.slot_id}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 text-teal-950 font-medium'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs flex items-center gap-1 text-teal-700">
                              <Clock className="w-3 h-3" />
                              {slot.slot_time}
                            </span>
                            <span className="text-[10px] text-slate-400">{slot.doctor_qualification}</span>
                          </div>
                          <div className="text-xs font-semibold truncate">{slot.doctor_name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{slot.doctor_specialty}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 3: Patient Details */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  3. {language === 'hi' ? 'मरीज़ की जानकारी' : 'Patient Information'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {language === 'hi' ? 'पूरा नाम *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Devi"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {language === 'hi' ? 'मोबाइल नंबर *' : 'Mobile Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {language === 'hi' ? 'उम्र' : 'Age'}
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 35"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {language === 'hi' ? 'लिंग' : 'Gender'}
                    </label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {language === 'hi' ? 'मुख्य समस्या / लक्षण' : 'Chief Complaint / Symptoms'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fever, persistent cough for 3 days"
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting || !selectedSlot}
                  className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    submitting || !selectedSlot
                      ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                      : 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 shadow-md shadow-teal-600/20'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{language === 'hi' ? 'बुकिंग हो रही है...' : 'Booking Slot...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{language === 'hi' ? 'स्लॉट बुक करें' : 'Confirm & Book Appointment'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
