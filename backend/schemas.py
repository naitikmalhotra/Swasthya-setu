from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

class UserBase(BaseModel):
    id: str
    email: str
    name: str
    role: str
    facility_id: Optional[str] = None
    district: Optional[str] = None

    class Config:
        from_attributes = True

class FacilityBase(BaseModel):
    id: str
    name: str
    type: str
    district: str
    block: str
    address: str
    latitude: float
    longitude: float
    phone: str
    doctor_available: bool
    pharmacy_available: bool
    diagnostics_available: bool
    emergency_available: bool
    services: List[str]
    operating_hours: str

    class Config:
        from_attributes = True

class FacilityRecommendation(FacilityBase):
    is_recommended: bool
    match_score: int
    recommendation_reason: str
    suitability_flags: List[str]

class PatientBase(BaseModel):
    id: str
    abha_id: str
    name: str
    age: int
    gender: str
    phone: str
    village: str
    block: str
    district: str
    primary_facility_id: Optional[str] = None

    class Config:
        from_attributes = True

class HealthWorkerBase(BaseModel):
    id: str
    user_id: Optional[str] = None
    name: str
    designation: str
    assigned_facility_id: str
    phone: str

    class Config:
        from_attributes = True

class ReferralStatusHistoryBase(BaseModel):
    id: int
    referral_id: str
    status: str
    timestamp: datetime
    facility_id: Optional[str] = None
    facility_name: Optional[str] = None
    action_by_role: str
    action_by_name: str
    note: Optional[str] = None

    class Config:
        from_attributes = True

class FollowUpBase(BaseModel):
    id: str
    referral_id: str
    patient_id: str
    patient_name: Optional[str] = None
    patient_village: Optional[str] = None
    patient_phone: Optional[str] = None
    assigned_worker_id: Optional[str] = None
    assigned_worker_name: Optional[str] = None
    assigned_facility_id: Optional[str] = None
    assigned_facility_name: Optional[str] = None
    scheduled_date: str
    reason: str
    status: str
    completion_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ReferralCreate(BaseModel):
    patient_id: str
    referring_facility_id: str
    receiving_facility_id: str
    referring_health_worker_id: Optional[str] = None
    reason: str
    required_service: str
    priority: str = "Routine"
    clinical_notes: Optional[str] = None

class ReferralTransition(BaseModel):
    target_status: str
    action_by_role: str
    action_by_name: str
    facility_id: Optional[str] = None
    note: Optional[str] = None

class ReferralResponse(BaseModel):
    id: str
    patient_id: str
    patient: Optional[PatientBase] = None
    referring_facility_id: str
    referring_facility_name: Optional[str] = None
    receiving_facility_id: str
    receiving_facility_name: Optional[str] = None
    referring_health_worker_id: Optional[str] = None
    referring_health_worker_name: Optional[str] = None
    reason: str
    required_service: str
    priority: str
    current_status: str
    clinical_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    history: List[ReferralStatusHistoryBase] = []
    follow_ups: List[FollowUpBase] = []

    class Config:
        from_attributes = True

class FollowUpCreate(BaseModel):
    referral_id: str
    patient_id: str
    scheduled_date: str  # YYYY-MM-DD
    reason: str
    assigned_worker_id: Optional[str] = None
    assigned_facility_id: Optional[str] = None
    notes: Optional[str] = None

class FollowUpComplete(BaseModel):
    action_by_name: str
    action_by_role: str
    notes: Optional[str] = None

class MedicineBase(BaseModel):
    id: int
    facility_id: str
    name: str
    category: str
    status: str
    quantity_range: str
    last_updated: datetime

    class Config:
        from_attributes = True

class MedicineUpdate(BaseModel):
    status: str
    quantity_range: Optional[str] = None

class DiagnosticBase(BaseModel):
    id: int
    facility_id: str
    name: str
    status: str
    turnaround_time: str
    last_updated: datetime

    class Config:
        from_attributes = True

class DiagnosticUpdate(BaseModel):
    status: str
    turnaround_time: Optional[str] = None

class FacilityHealthMetric(BaseModel):
    facility_id: str
    facility_name: str
    district: str
    type: str
    doctor_status: bool
    medicine_shortages: int
    diagnostic_gaps: int
    active_referrals: int
    overdue_follow_ups: int
    health_status: str  # GOOD, WARNING, CRITICAL

class AdminAnalytics(BaseModel):
    total_facilities: int
    total_patients: int
    total_referrals: int
    active_referrals: int
    pending_referrals: int
    completed_referrals: int
    follow_ups_due: int
    overdue_follow_ups: int
    medicine_shortages_count: int
    diagnostic_gaps_count: int
    completion_rate_percentage: float
    status_distribution: Dict[str, int]
    referrals_by_facility: List[Dict[str, Any]]
    funnel_stages: List[Dict[str, Any]]
    facility_metrics: List[FacilityHealthMetric]
    disclaimer: str = "Prototype for Smart India Hackathon demonstration. Uses fictional demo data and is not a medical diagnostic system."
