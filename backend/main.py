from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import math

from database import engine, Base, get_db
import models
import schemas
import crud
from seed_data import seed_database

# New modules for AI + Appointments
import appointment_models
import appointment_crud
import ai_service

# Create all tables on startup (existing + new appointment tables)
Base.metadata.create_all(bind=engine)
appointment_models.Doctor.metadata.create_all(bind=engine)

app = FastAPI(
    title="Swasthya Setu API",
    description="Digital healthcare coordination and care-continuity platform for rural and underserved communities.",
    version="2.0.0"
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # Seed referral/facility data if DB is empty
    from database import SessionLocal
    db = SessionLocal()
    fac_count = db.query(models.Facility).count()
    db.close()
    if fac_count == 0:
        print("Empty database detected. Auto-seeding initial demo data...")
        seed_database()

    # Seed appointment demo data (doctors + slots)
    db2 = SessionLocal()
    try:
        appointment_crud.seed_appointment_data(db2)
    finally:
        db2.close()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Swasthya Setu API",
        "version": "1.0.0",
        "tagline": "Connecting Care. Completing Journeys."
    }

# --- DEMO ACCOUNTS & USER PROFILES ---
@app.get("/api/demo-accounts", response_model=List[schemas.UserBase])
def get_demo_accounts(db: Session = Depends(get_db)):
    return crud.get_users(db)

# --- FACILITIES & SMART RECOMMENDATIONS ---
@app.get("/api/facilities")
def list_facilities(
    district: Optional[str] = Query(None),
    facility_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    facilities = crud.get_facilities(db, district=district, facility_type=facility_type)
    result = []
    for f in facilities:
        result.append({
            "id": f.id,
            "name": f.name,
            "type": f.type,
            "district": f.district,
            "block": f.block,
            "address": f.address,
            "latitude": f.latitude,
            "longitude": f.longitude,
            "phone": f.phone,
            "doctor_available": f.doctor_available,
            "pharmacy_available": f.pharmacy_available,
            "diagnostics_available": f.diagnostics_available,
            "emergency_available": f.emergency_available,
            "services": json.loads(f.services) if f.services else [],
            "operating_hours": f.operating_hours
        })
    return result

@app.get("/api/facilities/recommend", response_model=List[schemas.FacilityRecommendation])
def get_recommended_facilities(
    district: Optional[str] = Query(None),
    requirement: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return crud.recommend_facilities(db, district=district, requirement=requirement)

@app.get("/api/facilities/{facility_id}")
def get_facility_detail(facility_id: str, db: Session = Depends(get_db)):
    fac = crud.get_facility(db, facility_id)
    if not fac:
        raise HTTPException(status_code=404, detail="Facility not found")
    
    meds = crud.get_medicines_by_facility(db, facility_id)
    diags = crud.get_diagnostics_by_facility(db, facility_id)

    return {
        "id": fac.id,
        "name": fac.name,
        "type": fac.type,
        "district": fac.district,
        "block": fac.block,
        "address": fac.address,
        "latitude": fac.latitude,
        "longitude": fac.longitude,
        "phone": fac.phone,
        "doctor_available": fac.doctor_available,
        "pharmacy_available": fac.pharmacy_available,
        "diagnostics_available": fac.diagnostics_available,
        "emergency_available": fac.emergency_available,
        "services": json.loads(fac.services) if fac.services else [],
        "operating_hours": fac.operating_hours,
        "medicines": meds,
        "diagnostics": diags
    }

# --- MEDICINES & DIAGNOSTICS MANAGEMENT ---
@app.get("/api/facilities/{facility_id}/medicines", response_model=List[schemas.MedicineBase])
def get_facility_medicines(facility_id: str, db: Session = Depends(get_db)):
    return crud.get_medicines_by_facility(db, facility_id)

@app.put("/api/facilities/{facility_id}/medicines/{med_id}", response_model=schemas.MedicineBase)
def update_facility_medicine(
    facility_id: str,
    med_id: int,
    med_in: schemas.MedicineUpdate,
    db: Session = Depends(get_db)
):
    med = crud.update_medicine(db, med_id, med_in)
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return med

@app.get("/api/facilities/{facility_id}/diagnostics", response_model=List[schemas.DiagnosticBase])
def get_facility_diagnostics(facility_id: str, db: Session = Depends(get_db)):
    return crud.get_diagnostics_by_facility(db, facility_id)

@app.put("/api/facilities/{facility_id}/diagnostics/{diag_id}", response_model=schemas.DiagnosticBase)
def update_facility_diagnostic(
    facility_id: str,
    diag_id: int,
    diag_in: schemas.DiagnosticUpdate,
    db: Session = Depends(get_db)
):
    diag = crud.update_diagnostic(db, diag_id, diag_in)
    if not diag:
        raise HTTPException(status_code=404, detail="Diagnostic service not found")
    return diag

# --- PATIENTS ---
@app.get("/api/patients", response_model=List[schemas.PatientBase])
def list_patients(
    search: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return crud.get_patients(db, search=search, district=district)

@app.get("/api/patients/{patient_id}")
def get_patient_profile(patient_id: str, db: Session = Depends(get_db)):
    patient = crud.get_patient(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Also fetch patient's active and past referrals
    referrals = db.query(models.Referral).filter(models.Referral.patient_id == patient_id).order_by(models.Referral.created_at.desc()).all()
    ref_list = []
    for r in referrals:
        ref_list.append({
            "id": r.id,
            "current_status": r.current_status,
            "required_service": r.required_service,
            "referring_facility": r.referring_facility.name if r.referring_facility else "N/A",
            "receiving_facility": r.receiving_facility.name if r.receiving_facility else "N/A",
            "created_at": r.created_at
        })

    return {
        "id": patient.id,
        "abha_id": patient.abha_id,
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "phone": patient.phone,
        "village": patient.village,
        "block": patient.block,
        "district": patient.district,
        "referrals": ref_list
    }

# --- HEALTH WORKERS ---
@app.get("/api/health-workers", response_model=List[schemas.HealthWorkerBase])
def list_health_workers(
    facility_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return crud.get_health_workers(db, facility_id=facility_id)

# --- REFERRALS & CONTINUITY WORKFLOW ---
@app.get("/api/referrals")
def list_referrals(
    status: Optional[str] = Query(None),
    facility_id: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    referrals = crud.get_referrals(db, status=status, facility_id=facility_id, role=role, priority=priority)
    result = []
    for r in referrals:
        result.append({
            "id": r.id,
            "patient_id": r.patient_id,
            "patient_name": r.patient.name if r.patient else "Unknown",
            "patient_age": r.patient.age if r.patient else 0,
            "patient_gender": r.patient.gender if r.patient else "N/A",
            "patient_village": r.patient.village if r.patient else "N/A",
            "patient_phone": r.patient.phone if r.patient else "N/A",
            "referring_facility_id": r.referring_facility_id,
            "referring_facility_name": r.referring_facility.name if r.referring_facility else "N/A",
            "receiving_facility_id": r.receiving_facility_id,
            "receiving_facility_name": r.receiving_facility.name if r.receiving_facility else "N/A",
            "reason": r.reason,
            "required_service": r.required_service,
            "priority": r.priority,
            "current_status": r.current_status,
            "clinical_notes": r.clinical_notes,
            "created_at": r.created_at,
            "updated_at": r.updated_at
        })
    return result

@app.post("/api/referrals")
def create_referral(ref_in: schemas.ReferralCreate, db: Session = Depends(get_db)):
    ref = crud.create_referral(db, ref_in)
    return {
        "id": ref.id,
        "status": ref.current_status,
        "message": f"Referral {ref.id} successfully initiated."
    }

@app.get("/api/referrals/{referral_id}")
def get_referral_details(referral_id: str, db: Session = Depends(get_db)):
    r = crud.get_referral(db, referral_id)
    if not r:
        raise HTTPException(status_code=404, detail="Referral not found")
    
    history_list = []
    for h in r.history:
        history_list.append({
            "id": h.id,
            "status": h.status,
            "timestamp": h.timestamp,
            "facility_id": h.facility_id,
            "facility_name": h.facility.name if h.facility else "N/A",
            "action_by_role": h.action_by_role,
            "action_by_name": h.action_by_name,
            "note": h.note
        })

    follow_ups_list = []
    for fol in r.follow_ups:
        follow_ups_list.append({
            "id": fol.id,
            "referral_id": fol.referral_id,
            "patient_id": fol.patient_id,
            "scheduled_date": fol.scheduled_date,
            "reason": fol.reason,
            "status": fol.status,
            "completion_date": fol.completion_date,
            "notes": fol.notes,
            "assigned_worker_name": fol.health_worker.name if fol.health_worker else "Community Health Worker",
            "created_at": fol.created_at
        })

    return {
        "id": r.id,
        "patient": {
            "id": r.patient.id,
            "abha_id": r.patient.abha_id,
            "name": r.patient.name,
            "age": r.patient.age,
            "gender": r.patient.gender,
            "phone": r.patient.phone,
            "village": r.patient.village,
            "district": r.patient.district
        } if r.patient else None,
        "referring_facility": {
            "id": r.referring_facility.id,
            "name": r.referring_facility.name,
            "type": r.referring_facility.type,
            "district": r.referring_facility.district
        } if r.referring_facility else None,
        "receiving_facility": {
            "id": r.receiving_facility.id,
            "name": r.receiving_facility.name,
            "type": r.receiving_facility.type,
            "district": r.receiving_facility.district
        } if r.receiving_facility else None,
        "reason": r.reason,
        "required_service": r.required_service,
        "priority": r.priority,
        "current_status": r.current_status,
        "clinical_notes": r.clinical_notes,
        "created_at": r.created_at,
        "updated_at": r.updated_at,
        "history": history_list,
        "follow_ups": follow_ups_list
    }

@app.post("/api/referrals/{referral_id}/transition")
def transition_referral_status(
    referral_id: str,
    transition_in: schemas.ReferralTransition,
    db: Session = Depends(get_db)
):
    ref = crud.transition_referral(db, referral_id, transition_in)
    if not ref:
        raise HTTPException(status_code=404, detail="Referral not found")
    return {
        "id": ref.id,
        "current_status": ref.current_status,
        "message": f"Referral transitioned to {ref.current_status}"
    }

# --- FOLLOW-UPS ---
@app.get("/api/follow-ups")
def list_follow_ups(
    status: Optional[str] = Query(None),
    worker_id: Optional[str] = Query(None),
    due_only: bool = Query(False),
    db: Session = Depends(get_db)
):
    fols = crud.get_follow_ups(db, status=status, worker_id=worker_id, due_only=due_only)
    result = []
    for f in fols:
        result.append({
            "id": f.id,
            "referral_id": f.referral_id,
            "patient_id": f.patient_id,
            "patient_name": f.patient.name if f.patient else "Unknown",
            "patient_village": f.patient.village if f.patient else "N/A",
            "patient_phone": f.patient.phone if f.patient else "N/A",
            "assigned_worker_id": f.assigned_worker_id,
            "assigned_worker_name": f.health_worker.name if f.health_worker else "Community Health Worker",
            "assigned_facility_id": f.assigned_facility_id,
            "assigned_facility_name": f.facility.name if f.facility else "N/A",
            "scheduled_date": f.scheduled_date,
            "reason": f.reason,
            "status": f.status,
            "completion_date": f.completion_date,
            "notes": f.notes,
            "created_at": f.created_at
        })
    return result

@app.post("/api/follow-ups")
def schedule_follow_up(
    follow_up_in: schemas.FollowUpCreate,
    creator_name: str = Query("Facility Doctor"),
    creator_role: str = Query("Facility"),
    db: Session = Depends(get_db)
):
    fol = crud.create_follow_up(db, follow_up_in, creator_name=creator_name, creator_role=creator_role)
    return {
        "id": fol.id,
        "referral_id": fol.referral_id,
        "status": fol.status,
        "message": f"Follow-up {fol.id} scheduled for {fol.scheduled_date}. Referral transitioned to FOLLOW_UP_REQUIRED."
    }

@app.post("/api/follow-ups/{follow_up_id}/complete")
def complete_follow_up_task(
    follow_up_id: str,
    comp_in: schemas.FollowUpComplete,
    db: Session = Depends(get_db)
):
    fol = crud.complete_follow_up(db, follow_up_id, comp_in)
    if not fol:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    return {
        "id": fol.id,
        "status": fol.status,
        "message": "Follow-up marked COMPLETED. Associated referral cycle successfully CLOSED."
    }

# --- ADMIN ANALYTICS & GAP MONITORING ---
@app.get("/api/admin/analytics", response_model=schemas.AdminAnalytics)
def get_analytics(db: Session = Depends(get_db)):
    return crud.get_admin_analytics(db)

@app.post("/api/admin/reset-demo")
def reset_demo_database():
    # Reset referral/facility data
    seed_database()
    # Reset appointment slots (delete and re-seed)
    from database import SessionLocal
    db = SessionLocal()
    try:
        db.query(appointment_models.Appointment).delete()
        db.query(appointment_models.AppointmentSlot).delete()
        db.query(appointment_models.Doctor).delete()
        db.commit()
        appointment_crud.seed_appointment_data(db)
    finally:
        db.close()
    return {"message": "Swasthya Setu database (including appointments) has been reset to initial demo state."}


# ═══════════════════════════════════════════════════════════════════════════════
# AI HEALTHCARE ASSISTANT — Feature 1
# ═══════════════════════════════════════════════════════════════════════════════

from pydantic import BaseModel

class ChatRequest(BaseModel):
    messages: list[dict]    # [{"role": "user"|"assistant", "content": "..."}]
    language: str = "en"    # en | hi

class AssessmentRequest(BaseModel):
    symptoms: str
    language: str = "en"


@app.get("/api/ai/status")
def ai_status():
    """Check if the AI service is running in live or demo mode."""
    return {
        "ai_enabled": not ai_service.is_demo_mode(),
        "demo_mode": ai_service.is_demo_mode(),
        "model": "gemini-3.7-flash" if not ai_service.is_demo_mode() else "demo",
        "message": (
            "AI Healthcare Assistant is active (Gemini API)."
            if not ai_service.is_demo_mode()
            else "Running in DEMO mode. Set GEMINI_API_KEY in backend/.env to enable live AI."
        )
    }


@app.post("/api/ai/chat")
def ai_chat(req: ChatRequest):
    """
    Multi-turn conversational healthcare assistant.
    Accepts a messages array and returns the assistant's next reply.
    """
    try:
        reply = ai_service.chat_with_assistant(req.messages, req.language)
        return {
            "reply": reply,
            "demo_mode": ai_service.is_demo_mode(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@app.post("/api/ai/symptom-assessment")
def ai_symptom_assessment(req: AssessmentRequest):
    """
    Structured symptom assessment — returns urgency, recommended care, conditions, disclaimer.
    """
    if not req.symptoms.strip():
        raise HTTPException(status_code=400, detail="Symptoms text cannot be empty.")
    try:
        result = ai_service.assess_symptoms(req.symptoms, req.language)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assessment error: {str(e)}")


# ═══════════════════════════════════════════════════════════════════════════════
# SMART HEALTHCARE CENTRE RECOMMENDATION — nearby facilities with distance + ETA
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/healthcare-centres/nearby")
def get_nearby_centres(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    radius_km: float = Query(100.0, description="Search radius in km"),
    urgency: Optional[str] = Query(None, description="Low|Moderate|High|Emergency — filters by recommended centre type"),
    db: Session = Depends(get_db)
):
    """
    Returns facilities within radius_km of the given coordinates, sorted by distance.
    Distance is calculated using the Haversine formula. ETA assumes ~40 km/h average speed on rural roads.
    """
    facilities = db.query(models.Facility).all()

    results = []
    for f in facilities:
        dist = appointment_crud.haversine_km(lat, lng, f.latitude, f.longitude)
        if dist > radius_km:
            continue
        eta_minutes = round((dist / 40) * 60)  # 40 km/h average rural road speed

        # If urgency filter is set, score higher-capability facilities to top
        capability_score = 0
        if urgency in ("Emergency",) and f.emergency_available:
            capability_score = 100
        elif urgency in ("High",) and (f.diagnostics_available or f.emergency_available):
            capability_score = 50
        elif urgency in ("Moderate",) and f.doctor_available:
            capability_score = 30

        results.append({
            "id": f.id,
            "name": f.name,
            "type": f.type,
            "district": f.district,
            "block": f.block,
            "address": f.address,
            "latitude": f.latitude,
            "longitude": f.longitude,
            "phone": f.phone,
            "doctor_available": f.doctor_available,
            "pharmacy_available": f.pharmacy_available,
            "diagnostics_available": f.diagnostics_available,
            "emergency_available": f.emergency_available,
            "services": json.loads(f.services) if f.services else [],
            "operating_hours": f.operating_hours,
            "distance_km": round(dist, 2),
            "eta_minutes": eta_minutes,
            "maps_url": f"https://www.google.com/maps/dir/?api=1&destination={f.latitude},{f.longitude}",
            "_capability_score": capability_score,
        })

    # Sort: capability (desc) then distance (asc)
    results.sort(key=lambda x: (-x["_capability_score"], x["distance_km"]))
    for r in results:
        del r["_capability_score"]

    return {"count": len(results), "facilities": results}


# ═══════════════════════════════════════════════════════════════════════════════
# APPOINTMENT SLOTS & BOOKING — Feature 2
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/healthcare-centres/{facility_id}/slots")
def get_facility_slots(
    facility_id: str,
    date: Optional[str] = Query(None, description="YYYY-MM-DD — if omitted returns next 7 days"),
    db: Session = Depends(get_db)
):
    """Returns available appointment slots for a given facility."""
    # Verify facility exists
    fac = db.query(models.Facility).filter(models.Facility.id == facility_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Facility not found.")

    slots = appointment_crud.get_slots_for_facility(db, facility_id, date)
    doctors = appointment_crud.get_doctors_for_facility(db, facility_id)
    return {
        "facility_id": facility_id,
        "facility_name": fac.name,
        "doctors": doctors,
        "available_slots": slots,
        "total_available": len(slots),
        "_demo": True,
    }


class BookingRequest(BaseModel):
    slot_id: int
    patient_name: str
    patient_phone: str
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    chief_complaint: Optional[str] = None


@app.post("/api/appointments")
def create_appointment(req: BookingRequest, db: Session = Depends(get_db)):
    """Book an appointment slot. Returns APPT-2026-XXXXX confirmation ID."""
    try:
        result = appointment_crud.book_appointment(
            db,
            slot_id=req.slot_id,
            patient_name=req.patient_name,
            patient_phone=req.patient_phone,
            patient_age=req.patient_age,
            patient_gender=req.patient_gender,
            chief_complaint=req.chief_complaint,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Booking error: {str(e)}")


@app.get("/api/appointments")
def list_appointments(
    patient_phone: Optional[str] = Query(None, description="Filter by patient phone number"),
    db: Session = Depends(get_db)
):
    """List appointments, optionally filtered by patient phone number."""
    return appointment_crud.get_appointments(db, patient_phone=patient_phone)


@app.get("/api/appointments/{appointment_id}")
def get_appointment(appointment_id: str, db: Session = Depends(get_db)):
    """Get a single appointment by its ID."""
    appts = appointment_crud.get_appointments(db)
    for a in appts:
        if a["appointment_id"] == appointment_id:
            return a
    raise HTTPException(status_code=404, detail="Appointment not found.")


# ═══════════════════════════════════════════════════════════════════════════════
# STATIC FRONTEND MOUNT (must be last)
# ═══════════════════════════════════════════════════════════════════════════════
import os
from fastapi.staticfiles import StaticFiles

DIST_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(DIST_PATH):
    app.mount("/", StaticFiles(directory=DIST_PATH, html=True), name="static")
