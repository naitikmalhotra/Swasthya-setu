"""
appointment_models.py — Doctor, AppointmentSlot, and Appointment SQLAlchemy models.
These extend the existing Swasthya Setu database without modifying existing tables.
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String, primary_key=True, index=True)           # DOC-001
    name = Column(String, nullable=False)
    specialty = Column(String, nullable=False)                   # General Physician, Gynecologist, etc.
    qualification = Column(String, nullable=False)               # MBBS, MD, etc.
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=False, index=True)
    available_days = Column(String, nullable=False)              # "Mon,Tue,Wed,Thu,Fri"
    available_start = Column(String, default="09:00")
    available_end = Column(String, default="16:00")
    is_active = Column(Boolean, default=True)

    facility = relationship("Facility")
    slots = relationship("AppointmentSlot", back_populates="doctor", cascade="all, delete-orphan")


class AppointmentSlot(Base):
    __tablename__ = "appointment_slots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    doctor_id = Column(String, ForeignKey("doctors.id"), nullable=False, index=True)
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=False, index=True)
    slot_date = Column(String, nullable=False, index=True)       # YYYY-MM-DD
    slot_time = Column(String, nullable=False)                   # HH:MM (24hr)
    is_booked = Column(Boolean, default=False)

    doctor = relationship("Doctor", back_populates="slots")
    facility = relationship("Facility")
    appointment = relationship("Appointment", back_populates="slot", uselist=False)


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String, primary_key=True, index=True)           # APPT-2026-XXXXX
    patient_name = Column(String, nullable=False)
    patient_phone = Column(String, nullable=False, index=True)
    patient_age = Column(Integer, nullable=True)
    patient_gender = Column(String, nullable=True)
    doctor_id = Column(String, ForeignKey("doctors.id"), nullable=False)
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=False)
    slot_id = Column(Integer, ForeignKey("appointment_slots.id"), nullable=False)
    appointment_date = Column(String, nullable=False)            # YYYY-MM-DD
    appointment_time = Column(String, nullable=False)            # HH:MM
    department = Column(String, nullable=True)
    chief_complaint = Column(Text, nullable=True)
    status = Column(String, default="CONFIRMED")                 # CONFIRMED, COMPLETED, CANCELLED
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    doctor = relationship("Doctor")
    facility = relationship("Facility")
    slot = relationship("AppointmentSlot", back_populates="appointment")
