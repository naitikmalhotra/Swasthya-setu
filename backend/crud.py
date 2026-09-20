from sqlalchemy.orm import Session
from sqlalchemy import func, case
from datetime import datetime, date
import json
import uuid

import models
import schemas

def get_users(db: Session):
    return db.query(models.User).all()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

# --- FACILITIES & SMART RECOMMENDATIONS ---
def get_facilities(db: Session, district: str = None, facility_type: str = None):
    query = db.query(models.Facility)
    if district and district.lower() != "all":
        query = query.filter(models.Facility.district.ilike(f"%{district}%"))
    if facility_type and facility_type.lower() != "all":
        query = query.filter(models.Facility.type == facility_type)
    return query.all()

def get_facility(db: Session, facility_id: str):
    return db.query(models.Facility).filter(models.Facility.id == facility_id).first()

def recommend_facilities(db: Session, district: str = None, requirement: str = None):
    """
    Intelligent Facility Recommendation Engine:
    Evaluates facilities based on clinical capability rather than merely closest geographic distance.
    Prevents patient fatigue and inappropriate Sub-Centre visits for tertiary/specialist needs.
    """
    query = db.query(models.Facility)
    if district and district.lower() != "all":
        query = query.filter(models.Facility.district.ilike(f"%{district}%"))
    
    facilities = query.all()
    results = []

    req_normalized = (requirement or "General Treatment").strip().lower()

    for fac in facilities:
        services_list = json.loads(fac.services) if fac.services else []
        services_lower = [s.lower() for s in services_list]

        match_score = 50
        is_recommended = False
        flags = []
        reason = ""

        # Availability bonuses
        if fac.doctor_available:
            match_score += 15
            flags.append("Doctor On-Duty")
        else:
            match_score -= 25
            flags.append("Doctor Unavailable")

        if fac.pharmacy_available:
            match_score += 10
            flags.append("Pharmacy Stocked")

        if fac.diagnostics_available:
            match_score += 10
            flags.append("Lab Available")

        if fac.emergency_available:
            flags.append("24x7 Emergency")

        # Clinical requirement matching
        if "specialist" in req_normalized or "cardiology" in req_normalized or "surgery" in req_normalized:
            if "specialist consultation" in services_lower or fac.type in ["District Hospital", "Sub-District Hospital"]:
                match_score += 40
                is_recommended = True
                reason = "Equipped with Specialist Doctors, ICU beds, and multi-specialty OPD."
            else:
                match_score -= 40
                is_recommended = False
                reason = "Basic facility without specialist consultants. In-person visit would trigger immediate onward referral."
        elif "emergency" in req_normalized:
            if fac.emergency_available:
                match_score += 45
                is_recommended = True
                reason = "Equipped with round-the-clock Trauma/Emergency triage and ambulance link."
            else:
                match_score -= 30
                is_recommended = False
                reason = "No 24x7 emergency department on site."
        elif "maternal" in req_normalized:
            if "maternal care" in services_lower or "obstetrics" in services_lower or fac.type in ["Community Health Centre (CHC)", "District Hospital", "Primary Health Centre (PHC)"]:
                match_score += 35
                is_recommended = True
                reason = "Certified labor room, skilled birth attendants (SBA), and maternal care."
            else:
                match_score -= 20
                is_recommended = False
                reason = "Limited maternal delivery equipment."
        elif "child" in req_normalized or "pediatric" in req_normalized:
            if "child care" in services_lower or fac.type in ["Community Health Centre (CHC)", "District Hospital"]:
                match_score += 35
                is_recommended = True
                reason = "Pediatric immunization, neonatal stabilization, and nutrition monitoring."
            else:
                match_score -= 10
                is_recommended = False
                reason = "Basic child immunization only."
        elif "diagnostic" in req_normalized or "test" in req_normalized or "x-ray" in req_normalized:
            if fac.diagnostics_available and ("diagnostics" in services_lower or fac.type in ["Community Health Centre (CHC)", "District Hospital"]):
                match_score += 40
                is_recommended = True
                reason = "Clinical laboratory with point-of-care biochemistry, CBC, and digital imaging."
            else:
                match_score -= 30
                is_recommended = False
                reason = "No active laboratory testing equipment currently operational."
        else: # General Treatment / OPD
            if fac.doctor_available:
                match_score += 25
                is_recommended = True
                reason = "Primary OPD active for general fever, respiratory, chronic disease checkups."
            else:
                match_score -= 20
                is_recommended = False
                reason = "Doctor currently off-duty; only nursing triage available."

        # Cap score between 10 and 99
        final_score = max(10, min(99, match_score))

        rec_item = schemas.FacilityRecommendation(
            id=fac.id,
            name=fac.name,
            type=fac.type,
            district=fac.district,
            block=fac.block,
            address=fac.address,
            latitude=fac.latitude,
            longitude=fac.longitude,
            phone=fac.phone,
            doctor_available=fac.doctor_available,
            pharmacy_available=fac.pharmacy_available,
            diagnostics_available=fac.diagnostics_available,
            emergency_available=fac.emergency_available,
            services=services_list,
            operating_hours=fac.operating_hours,
            is_recommended=is_recommended,
            match_score=final_score,
            recommendation_reason=reason,
            suitability_flags=flags
        )
        results.append(rec_item)

    # Sort so recommended facilities appear first, ordered by score
    results.sort(key=lambda x: (x.is_recommended, x.match_score), reverse=True)
    return results

# --- PATIENTS ---
def get_patients(db: Session, search: str = None, district: str = None):
    query = db.query(models.Patient)
    if district and district.lower() != "all":
        query = query.filter(models.Patient.district.ilike(f"%{district}%"))
    if search:
        s = f"%{search}%"
        query = query.filter(
            (models.Patient.name.ilike(s)) |
            (models.Patient.abha_id.ilike(s)) |
            (models.Patient.village.ilike(s)) |
            (models.Patient.phone.ilike(s))
        )
    return query.all()

def get_patient(db: Session, patient_id: str):
    return db.query(models.Patient).filter(models.Patient.id == patient_id).first()

# --- HEALTH WORKERS ---
def get_health_workers(db: Session, facility_id: str = None):
    query = db.query(models.HealthWorker)
    if facility_id:
        query = query.filter(models.HealthWorker.assigned_facility_id == facility_id)
    return query.all()

# --- REFERRALS & CONTINUITY STATE MACHINE ---
def get_referrals(db: Session, status: str = None, facility_id: str = None, role: str = None, priority: str = None):
    query = db.query(models.Referral)
    if status and status.lower() != "all":
        query = query.filter(models.Referral.current_status == status.upper())
    if priority and priority.lower() != "all":
        query = query.filter(models.Referral.priority == priority)
    
    if facility_id:
        if role == "facility":
            # Show referrals incoming to this facility OR referred from this facility
            query = query.filter(
                (models.Referral.receiving_facility_id == facility_id) |
                (models.Referral.referring_facility_id == facility_id)
            )
        elif role == "health_worker":
            query = query.filter(models.Referral.referring_facility_id == facility_id)

    return query.order_by(models.Referral.created_at.desc()).all()

def get_referral(db: Session, referral_id: str):
    return db.query(models.Referral).filter(models.Referral.id == referral_id).first()

def generate_referral_id(db: Session) -> str:
    count = db.query(models.Referral).count() + 1
    return f"REF-2026-{count:05d}"

def create_referral(db: Session, ref_in: schemas.ReferralCreate, worker_name: str = "Health Worker"):
    ref_id = generate_referral_id(db)
    new_ref = models.Referral(
        id=ref_id,
        patient_id=ref_in.patient_id,
        referring_facility_id=ref_in.referring_facility_id,
        receiving_facility_id=ref_in.receiving_facility_id,
        referring_health_worker_id=ref_in.referring_health_worker_id,
        reason=ref_in.reason,
        required_service=ref_in.required_service,
        priority=ref_in.priority,
        current_status="REFERRED",
        clinical_notes=ref_in.clinical_notes,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_ref)
    db.flush()

    # Log initial status history
    history_entry = models.ReferralStatusHistory(
        referral_id=ref_id,
        status="REFERRED",
        timestamp=datetime.utcnow(),
        facility_id=ref_in.referring_facility_id,
        action_by_role="Health Worker",
        action_by_name=worker_name,
        note=f"Referral initiated: {ref_in.reason}"
    )
    db.add(history_entry)
    db.commit()
    db.refresh(new_ref)
    return new_ref

def transition_referral(db: Session, referral_id: str, transition_in: schemas.ReferralTransition):
    referral = get_referral(db, referral_id)
    if not referral:
        return None

    valid_statuses = [
        "REFERRED", "ACCEPTED", "PATIENT_RECEIVED", "TREATMENT_COMPLETED",
        "FOLLOW_UP_REQUIRED", "FOLLOW_UP_COMPLETED", "CLOSED"
    ]
    target = transition_in.target_status.upper()
    if target not in valid_statuses:
        target = "CLOSED" if "CLOSE" in target else target

    referral.current_status = target
    referral.updated_at = datetime.utcnow()

    history_entry = models.ReferralStatusHistory(
        referral_id=referral.id,
        status=target,
        timestamp=datetime.utcnow(),
        facility_id=transition_in.facility_id or referral.receiving_facility_id,
        action_by_role=transition_in.action_by_role,
        action_by_name=transition_in.action_by_name,
        note=transition_in.note or f"Status transitioned to {target}"
    )
    db.add(history_entry)
    db.commit()
    db.refresh(referral)
    return referral

# --- FOLLOW-UPS ---
def get_follow_ups(db: Session, status: str = None, worker_id: str = None, due_only: bool = False):
    query = db.query(models.FollowUp)
    if status and status.lower() != "all":
        query = query.filter(models.FollowUp.status == status.upper())
    if worker_id:
        query = query.filter(models.FollowUp.assigned_worker_id == worker_id)
    if due_only:
        today_str = date.today().isoformat()
        query = query.filter((models.FollowUp.scheduled_date <= today_str) & (models.FollowUp.status.in_(["DUE", "UPCOMING", "OVERDUE"])))
    
    return query.order_by(models.FollowUp.scheduled_date.asc()).all()

def create_follow_up(db: Session, follow_up_in: schemas.FollowUpCreate, creator_name: str = "Facility Doctor", creator_role: str = "Facility"):
    count = db.query(models.FollowUp).count() + 1
    fol_id = f"FOL-2026-{count:05d}"

    new_fol = models.FollowUp(
        id=fol_id,
        referral_id=follow_up_in.referral_id,
        patient_id=follow_up_in.patient_id,
        assigned_worker_id=follow_up_in.assigned_worker_id,
        assigned_facility_id=follow_up_in.assigned_facility_id,
        scheduled_date=follow_up_in.scheduled_date,
        reason=follow_up_in.reason,
        status="DUE" if follow_up_in.scheduled_date <= date.today().isoformat() else "UPCOMING",
        notes=follow_up_in.notes,
        created_at=datetime.utcnow()
    )
    db.add(new_fol)

    # Set referral status to FOLLOW_UP_REQUIRED
    referral = get_referral(db, follow_up_in.referral_id)
    if referral:
        referral.current_status = "FOLLOW_UP_REQUIRED"
        referral.updated_at = datetime.utcnow()
        hist = models.ReferralStatusHistory(
            referral_id=referral.id,
            status="FOLLOW_UP_REQUIRED",
            timestamp=datetime.utcnow(),
            facility_id=follow_up_in.assigned_facility_id or referral.receiving_facility_id,
            action_by_role=creator_role,
            action_by_name=creator_name,
            note=f"Scheduled follow-up for {follow_up_in.scheduled_date}: {follow_up_in.reason}"
        )
        db.add(hist)

    db.commit()
    db.refresh(new_fol)
    return new_fol

def complete_follow_up(db: Session, follow_up_id: str, comp_in: schemas.FollowUpComplete):
    fol = db.query(models.FollowUp).filter(models.FollowUp.id == follow_up_id).first()
    if not fol:
        return None
    
    fol.status = "COMPLETED"
    fol.completion_date = datetime.utcnow()
    if comp_in.notes:
        fol.notes = f"{fol.notes or ''} | Visit Note: {comp_in.notes}".strip(" |")

    # Update associated referral
    referral = get_referral(db, fol.referral_id)
    if referral:
        # First log follow-up completed
        hist1 = models.ReferralStatusHistory(
            referral_id=referral.id,
            status="FOLLOW_UP_COMPLETED",
            timestamp=datetime.utcnow(),
            facility_id=fol.assigned_facility_id,
            action_by_role=comp_in.action_by_role,
            action_by_name=comp_in.action_by_name,
            note=f"Follow-up completed: {comp_in.notes or 'Routine recovery confirmed'}"
        )
        db.add(hist1)

        # Then transition to CLOSED (Completing the cycle)
        referral.current_status = "CLOSED"
        referral.updated_at = datetime.utcnow()
        hist2 = models.ReferralStatusHistory(
            referral_id=referral.id,
            status="CLOSED",
            timestamp=datetime.utcnow(),
            facility_id=fol.assigned_facility_id,
            action_by_role="System / Continuity Engine",
            action_by_name="Swasthya Setu Core",
            note="Referral journey complete: Treatment & Community Follow-up successfully closed."
        )
        db.add(hist2)

    db.commit()
    db.refresh(fol)
    return fol

# --- MEDICINES & DIAGNOSTICS ---
def get_medicines_by_facility(db: Session, facility_id: str):
    return db.query(models.Medicine).filter(models.Medicine.facility_id == facility_id).all()

def update_medicine(db: Session, med_id: int, med_in: schemas.MedicineUpdate):
    med = db.query(models.Medicine).filter(models.Medicine.id == med_id).first()
    if med:
        med.status = med_in.status.upper()
        if med_in.quantity_range:
            med.quantity_range = med_in.quantity_range
        med.last_updated = datetime.utcnow()
        db.commit()
        db.refresh(med)
    return med

def get_diagnostics_by_facility(db: Session, facility_id: str):
    return db.query(models.Diagnostic).filter(models.Diagnostic.facility_id == facility_id).all()

def update_diagnostic(db: Session, diag_id: int, diag_in: schemas.DiagnosticUpdate):
    diag = db.query(models.Diagnostic).filter(models.Diagnostic.id == diag_id).first()
    if diag:
        diag.status = diag_in.status.upper()
        if diag_in.turnaround_time:
            diag.turnaround_time = diag_in.turnaround_time
        diag.last_updated = datetime.utcnow()
        db.commit()
        db.refresh(diag)
    return diag

# --- ADMIN ANALYTICS & GAP MONITORING ---
def get_admin_analytics(db: Session) -> schemas.AdminAnalytics:
    total_facilities = db.query(models.Facility).count()
    total_patients = db.query(models.Patient).count()
    total_referrals = db.query(models.Referral).count()

    # Referrals breakdown
    active_statuses = ["REFERRED", "ACCEPTED", "PATIENT_RECEIVED", "TREATMENT_COMPLETED", "FOLLOW_UP_REQUIRED", "FOLLOW_UP_COMPLETED"]
    active_referrals = db.query(models.Referral).filter(models.Referral.current_status.in_(active_statuses)).count()
    pending_referrals = db.query(models.Referral).filter(models.Referral.current_status.in_(["REFERRED", "ACCEPTED"])).count()
    completed_referrals = db.query(models.Referral).filter(models.Referral.current_status == "CLOSED").count()

    # Follow-ups
    today_str = date.today().isoformat()
    follow_ups_due = db.query(models.FollowUp).filter(models.FollowUp.status.in_(["DUE", "UPCOMING"])).count()
    overdue_follow_ups = db.query(models.FollowUp).filter(models.FollowUp.status == "OVERDUE").count()

    # Resource shortages
    medicine_shortages_count = db.query(models.Medicine).filter(models.Medicine.status.in_(["LOW_STOCK", "OUT_OF_STOCK"])).count()
    diagnostic_gaps_count = db.query(models.Diagnostic).filter(models.Diagnostic.status.in_(["UNAVAILABLE"])).count()

    # Completion rate
    completion_rate = round((completed_referrals / total_referrals * 100), 1) if total_referrals > 0 else 0.0

    # Status distribution
    all_statuses = ["REFERRED", "ACCEPTED", "PATIENT_RECEIVED", "TREATMENT_COMPLETED", "FOLLOW_UP_REQUIRED", "FOLLOW_UP_COMPLETED", "CLOSED"]
    status_distribution = {}
    for st in all_statuses:
        status_distribution[st] = db.query(models.Referral).filter(models.Referral.current_status == st).count()

    # Referrals by facility
    facilities = db.query(models.Facility).all()
    referrals_by_facility = []
    facility_metrics = []

    for fac in facilities:
        ref_count = db.query(models.Referral).filter(
            (models.Referral.receiving_facility_id == fac.id) | (models.Referral.referring_facility_id == fac.id)
        ).count()
        referrals_by_facility.append({
            "facility_id": fac.id,
            "facility_name": fac.name,
            "type": fac.type,
            "district": fac.district,
            "count": ref_count
        })

        # Facility Health Score evaluation
        med_short = db.query(models.Medicine).filter(
            models.Medicine.facility_id == fac.id,
            models.Medicine.status.in_(["LOW_STOCK", "OUT_OF_STOCK"])
        ).count()
        diag_gap = db.query(models.Diagnostic).filter(
            models.Diagnostic.facility_id == fac.id,
            models.Diagnostic.status == "UNAVAILABLE"
        ).count()
        fac_active_refs = db.query(models.Referral).filter(
            models.Referral.receiving_facility_id == fac.id,
            models.Referral.current_status.in_(active_statuses)
        ).count()
        fac_overdue = db.query(models.FollowUp).filter(
            models.FollowUp.assigned_facility_id == fac.id,
            models.FollowUp.status == "OVERDUE"
        ).count()

        health_status = "GOOD"
        if not fac.doctor_available or med_short >= 3 or diag_gap >= 2 or fac_overdue >= 2:
            health_status = "CRITICAL"
        elif med_short > 0 or diag_gap > 0 or not fac.pharmacy_available:
            health_status = "WARNING"

        facility_metrics.append(schemas.FacilityHealthMetric(
            facility_id=fac.id,
            facility_name=fac.name,
            district=fac.district,
            type=fac.type,
            doctor_status=fac.doctor_available,
            medicine_shortages=med_short,
            diagnostic_gaps=diag_gap,
            active_referrals=fac_active_refs,
            overdue_follow_ups=fac_overdue,
            health_status=health_status
        ))

    # Funnel Stages (Demonstrating referral continuity)
    funnel = [
        {"stage": "1. Referred", "count": total_referrals, "description": "Initiated at primary health centres"},
        {"stage": "2. Accepted", "count": total_referrals - status_distribution.get("REFERRED", 0), "description": "Triage accepted by destination facility"},
        {"stage": "3. Received", "count": total_referrals - status_distribution.get("REFERRED", 0) - status_distribution.get("ACCEPTED", 0), "description": "Patient physically checked-in"},
        {"stage": "4. Treated", "count": total_referrals - status_distribution.get("REFERRED", 0) - status_distribution.get("ACCEPTED", 0) - status_distribution.get("PATIENT_RECEIVED", 0), "description": "Specialist/clinical treatment delivered"},
        {"stage": "5. Follow-up Scheduled", "count": status_distribution.get("FOLLOW_UP_REQUIRED", 0) + status_distribution.get("FOLLOW_UP_COMPLETED", 0) + status_distribution.get("CLOSED", 0), "description": "Continuity task routed to community health worker"},
        {"stage": "6. Closed & Completed", "count": completed_referrals, "description": "Full cycle verified with community health worker visit"}
    ]

    return schemas.AdminAnalytics(
        total_facilities=total_facilities,
        total_patients=total_patients,
        total_referrals=total_referrals,
        active_referrals=active_referrals,
        pending_referrals=pending_referrals,
        completed_referrals=completed_referrals,
        follow_ups_due=follow_ups_due,
        overdue_follow_ups=overdue_follow_ups,
        medicine_shortages_count=medicine_shortages_count,
        diagnostic_gaps_count=diagnostic_gaps_count,
        completion_rate_percentage=completion_rate,
        status_distribution=status_distribution,
        referrals_by_facility=referrals_by_facility,
        funnel_stages=funnel,
        facility_metrics=facility_metrics
    )
