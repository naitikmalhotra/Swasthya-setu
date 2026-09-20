from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # patient, health_worker, facility, admin
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=True)
    district = Column(String, nullable=True)

    facility = relationship("Facility", back_populates="users", foreign_keys=[facility_id])

class Facility(Base):
    __tablename__ = "facilities"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)  # Sub-Centre, PHC, CHC, Sub-District Hospital, District Hospital
    district = Column(String, nullable=False, index=True)
    block = Column(String, nullable=False)
    address = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    phone = Column(String, nullable=False)
    doctor_available = Column(Boolean, default=True)
    pharmacy_available = Column(Boolean, default=True)
    diagnostics_available = Column(Boolean, default=True)
    emergency_available = Column(Boolean, default=False)
    services = Column(Text, nullable=False)  # JSON-encoded list of service names
    operating_hours = Column(String, default="9:00 AM - 4:00 PM")

    users = relationship("User", back_populates="facility", foreign_keys=[User.facility_id])
    health_workers = relationship("HealthWorker", back_populates="facility")
    patients = relationship("Patient", back_populates="primary_facility")
    medicines = relationship("Medicine", back_populates="facility", cascade="all, delete-orphan")
    diagnostics = relationship("Diagnostic", back_populates="facility", cascade="all, delete-orphan")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True, index=True)
    abha_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False, index=True)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    village = Column(String, nullable=False)
    block = Column(String, nullable=False)
    district = Column(String, nullable=False, index=True)
    primary_facility_id = Column(String, ForeignKey("facilities.id"), nullable=True)

    primary_facility = relationship("Facility", back_populates="patients")
    referrals = relationship("Referral", back_populates="patient")
    follow_ups = relationship("FollowUp", back_populates="patient")

class HealthWorker(Base):
    __tablename__ = "health_workers"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    designation = Column(String, nullable=False)  # ANM, ASHA Facilitator, CHO
    assigned_facility_id = Column(String, ForeignKey("facilities.id"), nullable=False)
    phone = Column(String, nullable=False)

    facility = relationship("Facility", back_populates="health_workers")
    referrals = relationship("Referral", back_populates="health_worker")
    follow_ups = relationship("FollowUp", back_populates="health_worker")

class Referral(Base):
    __tablename__ = "referrals"

    id = Column(String, primary_key=True, index=True)  # REF-2026-XXXXX
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    referring_facility_id = Column(String, ForeignKey("facilities.id"), nullable=False)
    receiving_facility_id = Column(String, ForeignKey("facilities.id"), nullable=False)
    referring_health_worker_id = Column(String, ForeignKey("health_workers.id"), nullable=True)
    reason = Column(Text, nullable=False)
    required_service = Column(String, nullable=False)
    priority = Column(String, default="Routine")  # Routine, Urgent, Emergency
    current_status = Column(String, default="REFERRED", index=True)
    # Statuses: REFERRED -> ACCEPTED -> PATIENT_RECEIVED -> TREATMENT_COMPLETED -> FOLLOW_UP_REQUIRED -> FOLLOW_UP_COMPLETED -> CLOSED
    clinical_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("Patient", back_populates="referrals")
    referring_facility = relationship("Facility", foreign_keys=[referring_facility_id])
    receiving_facility = relationship("Facility", foreign_keys=[receiving_facility_id])
    health_worker = relationship("HealthWorker", back_populates="referrals")
    history = relationship("ReferralStatusHistory", back_populates="referral", order_by="ReferralStatusHistory.timestamp.asc()", cascade="all, delete-orphan")
    follow_ups = relationship("FollowUp", back_populates="referral", cascade="all, delete-orphan")

class ReferralStatusHistory(Base):
    __tablename__ = "referral_status_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    referral_id = Column(String, ForeignKey("referrals.id"), nullable=False, index=True)
    status = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=True)
    action_by_role = Column(String, nullable=False)
    action_by_name = Column(String, nullable=False)
    note = Column(Text, nullable=True)

    referral = relationship("Referral", back_populates="history")
    facility = relationship("Facility")

class FollowUp(Base):
    __tablename__ = "follow_ups"

    id = Column(String, primary_key=True, index=True)  # FOL-2026-XXXXX
    referral_id = Column(String, ForeignKey("referrals.id"), nullable=False, index=True)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False, index=True)
    assigned_worker_id = Column(String, ForeignKey("health_workers.id"), nullable=True)
    assigned_facility_id = Column(String, ForeignKey("facilities.id"), nullable=True)
    scheduled_date = Column(String, nullable=False)  # YYYY-MM-DD
    reason = Column(Text, nullable=False)
    status = Column(String, default="DUE", index=True)  # UPCOMING, DUE, COMPLETED, OVERDUE
    completion_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    referral = relationship("Referral", back_populates="follow_ups")
    patient = relationship("Patient", back_populates="follow_ups")
    health_worker = relationship("HealthWorker", back_populates="follow_ups")
    facility = relationship("Facility")

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, autoincrement=True)
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    status = Column(String, default="AVAILABLE")  # AVAILABLE, LOW_STOCK, OUT_OF_STOCK
    quantity_range = Column(String, default="500-1000 units")
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    facility = relationship("Facility", back_populates="medicines")

class Diagnostic(Base):
    __tablename__ = "diagnostics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    status = Column(String, default="AVAILABLE")  # AVAILABLE, UNAVAILABLE, REFERRAL_REQUIRED
    turnaround_time = Column(String, default="Same Day")
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    facility = relationship("Facility", back_populates="diagnostics")
