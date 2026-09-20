export type Role = 'patient' | 'health_worker' | 'facility' | 'admin';
export type Language = 'en' | 'hi';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: Role;
  facility_id?: string;
  district?: string;
}

export interface Facility {
  id: string;
  name: string;
  type: string;
  district: string;
  block: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  doctor_available: boolean;
  pharmacy_available: boolean;
  diagnostics_available: boolean;
  emergency_available: boolean;
  services: string[];
  operating_hours: string;
}

export interface FacilityRecommendation extends Facility {
  is_recommended: boolean;
  match_score: number;
  recommendation_reason: string;
  suitability_flags: string[];
}

export interface Patient {
  id: string;
  abha_id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  village: string;
  block: string;
  district: string;
  primary_facility_id?: string;
}

export interface ReferralHistory {
  id: number;
  status: string;
  timestamp: string;
  facility_name?: string;
  action_by_role: string;
  action_by_name: string;
  note?: string;
}

export interface Referral {
  id: string;
  patient_id: string;
  patient_name?: string;
  patient_age?: number;
  patient_gender?: string;
  patient_village?: string;
  patient_phone?: string;
  referring_facility_id: string;
  referring_facility_name?: string;
  receiving_facility_id: string;
  receiving_facility_name?: string;
  referring_health_worker_id?: string;
  referring_health_worker_name?: string;
  reason: string;
  required_service: string;
  priority: 'Routine' | 'Urgent' | 'Emergency';
  current_status: 'REFERRED' | 'ACCEPTED' | 'PATIENT_RECEIVED' | 'TREATMENT_COMPLETED' | 'FOLLOW_UP_REQUIRED' | 'FOLLOW_UP_COMPLETED' | 'CLOSED';
  clinical_notes?: string;
  created_at: string;
  updated_at: string;
  patient?: Partial<Patient>;
  referring_facility?: { id: string; name: string; type?: string; district?: string };
  receiving_facility?: { id: string; name: string; type?: string; district?: string };
  history?: ReferralHistory[];
  follow_ups?: FollowUp[];
}

export interface FollowUp {
  id: string;
  referral_id: string;
  patient_id: string;
  patient_name?: string;
  patient_village?: string;
  patient_phone?: string;
  assigned_worker_id?: string;
  assigned_worker_name?: string;
  assigned_facility_id?: string;
  assigned_facility_name?: string;
  scheduled_date: string;
  reason: string;
  status: 'UPCOMING' | 'DUE' | 'COMPLETED' | 'OVERDUE';
  completion_date?: string;
  notes?: string;
  created_at: string;
}

export interface Medicine {
  id: number;
  facility_id: string;
  name: string;
  category: string;
  status: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  quantity_range: string;
  last_updated: string;
}

export interface Diagnostic {
  id: number;
  facility_id: string;
  name: string;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'REFERRAL_REQUIRED';
  turnaround_time: string;
  last_updated: string;
}

export interface FacilityHealthMetric {
  facility_id: string;
  facility_name: string;
  district: string;
  type: string;
  doctor_status: boolean;
  medicine_shortages: number;
  diagnostic_gaps: number;
  active_referrals: number;
  overdue_follow_ups: number;
  health_status: 'GOOD' | 'WARNING' | 'CRITICAL';
}

export interface AdminAnalytics {
  total_facilities: number;
  total_patients: number;
  total_referrals: number;
  active_referrals: number;
  pending_referrals: number;
  completed_referrals: number;
  follow_ups_due: number;
  overdue_follow_ups: number;
  medicine_shortages_count: number;
  diagnostic_gaps_count: number;
  completion_rate_percentage: number;
  status_distribution: Record<string, number>;
  referrals_by_facility: Array<{
    facility_id: string;
    facility_name: string;
    type: string;
    district: string;
    count: number;
  }>;
  funnel_stages: Array<{
    stage: string;
    count: number;
    description: string;
  }>;
  facility_metrics: FacilityHealthMetric[];
  disclaimer: string;
}

// ── AI Healthcare Assistant ────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SymptomAssessment {
  symptoms: string[];
  possible_conditions: string[];
  urgency: 'Low' | 'Moderate' | 'High' | 'Emergency';
  recommended_specialty: string;
  recommended_centre_type: string;
  explanation: string;
  next_steps: string;
  disclaimer: string;
  _demo?: boolean;
  _error?: string;
}

// ── Smart Healthcare Centre Recommendation ────────────────────────────────────

export interface NearbyFacility extends Facility {
  distance_km: number;
  eta_minutes: number;
  maps_url: string;
}

// ── Appointment Booking ────────────────────────────────────────────────────────

export interface AppointmentSlot {
  slot_id: number;
  slot_date: string;         // YYYY-MM-DD
  slot_time: string;         // HH:MM
  doctor_id: string;
  doctor_name: string;
  doctor_specialty: string;
  doctor_qualification: string;
  facility_id: string;
  is_booked: boolean;
}

export interface DoctorInfo {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  available_days: string;
}

export interface FacilitySlots {
  facility_id: string;
  facility_name: string;
  doctors: DoctorInfo[];
  available_slots: AppointmentSlot[];
  total_available: number;
  _demo: boolean;
}

export interface Appointment {
  appointment_id: string;   // APPT-2026-XXXXX
  patient_name: string;
  patient_phone: string;
  doctor_name: string;
  doctor_specialty: string;
  facility_name: string;
  facility_id: string;
  appointment_date: string;
  appointment_time: string;
  department: string;
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
}

