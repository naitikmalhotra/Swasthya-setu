import {
  UserAccount,
  Facility,
  FacilityRecommendation,
  Patient,
  Referral,
  FollowUp,
  AdminAnalytics,
  Medicine,
  Diagnostic,
  ChatMessage,
  SymptomAssessment,
  NearbyFacility,
  FacilitySlots,
  Appointment,
} from '../types';

const API_BASE = 'https://swasthya-setu-backend-2n1p.onrender.com/api';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errData.detail || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  getDemoAccounts: () => fetchApi<UserAccount[]>('/demo-accounts'),

  getFacilities: (district?: string, facilityType?: string) => {
    const params = new URLSearchParams();
    if (district) params.append('district', district);
    if (facilityType) params.append('facility_type', facilityType);
    return fetchApi<Facility[]>(`/facilities?${params.toString()}`);
  },

  getRecommendedFacilities: (district?: string, requirement?: string) => {
    const params = new URLSearchParams();
    if (district) params.append('district', district);
    if (requirement) params.append('requirement', requirement);
    return fetchApi<FacilityRecommendation[]>(`/facilities/recommend?${params.toString()}`);
  },

  getFacilityDetail: (id: string) => fetchApi<Facility & { medicines: Medicine[]; diagnostics: Diagnostic[] }>(`/facilities/${id}`),

  getPatients: (search?: string, district?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (district) params.append('district', district);
    return fetchApi<Patient[]>(`/patients?${params.toString()}`);
  },

  getPatientDetail: (id: string) => fetchApi<Patient & { referrals: any[] }>(`/patients/${id}`),

  getHealthWorkers: (facilityId?: string) => {
    const params = new URLSearchParams();
    if (facilityId) params.append('facility_id', facilityId);
    return fetchApi<any[]>(`/health-workers?${params.toString()}`);
  },

  getReferrals: (filters?: { status?: string; facilityId?: string; role?: string; priority?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.facilityId) params.append('facility_id', filters.facilityId);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.priority) params.append('priority', filters.priority);
    return fetchApi<Referral[]>(`/referrals?${params.toString()}`);
  },

  getReferralDetail: (id: string) => fetchApi<Referral>(`/referrals/${id}`),

  createReferral: (data: {
    patient_id: string;
    referring_facility_id: string;
    receiving_facility_id: string;
    referring_health_worker_id?: string;
    reason: string;
    required_service: string;
    priority: string;
    clinical_notes?: string;
  }) => fetchApi<{ id: string; status: string; message: string }>('/referrals', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  transitionReferral: (
    referralId: string,
    transitionData: {
      target_status: string;
      action_by_role: string;
      action_by_name: string;
      facility_id?: string;
      note?: string;
    }
  ) => fetchApi<{ id: string; current_status: string; message: string }>(`/referrals/${referralId}/transition`, {
    method: 'POST',
    body: JSON.stringify(transitionData),
  }),

  getFollowUps: (filters?: { status?: string; workerId?: string; dueOnly?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.workerId) params.append('worker_id', filters.workerId);
    if (filters?.dueOnly) params.append('due_only', 'true');
    return fetchApi<FollowUp[]>(`/follow-ups?${params.toString()}`);
  },

  scheduleFollowUp: (data: {
    referral_id: string;
    patient_id: string;
    scheduled_date: string;
    reason: string;
    assigned_worker_id?: string;
    assigned_facility_id?: string;
    notes?: string;
  }, creatorName = 'Facility Doctor', creatorRole = 'Facility') => {
    const params = new URLSearchParams({ creator_name: creatorName, creator_role: creatorRole });
    return fetchApi<{ id: string; referral_id: string; status: string; message: string }>(`/follow-ups?${params.toString()}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  completeFollowUp: (
    followUpId: string,
    data: { action_by_name: string; action_by_role: string; notes?: string }
  ) => fetchApi<{ id: string; status: string; message: string }>(`/follow-ups/${followUpId}/complete`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  updateMedicine: (facilityId: string, medId: number, data: { status: string; quantity_range?: string }) =>
    fetchApi<Medicine>(`/facilities/${facilityId}/medicines/${medId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateDiagnostic: (facilityId: string, diagId: number, data: { status: string; turnaround_time?: string }) =>
    fetchApi<Diagnostic>(`/facilities/${facilityId}/diagnostics/${diagId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getAdminAnalytics: () => fetchApi<AdminAnalytics>('/admin/analytics'),

  resetDemoData: () => fetchApi<{ message: string }>('/admin/reset-demo', { method: 'POST' }),

  // ── AI Healthcare Assistant ────────────────────────────────────────────────

  getAiStatus: () => fetchApi<{ ai_enabled: boolean; demo_mode: boolean; model: string; message: string }>('/ai/status'),

  aiChat: (messages: Array<{ role: string; content: string }>, language = 'en') =>
    fetchApi<{ reply: string; demo_mode: boolean }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, language }),
    }),

  aiSymptomAssessment: (symptoms: string, language = 'en') =>
    fetchApi<SymptomAssessment>('/ai/symptom-assessment', {
      method: 'POST',
      body: JSON.stringify({ symptoms, language }),
    }),

  // ── Smart Healthcare Centre Recommendation ─────────────────────────────────

  getNearbyFacilities: (lat: number, lng: number, radiusKm = 100, urgency?: string) => {
    const params = new URLSearchParams({ lat: String(lat), lng: String(lng), radius_km: String(radiusKm) });
    if (urgency) params.append('urgency', urgency);
    return fetchApi<{ count: number; facilities: NearbyFacility[] }>(`/healthcare-centres/nearby?${params}`);
  },

  // ── Appointment Slots & Booking ────────────────────────────────────────────

  getFacilitySlots: (facilityId: string, date?: string) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    return fetchApi<FacilitySlots>(`/healthcare-centres/${facilityId}/slots?${params}`);
  },

  bookAppointment: (data: {
    slot_id: number;
    patient_name: string;
    patient_phone: string;
    patient_age?: number;
    patient_gender?: string;
    chief_complaint?: string;
  }) => fetchApi<Appointment & { message: string }>('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getAppointments: (patientPhone?: string) => {
    const params = new URLSearchParams();
    if (patientPhone) params.append('patient_phone', patientPhone);
    return fetchApi<Appointment[]>(`/appointments?${params}`);
  },
};
