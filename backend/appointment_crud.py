"""
appointment_crud.py — CRUD operations for Doctors, Slots, and Appointments.
Includes demo data seeding for SIH presentation.
"""
import math
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

import appointment_models as am


# ── ID generators ──────────────────────────────────────────────────────────────

def _next_appt_id(db: Session) -> str:
    count = db.query(am.Appointment).count()
    return f"APPT-2026-{count + 1:05d}"


# ── Haversine distance (km) ────────────────────────────────────────────────────

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ── Demo seed data ─────────────────────────────────────────────────────────────

DEMO_DOCTORS = [
    {
        "id": "DOC-001",
        "name": "Dr. Ramesh Kumar",
        "specialty": "General Physician",
        "qualification": "MBBS",
        "facility_id": "FAC-PHC-01",
        "available_days": "Mon,Tue,Wed,Thu,Fri",
        "available_start": "09:00",
        "available_end": "14:00",
    },
    {
        "id": "DOC-002",
        "name": "Dr. Sunita Sharma",
        "specialty": "Gynecologist",
        "qualification": "MBBS, MD",
        "facility_id": "FAC-CHC-01",
        "available_days": "Mon,Wed,Fri",
        "available_start": "10:00",
        "available_end": "15:00",
    },
    {
        "id": "DOC-003",
        "name": "Dr. Anil Mishra",
        "specialty": "Pediatrician",
        "qualification": "MBBS, DCH",
        "facility_id": "FAC-CHC-01",
        "available_days": "Tue,Thu,Sat",
        "available_start": "09:00",
        "available_end": "13:00",
    },
    {
        "id": "DOC-004",
        "name": "Dr. Priya Singh",
        "specialty": "General Physician",
        "qualification": "MBBS, MD",
        "facility_id": "FAC-DH-01",
        "available_days": "Mon,Tue,Wed,Thu,Fri,Sat",
        "available_start": "08:00",
        "available_end": "16:00",
    },
    {
        "id": "DOC-005",
        "name": "Dr. Vijay Pandey",
        "specialty": "Orthopedic",
        "qualification": "MBBS, MS (Ortho)",
        "facility_id": "FAC-DH-01",
        "available_days": "Mon,Wed,Fri",
        "available_start": "10:00",
        "available_end": "15:00",
    },
    {
        "id": "DOC-006",
        "name": "Dr. Meena Devi",
        "specialty": "General Physician",
        "qualification": "MBBS",
        "facility_id": "FAC-SDH-01",
        "available_days": "Mon,Tue,Thu,Fri",
        "available_start": "09:00",
        "available_end": "14:00",
    },
    {
        "id": "DOC-007",
        "name": "Dr. Rakesh Tiwari",
        "specialty": "General Physician",
        "qualification": "MBBS",
        "facility_id": "FAC-PHC-02",
        "available_days": "Mon,Tue,Wed,Thu,Fri",
        "available_start": "09:00",
        "available_end": "13:00",
    },
    {
        "id": "DOC-008",
        "name": "Dr. Kavita Rao",
        "specialty": "Gynecologist",
        "qualification": "MBBS, DGO",
        "facility_id": "FAC-DH-02",
        "available_days": "Mon,Tue,Wed,Thu,Fri,Sat",
        "available_start": "08:00",
        "available_end": "15:00",
    },
]

# Time slot templates (30-minute intervals)
SLOT_TIMES_MORNING = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]
SLOT_TIMES_AFTERNOON = ["12:00", "13:00", "13:30", "14:00", "14:30"]
SLOT_TIMES_EXTENDED = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
                        "12:00", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"]


def seed_appointment_data(db: Session):
    """Seed demo doctors and slots for the next 7 days. Idempotent."""
    existing = db.query(am.Doctor).count()
    if existing > 0:
        return  # Already seeded

    # Insert doctors
    for d in DEMO_DOCTORS:
        doc = am.Doctor(**d)
        db.add(doc)
    db.flush()

    # Generate slots for next 7 days
    today = datetime.utcnow().date()
    day_abbrs = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    for doc_data in DEMO_DOCTORS:
        available = [d.strip() for d in doc_data["available_days"].split(",")]
        for day_offset in range(1, 8):
            target_date = today + timedelta(days=day_offset)
            day_name = day_abbrs[target_date.weekday()]
            if day_name not in available:
                continue

            # Pick slot template
            start = doc_data["available_start"]
            if start == "08:00":
                times = SLOT_TIMES_EXTENDED
            elif start in ("09:00", "10:00"):
                times = SLOT_TIMES_MORNING
            else:
                times = SLOT_TIMES_AFTERNOON

            for t in times:
                slot = am.AppointmentSlot(
                    doctor_id=doc_data["id"],
                    facility_id=doc_data["facility_id"],
                    slot_date=target_date.isoformat(),
                    slot_time=t,
                    is_booked=False
                )
                db.add(slot)

    db.commit()
    print(f"[Appointments] Seeded {len(DEMO_DOCTORS)} demo doctors with slots for next 7 days.")


# ── CRUD functions ─────────────────────────────────────────────────────────────

def get_slots_for_facility(db: Session, facility_id: str, date: str | None = None) -> list[dict]:
    """Return available (un-booked) slots for a facility, optionally filtered by date."""
    query = db.query(am.AppointmentSlot).filter(
        am.AppointmentSlot.facility_id == facility_id,
        am.AppointmentSlot.is_booked == False,
    )
    if date:
        query = query.filter(am.AppointmentSlot.slot_date == date)
    else:
        # Default: next 7 days
        today = datetime.utcnow().date()
        future_dates = [(today + timedelta(days=i)).isoformat() for i in range(1, 8)]
        query = query.filter(am.AppointmentSlot.slot_date.in_(future_dates))

    slots = query.order_by(am.AppointmentSlot.slot_date, am.AppointmentSlot.slot_time).all()

    result = []
    for s in slots:
        result.append({
            "slot_id": s.id,
            "slot_date": s.slot_date,
            "slot_time": s.slot_time,
            "doctor_id": s.doctor_id,
            "doctor_name": s.doctor.name,
            "doctor_specialty": s.doctor.specialty,
            "doctor_qualification": s.doctor.qualification,
            "facility_id": s.facility_id,
            "is_booked": s.is_booked,
        })
    return result


def get_doctors_for_facility(db: Session, facility_id: str) -> list[dict]:
    docs = db.query(am.Doctor).filter(
        am.Doctor.facility_id == facility_id,
        am.Doctor.is_active == True
    ).all()
    return [
        {
            "id": d.id,
            "name": d.name,
            "specialty": d.specialty,
            "qualification": d.qualification,
            "available_days": d.available_days,
        }
        for d in docs
    ]


def book_appointment(
    db: Session,
    slot_id: int,
    patient_name: str,
    patient_phone: str,
    patient_age: int | None = None,
    patient_gender: str | None = None,
    chief_complaint: str | None = None,
) -> dict:
    """Book a slot. Returns appointment details or raises ValueError if slot unavailable."""
    slot = db.query(am.AppointmentSlot).filter(am.AppointmentSlot.id == slot_id).first()
    if not slot:
        raise ValueError("Slot not found.")
    if slot.is_booked:
        raise ValueError("This slot has already been booked. Please choose another time.")

    appt_id = _next_appt_id(db)

    appt = am.Appointment(
        id=appt_id,
        patient_name=patient_name,
        patient_phone=patient_phone,
        patient_age=patient_age,
        patient_gender=patient_gender,
        doctor_id=slot.doctor_id,
        facility_id=slot.facility_id,
        slot_id=slot_id,
        appointment_date=slot.slot_date,
        appointment_time=slot.slot_time,
        department=slot.doctor.specialty,
        chief_complaint=chief_complaint,
        status="CONFIRMED",
    )
    slot.is_booked = True
    db.add(appt)
    db.commit()
    db.refresh(appt)

    return {
        "appointment_id": appt.id,
        "patient_name": appt.patient_name,
        "patient_phone": appt.patient_phone,
        "doctor_name": slot.doctor.name,
        "doctor_specialty": slot.doctor.specialty,
        "facility_id": appt.facility_id,
        "facility_name": slot.facility.name if slot.facility else "N/A",
        "appointment_date": appt.appointment_date,
        "appointment_time": appt.appointment_time,
        "department": appt.department,
        "status": appt.status,
        "message": f"Appointment {appt.id} confirmed successfully!",
    }


def get_appointments(db: Session, patient_phone: str | None = None) -> list[dict]:
    query = db.query(am.Appointment)
    if patient_phone:
        query = query.filter(am.Appointment.patient_phone == patient_phone)
    appts = query.order_by(am.Appointment.appointment_date.desc()).all()

    result = []
    for a in appts:
        result.append({
            "appointment_id": a.id,
            "patient_name": a.patient_name,
            "patient_phone": a.patient_phone,
            "doctor_name": a.doctor.name if a.doctor else "N/A",
            "doctor_specialty": a.doctor.specialty if a.doctor else "N/A",
            "facility_name": a.facility.name if a.facility else "N/A",
            "facility_id": a.facility_id,
            "appointment_date": a.appointment_date,
            "appointment_time": a.appointment_time,
            "department": a.department,
            "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        })
    return result
