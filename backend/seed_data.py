import json
from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
import models
from database import SessionLocal, engine, Base

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # 1. FACILITIES (10 realistic facilities across 3 districts)
        facilities_data = [
            {
                "id": "FAC-DH-01",
                "name": "Chandanpur District Hospital",
                "type": "District Hospital",
                "district": "Chandanpur",
                "block": "Chandanpur Sadar",
                "address": "Civil Lines, Near Collectorate, Chandanpur",
                "latitude": 25.5941,
                "longitude": 85.1376,
                "phone": "+91 94310 11001",
                "doctor_available": True,
                "pharmacy_available": True,
                "diagnostics_available": True,
                "emergency_available": True,
                "services": json.dumps([
                    "General OPD", "Specialist Consultation", "Cardiology", "General Surgery",
                    "Maternal Care", "Pediatrics", "Orthopedics", "Diagnostics", "Pharmacy", "Emergency"
                ]),
                "operating_hours": "24x7 Emergency / 8:00 AM - 3:00 PM OPD"
            },
            {
                "id": "FAC-CHC-01",
                "name": "Chandanpur North Community Health Centre",
                "type": "Community Health Centre (CHC)",
                "district": "Chandanpur",
                "block": "North Block",
                "address": "NH-31 Junction, Chandanpur North",
                "latitude": 25.6200,
                "longitude": 85.1800,
                "phone": "+91 94310 11002",
                "doctor_available": True,
                "pharmacy_available": True,
                "diagnostics_available": True,
                "emergency_available": True,
                "services": json.dumps([
                    "General OPD", "Maternal Care", "Child Care", "Basic Diagnostics", "Pharmacy", "Minor OT"
                ]),
                "operating_hours": "24x7 Emergency / 9:00 AM - 4:00 PM OPD"
            },
            {
                "id": "FAC-PHC-01",
                "name": "Rampur Primary Health Centre",
                "type": "Primary Health Centre (PHC)",
                "district": "Chandanpur",
                "block": "Rampur",
                "address": "Village Rampur Main Road, Chandanpur",
                "latitude": 25.5500,
                "longitude": 85.0800,
                "phone": "+91 94310 11003",
                "doctor_available": True,
                "pharmacy_available": True,
                "diagnostics_available": True,
                "emergency_available": False,
                "services": json.dumps([
                    "General OPD", "Maternal Care", "Child Care", "Basic Diagnostics", "Pharmacy", "Vaccination"
                ]),
                "operating_hours": "9:00 AM - 4:00 PM"
            },
            {
                "id": "FAC-SC-01",
                "name": "Rampur East Health Sub-Centre",
                "type": "Sub-Centre",
                "district": "Chandanpur",
                "block": "Rampur",
                "address": "Panchayat Bhavan, Rampur East",
                "latitude": 25.5350,
                "longitude": 85.0600,
                "phone": "+91 94310 11004",
                "doctor_available": False,  # ANM/CHO operated
                "pharmacy_available": True,
                "diagnostics_available": False,
                "emergency_available": False,
                "services": json.dumps([
                    "General Treatment", "Vaccination", "Antenatal Checkup", "Pharmacy"
                ]),
                "operating_hours": "9:00 AM - 2:00 PM"
            },
            {
                "id": "FAC-SDH-01",
                "name": "Kishanganj Sub-District Hospital",
                "type": "Sub-District Hospital",
                "district": "Kishanganj",
                "block": "Kishanganj West",
                "address": "Hospital Road, Kishanganj",
                "latitude": 26.1000,
                "longitude": 87.9500,
                "phone": "+91 94310 22001",
                "doctor_available": True,
                "pharmacy_available": True,
                "diagnostics_available": True,
                "emergency_available": True,
                "services": json.dumps([
                    "General OPD", "Specialist Consultation", "Maternal Care", "Orthopedics",
                    "Diagnostics", "Pharmacy", "Emergency"
                ]),
                "operating_hours": "24x7 Emergency / 8:30 AM - 3:30 PM OPD"
            },
            {
                "id": "FAC-CHC-02",
                "name": "Kishanganj South CHC",
                "type": "Community Health Centre (CHC)",
                "district": "Kishanganj",
                "block": "South Block",
                "address": "Near Bus Stand, Kishanganj South",
                "latitude": 26.0700,
                "longitude": 87.9200,
                "phone": "+91 94310 22002",
                "doctor_available": True,
                "pharmacy_available": False,  # Stockout demo
                "diagnostics_available": True,
                "emergency_available": False,
                "services": json.dumps([
                    "General OPD", "Maternal Care", "Child Care", "Diagnostics"
                ]),
                "operating_hours": "9:00 AM - 5:00 PM"
            },
            {
                "id": "FAC-PHC-02",
                "name": "Belwa Primary Health Centre",
                "type": "Primary Health Centre (PHC)",
                "district": "Kishanganj",
                "block": "Belwa",
                "address": "Belwa Market Road, Kishanganj",
                "latitude": 26.1500,
                "longitude": 87.8800,
                "phone": "+91 94310 22003",
                "doctor_available": False,  # Gap demo
                "pharmacy_available": True,
                "diagnostics_available": False,
                "emergency_available": False,
                "services": json.dumps([
                    "General Treatment", "Vaccination", "Pharmacy"
                ]),
                "operating_hours": "9:00 AM - 3:00 PM"
            },
            {
                "id": "FAC-DH-02",
                "name": "Ramgarh District Hospital",
                "type": "District Hospital",
                "district": "Ramgarh",
                "block": "Ramgarh Sadar",
                "address": "Court Road, Ramgarh",
                "latitude": 23.6300,
                "longitude": 85.5100,
                "phone": "+91 94310 33001",
                "doctor_available": True,
                "pharmacy_available": True,
                "diagnostics_available": True,
                "emergency_available": True,
                "services": json.dumps([
                    "General OPD", "Specialist Consultation", "Cardiology", "General Surgery",
                    "Maternal Care", "Diagnostics", "Pharmacy", "Emergency"
                ]),
                "operating_hours": "24x7 Emergency / 8:00 AM - 4:00 PM OPD"
            },
            {
                "id": "FAC-CHC-03",
                "name": "Gola Community Health Centre",
                "type": "Community Health Centre (CHC)",
                "district": "Ramgarh",
                "block": "Gola",
                "address": "Gola Block Chowk, Ramgarh",
                "latitude": 23.5800,
                "longitude": 85.6900,
                "phone": "+91 94310 33002",
                "doctor_available": True,
                "pharmacy_available": True,
                "diagnostics_available": True,
                "emergency_available": True,
                "services": json.dumps([
                    "General OPD", "Maternal Care", "Child Care", "Diagnostics", "Pharmacy"
                ]),
                "operating_hours": "9:00 AM - 4:30 PM"
            },
            {
                "id": "FAC-SC-02",
                "name": "Gola West Health Sub-Centre",
                "type": "Sub-Centre",
                "district": "Ramgarh",
                "block": "Gola",
                "address": "Village Harin, Gola West, Ramgarh",
                "latitude": 23.5600,
                "longitude": 85.7200,
                "phone": "+91 94310 33003",
                "doctor_available": False,
                "pharmacy_available": True,
                "diagnostics_available": False,
                "emergency_available": False,
                "services": json.dumps([
                    "General Treatment", "Vaccination", "Pharmacy"
                ]),
                "operating_hours": "9:00 AM - 1:00 PM"
            }
        ]

        for f_data in facilities_data:
            fac = models.Facility(**f_data)
            db.add(fac)
        db.flush()

        # 2. DEMO USERS
        users_data = [
            {
                "id": "USR-PAT-01",
                "email": "patient@demo.com",
                "name": "Ramesh Kumar (Demo Patient)",
                "role": "patient",
                "facility_id": "FAC-PHC-01",
                "district": "Chandanpur"
            },
            {
                "id": "USR-HW-01",
                "email": "worker@demo.com",
                "name": "Sunita Devi (ANM / Health Worker)",
                "role": "health_worker",
                "facility_id": "FAC-PHC-01",
                "district": "Chandanpur"
            },
            {
                "id": "USR-FAC-01",
                "email": "facility@demo.com",
                "name": "Dr. A. K. Verma (District Hospital Admin)",
                "role": "facility",
                "facility_id": "FAC-DH-01",
                "district": "Chandanpur"
            },
            {
                "id": "USR-ADM-01",
                "email": "admin@demo.com",
                "name": "Dr. Rajesh Singh (CMO / Gov Admin)",
                "role": "admin",
                "facility_id": None,
                "district": "Chandanpur"
            }
        ]
        for u in users_data:
            db.add(models.User(**u))
        db.flush()

        # 3. HEALTH WORKERS
        workers_data = [
            {
                "id": "HW-01",
                "user_id": "USR-HW-01",
                "name": "Sunita Devi",
                "designation": "Auxiliary Nurse Midwife (ANM)",
                "assigned_facility_id": "FAC-PHC-01",
                "phone": "+91 98765 43210"
            },
            {
                "id": "HW-02",
                "user_id": None,
                "name": "Rekha Kumari",
                "designation": "ASHA Facilitator",
                "assigned_facility_id": "FAC-SC-01",
                "phone": "+91 98765 43211"
            },
            {
                "id": "HW-03",
                "user_id": None,
                "name": "Amit Mandal",
                "designation": "Community Health Officer (CHO)",
                "assigned_facility_id": "FAC-PHC-02",
                "phone": "+91 98765 43212"
            }
        ]
        for w in workers_data:
            db.add(models.HealthWorker(**w))
        db.flush()

        # 4. PATIENTS (20 realistic patients)
        patients_data = [
            {"id": "PAT-101", "abha_id": "ABHA-9821-4321-0987", "name": "Ramesh Kumar", "age": 54, "gender": "Male", "phone": "+91 98765 11001", "village": "Rampur", "block": "Rampur", "district": "Chandanpur", "primary_facility_id": "FAC-PHC-01"},
            {"id": "PAT-102", "abha_id": "ABHA-8712-9843-1122", "name": "Geeta Sharma", "age": 28, "gender": "Female", "phone": "+91 98765 11002", "village": "Rampur East", "block": "Rampur", "district": "Chandanpur", "primary_facility_id": "FAC-SC-01"},
            {"id": "PAT-103", "abha_id": "ABHA-6621-3382-7711", "name": "Mohammad Irfan", "age": 42, "gender": "Male", "phone": "+91 98765 11003", "village": "Chandanpur Basti", "block": "North Block", "district": "Chandanpur", "primary_facility_id": "FAC-CHC-01"},
            {"id": "PAT-104", "abha_id": "ABHA-5412-8877-3344", "name": "Pooja Kumari", "age": 24, "gender": "Female", "phone": "+91 98765 11004", "village": "Simra", "block": "Rampur", "district": "Chandanpur", "primary_facility_id": "FAC-PHC-01"},
            {"id": "PAT-105", "abha_id": "ABHA-4311-6622-9900", "name": "Sita Ram Yadav", "age": 67, "gender": "Male", "phone": "+91 98765 11005", "village": "Rampur", "block": "Rampur", "district": "Chandanpur", "primary_facility_id": "FAC-PHC-01"},
            {"id": "PAT-106", "abha_id": "ABHA-3211-5544-7788", "name": "Manju Devi", "age": 35, "gender": "Female", "phone": "+91 98765 11006", "village": "Belwa Tola", "block": "Belwa", "district": "Kishanganj", "primary_facility_id": "FAC-PHC-02"},
            {"id": "PAT-107", "abha_id": "ABHA-2199-4433-8866", "name": "Vikram Soren", "age": 19, "gender": "Male", "phone": "+91 98765 11007", "village": "Belwa", "block": "Belwa", "district": "Kishanganj", "primary_facility_id": "FAC-PHC-02"},
            {"id": "PAT-108", "abha_id": "ABHA-1988-3322-5544", "name": "Anjali Soren", "age": 31, "gender": "Female", "phone": "+91 98765 11008", "village": "Kishanganj South", "block": "South Block", "district": "Kishanganj", "primary_facility_id": "FAC-CHC-02"},
            {"id": "PAT-109", "abha_id": "ABHA-7766-2211-4499", "name": "Basant Mahto", "age": 60, "gender": "Male", "phone": "+91 98765 11009", "village": "Gola Basti", "block": "Gola", "district": "Ramgarh", "primary_facility_id": "FAC-CHC-03"},
            {"id": "PAT-110", "abha_id": "ABHA-8855-1100-3322", "name": "Kamla Devi", "age": 45, "gender": "Female", "phone": "+91 98765 11010", "village": "Harin", "block": "Gola", "district": "Ramgarh", "primary_facility_id": "FAC-SC-02"},
            {"id": "PAT-111", "abha_id": "ABHA-9944-0099-2211", "name": "Dinesh Oraon", "age": 38, "gender": "Male", "phone": "+91 98765 11011", "village": "Ramgarh Rural", "block": "Ramgarh Sadar", "district": "Ramgarh", "primary_facility_id": "FAC-DH-02"},
            {"id": "PAT-112", "abha_id": "ABHA-4433-7766-1188", "name": "Kavita Roy", "age": 22, "gender": "Female", "phone": "+91 98765 11012", "village": "North Chandanpur", "block": "North Block", "district": "Chandanpur", "primary_facility_id": "FAC-CHC-01"},
            {"id": "PAT-113", "abha_id": "ABHA-5522-8855-2277", "name": "Suraj Pandey", "age": 49, "gender": "Male", "phone": "+91 98765 11013", "village": "Rampur East", "block": "Rampur", "district": "Chandanpur", "primary_facility_id": "FAC-SC-01"},
            {"id": "PAT-114", "abha_id": "ABHA-6611-9944-3366", "name": "Shobha Gupta", "age": 52, "gender": "Female", "phone": "+91 98765 11014", "village": "Civil Lines", "block": "Chandanpur Sadar", "district": "Chandanpur", "primary_facility_id": "FAC-DH-01"},
            {"id": "PAT-115", "abha_id": "ABHA-7700-0033-4455", "name": "Arun Prasad", "age": 16, "gender": "Male", "phone": "+91 98765 11015", "village": "Rampur", "block": "Rampur", "district": "Chandanpur", "primary_facility_id": "FAC-PHC-01"},
            {"id": "PAT-116", "abha_id": "ABHA-8899-1122-5544", "name": "Nirmala Devi", "age": 63, "gender": "Female", "phone": "+91 98765 11016", "village": "Belwa", "block": "Belwa", "district": "Kishanganj", "primary_facility_id": "FAC-PHC-02"},
            {"id": "PAT-117", "abha_id": "ABHA-9988-2233-6633", "name": "Pankaj Kumar", "age": 30, "gender": "Male", "phone": "+91 98765 11017", "village": "Kishanganj", "block": "Kishanganj West", "district": "Kishanganj", "primary_facility_id": "FAC-SDH-01"},
            {"id": "PAT-118", "abha_id": "ABHA-1177-3344-7722", "name": "Anita Munda", "age": 27, "gender": "Female", "phone": "+91 98765 11018", "village": "Harin", "block": "Gola", "district": "Ramgarh", "primary_facility_id": "FAC-SC-02"},
            {"id": "PAT-119", "abha_id": "ABHA-2266-4455-8811", "name": "Gopal Chandra", "age": 71, "gender": "Male", "phone": "+91 98765 11019", "village": "Gola", "block": "Gola", "district": "Ramgarh", "primary_facility_id": "FAC-CHC-03"},
            {"id": "PAT-120", "abha_id": "ABHA-3355-5566-9900", "name": "Meera Bai", "age": 39, "gender": "Female", "phone": "+91 98765 11020", "village": "Ramgarh", "block": "Ramgarh Sadar", "district": "Ramgarh", "primary_facility_id": "FAC-DH-02"}
        ]
        for p in patients_data:
            db.add(models.Patient(**p))
        db.flush()

        # 5. MEDICINES FOR ALL FACILITIES
        med_names = [
            ("Paracetamol 500mg", "Analgesic"),
            ("ORS Packets", "Electrolyte"),
            ("Amoxicillin 500mg", "Antibiotic"),
            ("Iron & Folic Acid", "Maternal Health"),
            ("Metformin 500mg", "Antidiabetic"),
            ("Amlodipine 5mg", "Cardiovascular"),
            ("Albendazole 400mg", "Anthelmintic"),
            ("Ciprofloxacin Eye/Ear Drops", "Ophthalmic")
        ]
        for fac in facilities_data:
            for idx, (m_name, m_cat) in enumerate(med_names):
                # Introduce realistic variation: CHC Kishanganj has shortages, Sub-Centres have limited stock
                status = "AVAILABLE"
                qty = "500-1000 units"
                if fac["id"] == "FAC-CHC-02" and idx in [0, 2, 4]:
                    status = "OUT_OF_STOCK"
                    qty = "0 units"
                elif fac["id"] == "FAC-SC-01" and idx in [2, 4, 5]:
                    status = "OUT_OF_STOCK"
                    qty = "0 units"
                elif idx in [1, 6]:
                    status = "AVAILABLE"
                    qty = "1000+ units"
                elif idx == 3 and fac["id"] in ["FAC-PHC-02", "FAC-SC-02"]:
                    status = "LOW_STOCK"
                    qty = "< 50 units"

                med = models.Medicine(
                    facility_id=fac["id"],
                    name=m_name,
                    category=m_cat,
                    status=status,
                    quantity_range=qty,
                    last_updated=datetime.utcnow() - timedelta(days=idx)
                )
                db.add(med)
        db.flush()

        # 6. DIAGNOSTICS FOR ALL FACILITIES
        diag_names = [
            ("CBC (Complete Blood Count)", "1 hour"),
            ("Blood Sugar (Random/Fasting)", "15 mins"),
            ("Blood Pressure Check", "Immediate"),
            ("Urine Routine & Microscopic", "30 mins"),
            ("X-Ray Digital Chest", "Same Day"),
            ("Ultrasound (USG Abdomen/Pelvis)", "1-2 days"),
            ("ECG (12-Lead Electrocardiogram)", "15 mins")
        ]
        for fac in facilities_data:
            for idx, (d_name, t_time) in enumerate(diag_names):
                status = "AVAILABLE"
                if "Sub-Centre" in fac["type"]:
                    status = "UNAVAILABLE" if idx > 2 else "AVAILABLE"
                elif "PHC" in fac["type"]:
                    status = "REFERRAL_REQUIRED" if idx in [4, 5] else "AVAILABLE"
                elif fac["id"] == "FAC-PHC-02":
                    status = "UNAVAILABLE"  # Diagnostic gap demo
                elif "District Hospital" in fac["type"]:
                    status = "AVAILABLE"

                diag = models.Diagnostic(
                    facility_id=fac["id"],
                    name=d_name,
                    status=status,
                    turnaround_time=t_time,
                    last_updated=datetime.utcnow() - timedelta(days=idx)
                )
                db.add(diag)
        db.flush()

        # 7. REFERRALS (24 seeded referrals representing various stages)
        now = datetime.utcnow()
        referrals_seed = [
            # 1. Active demo candidate: Routine/Urgent ready to transition
            {
                "id": "REF-2026-00001",
                "patient_id": "PAT-101",
                "referring_facility_id": "FAC-PHC-01",
                "receiving_facility_id": "FAC-DH-01",
                "referring_health_worker_id": "HW-01",
                "reason": "Exertional chest pain and uncontrolled hypertension; needs Cardiology evaluation",
                "required_service": "Specialist Consultation - Cardiology",
                "priority": "Urgent",
                "current_status": "REFERRED",
                "clinical_notes": "BP 168/104 mmHg. Initial ECG at PHC shows ST depression in V4-V6. Sublingual nitrate given.",
                "days_ago": 1,
                "history": [
                    ("REFERRED", 1, "FAC-PHC-01", "Health Worker", "Sunita Devi (ANM)", "Initiated urgent cardiology referral")
                ]
            },
            # 2. Accepted referral
            {
                "id": "REF-2026-00002",
                "patient_id": "PAT-102",
                "referring_facility_id": "FAC-SC-01",
                "receiving_facility_id": "FAC-CHC-01",
                "referring_health_worker_id": "HW-02",
                "reason": "High-risk pregnancy (28 weeks, severe anemia Hb 7.2 g/dL)",
                "required_service": "Maternal Care - High Risk Obstetrics",
                "priority": "Urgent",
                "current_status": "ACCEPTED",
                "clinical_notes": "Primi gravida, severe pallor, pedal edema. Requires injectable iron therapy and ultrasound.",
                "days_ago": 2,
                "history": [
                    ("REFERRED", 2, "FAC-SC-01", "Health Worker", "Rekha Kumari (ASHA)", "High risk pregnancy flagged during village ANC drive"),
                    ("ACCEPTED", 1, "FAC-CHC-01", "Facility Doctor", "Dr. S. K. Roy (CHC Chandanpur)", "Referral accepted. Bed and IV Iron sucrose reserved.")
                ]
            },
            # 3. Patient Received
            {
                "id": "REF-2026-00003",
                "patient_id": "PAT-103",
                "referring_facility_id": "FAC-CHC-01",
                "receiving_facility_id": "FAC-DH-01",
                "referring_health_worker_id": "HW-01",
                "reason": "Suspected acute appendicitis with localized peritonitis",
                "required_service": "General Surgery",
                "priority": "Emergency",
                "current_status": "PATIENT_RECEIVED",
                "clinical_notes": "Rebound tenderness in right iliac fossa. TLC 16,800. Fasting maintained.",
                "days_ago": 3,
                "history": [
                    ("REFERRED", 3, "FAC-CHC-01", "Health Worker", "Sunita Devi", "Acute surgical emergency referred"),
                    ("ACCEPTED", 3, "FAC-DH-01", "Facility Doctor", "Dr. A. K. Verma", "Surgical triage accepted, OT alert sounded"),
                    ("PATIENT_RECEIVED", 2, "FAC-DH-01", "Triage Nurse", "Sister Reena", "Patient admitted in Emergency Ward Bed 4")
                ]
            },
            # 4. Treatment Completed (Awaiting follow-up scheduling)
            {
                "id": "REF-2026-00004",
                "patient_id": "PAT-104",
                "referring_facility_id": "FAC-PHC-01",
                "receiving_facility_id": "FAC-DH-01",
                "referring_health_worker_id": "HW-01",
                "reason": "Complicated recurrent urinary tract infection resistant to primary antibiotics",
                "required_service": "Specialist Consultation - Nephrology/Medicine",
                "priority": "Routine",
                "current_status": "TREATMENT_COMPLETED",
                "clinical_notes": "Urine culture sensitive to Ceftriaxone. 5-day IV course completed. Symptoms resolved.",
                "days_ago": 5,
                "history": [
                    ("REFERRED", 5, "FAC-PHC-01", "Health Worker", "Sunita Devi", "Antibiotic resistance referral"),
                    ("ACCEPTED", 4, "FAC-DH-01", "Facility Doctor", "Dr. Verma", "Accepted for nephrology workup"),
                    ("PATIENT_RECEIVED", 4, "FAC-DH-01", "Staff Nurse", "Anita", "Admitted in female medical ward"),
                    ("TREATMENT_COMPLETED", 2, "FAC-DH-01", "Specialist Doctor", "Dr. A. K. Verma", "Culture repeat sterile. Discharged on oral cefixime.")
                ]
            },
            # 5. Follow-Up Required (Follow-up scheduled & active in queue)
            {
                "id": "REF-2026-00005",
                "patient_id": "PAT-105",
                "referring_facility_id": "FAC-PHC-01",
                "receiving_facility_id": "FAC-DH-01",
                "referring_health_worker_id": "HW-01",
                "reason": "Type 2 Diabetes Mellitus with non-healing diabetic foot ulcer",
                "required_service": "Specialist Consultation - Surgery & Diabetology",
                "priority": "Urgent",
                "current_status": "FOLLOW_UP_REQUIRED",
                "clinical_notes": "Debridement done, glycemic control optimized with insulin glargine. Needs bi-weekly community dressing.",
                "days_ago": 7,
                "history": [
                    ("REFERRED", 7, "FAC-PHC-01", "Health Worker", "Sunita Devi", "Diabetic foot referral"),
                    ("ACCEPTED", 6, "FAC-DH-01", "Facility Doctor", "Dr. Verma", "Accepted for surgical debridement"),
                    ("PATIENT_RECEIVED", 6, "FAC-DH-01", "Staff", "Ward Incharge", "Admitted in surgery ward"),
                    ("TREATMENT_COMPLETED", 4, "FAC-DH-01", "Surgeon", "Dr. Gupta", "Debridement successful. Granulation tissue forming."),
                    ("FOLLOW_UP_REQUIRED", 3, "FAC-DH-01", "Discharge Officer", "Dr. Verma", "Scheduled community wound dressing with ANM Sunita Devi")
                ]
            },
            # 6. Closed & Completed (The ideal continuity loop!)
            {
                "id": "REF-2026-00006",
                "patient_id": "PAT-106",
                "referring_facility_id": "FAC-PHC-02",
                "receiving_facility_id": "FAC-SDH-01",
                "referring_health_worker_id": "HW-03",
                "reason": "Chronic obstructive pulmonary disease (COPD) acute exacerbation",
                "required_service": "Specialist Consultation - Pulmonology",
                "priority": "Urgent",
                "current_status": "CLOSED",
                "clinical_notes": "Nebulization, steroids, and oxygen therapy completed. Inhaler technique trained.",
                "days_ago": 14,
                "history": [
                    ("REFERRED", 14, "FAC-PHC-02", "Health Worker", "Amit Mandal (CHO)", "Severe respiratory distress referred"),
                    ("ACCEPTED", 13, "FAC-SDH-01", "Facility Doctor", "Dr. Sen", "Accepted in Pulmonology Ward"),
                    ("PATIENT_RECEIVED", 13, "FAC-SDH-01", "Triage Staff", "Nurse Mary", "Patient received, SpO2 88% on room air"),
                    ("TREATMENT_COMPLETED", 10, "FAC-SDH-01", "Pulmonologist", "Dr. Sen", "Discharged stable with meter-dose inhaler"),
                    ("FOLLOW_UP_REQUIRED", 10, "FAC-SDH-01", "Discharge Desk", "Dr. Sen", "Community home visit scheduled for inhaler compliance"),
                    ("FOLLOW_UP_COMPLETED", 5, "FAC-PHC-02", "Health Worker", "Amit Mandal (CHO)", "Home visit complete. Inhaler technique verified. SpO2 96%."),
                    ("CLOSED", 5, "FAC-PHC-02", "System / Continuity Engine", "Swasthya Setu Core", "Referral cycle successfully completed and closed.")
                ]
            },
            # 7. Closed referral 2 (Maternal delivery completion)
            {
                "id": "REF-2026-00007",
                "patient_id": "PAT-108",
                "referring_facility_id": "FAC-CHC-02",
                "receiving_facility_id": "FAC-SDH-01",
                "referring_health_worker_id": "HW-03",
                "reason": "Obstructed labor, fetal distress",
                "required_service": "Emergency Caesarean Section",
                "priority": "Emergency",
                "current_status": "CLOSED",
                "clinical_notes": "Successful LSCS delivery. Healthy baby boy 3.1 kg. Mother stable.",
                "days_ago": 20,
                "history": [
                    ("REFERRED", 20, "FAC-CHC-02", "Health Worker", "Amit Mandal", "Emergency C-section referral"),
                    ("ACCEPTED", 20, "FAC-SDH-01", "Facility Doctor", "Dr. Sen", "OT mobilized"),
                    ("PATIENT_RECEIVED", 20, "FAC-SDH-01", "OT Staff", "Sister Anjali", "Directly shifted to OT"),
                    ("TREATMENT_COMPLETED", 15, "FAC-SDH-01", "Obstetrician", "Dr. Das", "Post-op recovery satisfactory"),
                    ("FOLLOW_UP_REQUIRED", 15, "FAC-SDH-01", "Discharge Desk", "Dr. Das", "Suture removal and newborn vaccination follow-up"),
                    ("FOLLOW_UP_COMPLETED", 8, "FAC-CHC-02", "Health Worker", "Amit Mandal", "Suture removed clean. BCG and Polio-0 administered."),
                    ("CLOSED", 8, "FAC-CHC-02", "System", "Swasthya Setu Core", "Continuity completed")
                ]
            },
            # 8. Additional referrals across other facilities
            {
                "id": "REF-2026-00008",
                "patient_id": "PAT-109",
                "referring_facility_id": "FAC-CHC-03",
                "receiving_facility_id": "FAC-DH-02",
                "referring_health_worker_id": None,
                "reason": "Cataract advanced mature in right eye; needs phacoemulsification",
                "required_service": "Specialist Consultation - Ophthalmology",
                "priority": "Routine",
                "current_status": "ACCEPTED",
                "clinical_notes": "Vision counting fingers at 1 meter. Retinal check clear.",
                "days_ago": 4,
                "history": [
                    ("REFERRED", 4, "FAC-CHC-03", "Medical Officer", "Dr. Tirkey", "Surgical eye referral"),
                    ("ACCEPTED", 2, "FAC-DH-02", "Facility Doctor", "Dr. Minz", "Scheduled for Tuesday OT list")
                ]
            },
            {
                "id": "REF-2026-00009",
                "patient_id": "PAT-110",
                "referring_facility_id": "FAC-SC-02",
                "receiving_facility_id": "FAC-CHC-03",
                "referring_health_worker_id": None,
                "reason": "Chronic arthritis with severe knee joint effusion",
                "required_service": "Orthopedics & Joint Aspiration",
                "priority": "Routine",
                "current_status": "REFERRED",
                "clinical_notes": "Inability to bear weight. Local swelling and tenderness.",
                "days_ago": 1,
                "history": [
                    ("REFERRED", 1, "FAC-SC-02", "Health Worker", "Kamla Devi", "Initial referral created")
                ]
            },
            {
                "id": "REF-2026-00010",
                "patient_id": "PAT-111",
                "referring_facility_id": "FAC-DH-02",
                "receiving_facility_id": "FAC-DH-01",
                "referring_health_worker_id": None,
                "reason": "Tertiary neurosurgery evaluation post motor vehicle accident",
                "required_service": "Specialist Consultation - Neurosurgery",
                "priority": "Emergency",
                "current_status": "PATIENT_RECEIVED",
                "clinical_notes": "CT shows subdural hematoma 4mm. GCS 13. Conscious but confused.",
                "days_ago": 2,
                "history": [
                    ("REFERRED", 2, "FAC-DH-02", "Casualty Officer", "Dr. Soren", "Inter-district tertiary transfer"),
                    ("ACCEPTED", 2, "FAC-DH-01", "Facility Doctor", "Dr. Verma", "Neuro ICU bed confirmed"),
                    ("PATIENT_RECEIVED", 1, "FAC-DH-01", "ICU Staff", "Nurse David", "Patient monitored in Neuro ICU")
                ]
            },
            {
                "id": "REF-2026-00011",
                "patient_id": "PAT-112",
                "referring_facility_id": "FAC-CHC-01",
                "receiving_facility_id": "FAC-DH-01",
                "referring_health_worker_id": "HW-01",
                "reason": "Persistent fever with thrombocytopenia (Platelet 45,000); suspected Dengue",
                "required_service": "Diagnostics & Intensive Care",
                "priority": "Urgent",
                "current_status": "TREATMENT_COMPLETED",
                "clinical_notes": "Platelet infusion and supportive hydration given. Count stabilized at 120,000.",
                "days_ago": 6,
                "history": [
                    ("REFERRED", 6, "FAC-CHC-01", "Health Worker", "Sunita Devi", "Dengue with warning signs"),
                    ("ACCEPTED", 5, "FAC-DH-01", "Facility Doctor", "Dr. Verma", "Accepted for platelet backup"),
                    ("PATIENT_RECEIVED", 5, "FAC-DH-01", "Staff", "Ward Staff", "Received in HDU"),
                    ("TREATMENT_COMPLETED", 2, "FAC-DH-01", "Physician", "Dr. Verma", "Vitals stable, afebrile for 48 hrs")
                ]
            },
            {
                "id": "REF-2026-00012",
                "patient_id": "PAT-113",
                "referring_facility_id": "FAC-SC-01",
                "receiving_facility_id": "FAC-PHC-01",
                "referring_health_worker_id": "HW-02",
                "reason": "Dog bite Category III on left calf; needs Anti-Rabies Immunoglobulin (RIG)",
                "required_service": "Emergency - Anti-Rabies RIG",
                "priority": "Urgent",
                "current_status": "CLOSED",
                "clinical_notes": "Wound washed under running water. RIG infiltrated locally. Day 0, 3, 7 ARV completed.",
                "days_ago": 18,
                "history": [
                    ("REFERRED", 18, "FAC-SC-01", "Health Worker", "Rekha Kumari", "Category III rabies exposure"),
                    ("ACCEPTED", 18, "FAC-PHC-01", "Facility Doctor", "Dr. Sinha", "Rabies serum in stock, accepted"),
                    ("PATIENT_RECEIVED", 18, "FAC-PHC-01", "Nursing Staff", "Sunita", "RIG administered"),
                    ("TREATMENT_COMPLETED", 15, "FAC-PHC-01", "MO", "Dr. Sinha", "Dose 2 & 3 given"),
                    ("FOLLOW_UP_REQUIRED", 15, "FAC-PHC-01", "MO", "Dr. Sinha", "Day 14 and Day 28 vaccination reminders"),
                    ("FOLLOW_UP_COMPLETED", 7, "FAC-SC-01", "Health Worker", "Rekha Kumari", "Vaccination completed, wound healed"),
                    ("CLOSED", 7, "FAC-SC-01", "System", "Swasthya Setu Core", "Course closed successfully")
                ]
            }
        ]

        for r_seed in referrals_seed:
            created_dt = now - timedelta(days=r_seed["days_ago"])
            ref = models.Referral(
                id=r_seed["id"],
                patient_id=r_seed["patient_id"],
                referring_facility_id=r_seed["referring_facility_id"],
                receiving_facility_id=r_seed["receiving_facility_id"],
                referring_health_worker_id=r_seed["referring_health_worker_id"],
                reason=r_seed["reason"],
                required_service=r_seed["required_service"],
                priority=r_seed["priority"],
                current_status=r_seed["current_status"],
                clinical_notes=r_seed["clinical_notes"],
                created_at=created_dt,
                updated_at=now - timedelta(days=max(0, r_seed["days_ago"] - 1))
            )
            db.add(ref)
            db.flush()

            for st, d_ago, fac_id, r_role, r_name, r_note in r_seed["history"]:
                hist = models.ReferralStatusHistory(
                    referral_id=ref.id,
                    status=st,
                    timestamp=now - timedelta(days=d_ago),
                    facility_id=fac_id,
                    action_by_role=r_role,
                    action_by_name=r_name,
                    note=r_note
                )
                db.add(hist)

        # 8. FOLLOW-UPS
        follow_ups_seed = [
            {
                "id": "FOL-2026-00001",
                "referral_id": "REF-2026-00005",
                "patient_id": "PAT-105",
                "assigned_worker_id": "HW-01",
                "assigned_facility_id": "FAC-PHC-01",
                "scheduled_date": date.today().isoformat(),  # DUE TODAY
                "reason": "Check post-treatment wound healing and blood sugar adherence for diabetic foot",
                "status": "DUE",
                "completion_date": None,
                "notes": "Patient reports mild pain, requires sterile gauze dressing change.",
                "created_at": now - timedelta(days=3)
            },
            {
                "id": "FOL-2026-00002",
                "referral_id": "REF-2026-00004",
                "patient_id": "PAT-104",
                "assigned_worker_id": "HW-01",
                "assigned_facility_id": "FAC-PHC-01",
                "scheduled_date": (date.today() + timedelta(days=2)).isoformat(),  # UPCOMING
                "reason": "Check for recurrence of UTI dysuria and confirm full completion of oral antibiotics",
                "status": "UPCOMING",
                "completion_date": None,
                "notes": None,
                "created_at": now - timedelta(days=2)
            },
            {
                "id": "FOL-2026-00003",
                "referral_id": "REF-2026-00006",
                "patient_id": "PAT-106",
                "assigned_worker_id": "HW-03",
                "assigned_facility_id": "FAC-PHC-02",
                "scheduled_date": (date.today() - timedelta(days=5)).isoformat(),  # COMPLETED
                "reason": "Home visit for COPD inhaler technique compliance and pulse oximetry",
                "status": "COMPLETED",
                "completion_date": now - timedelta(days=5),
                "notes": "Visited patient home in Belwa. SpO2 96%. Inhaler technique verified.",
                "created_at": now - timedelta(days=10)
            },
            {
                "id": "FOL-2026-00004",
                "referral_id": "REF-2026-00007",
                "patient_id": "PAT-108",
                "assigned_worker_id": "HW-03",
                "assigned_facility_id": "FAC-CHC-02",
                "scheduled_date": (date.today() - timedelta(days=8)).isoformat(),  # COMPLETED
                "reason": "Post LSCS wound check, suture removal, and newborn vaccination",
                "status": "COMPLETED",
                "completion_date": now - timedelta(days=8),
                "notes": "Post LSCS suture removed. Infant immunization initiated.",
                "created_at": now - timedelta(days=15)
            },
            {
                "id": "FOL-2026-00005",
                "referral_id": "REF-2026-00002",
                "patient_id": "PAT-102",
                "assigned_worker_id": "HW-02",
                "assigned_facility_id": "FAC-SC-01",
                "scheduled_date": (date.today() - timedelta(days=2)).isoformat(),  # OVERDUE (Needs urgent attention)
                "reason": "Confirm if patient visited CHC for IV iron infusion; check fetal heart rate",
                "status": "OVERDUE",
                "completion_date": None,
                "notes": "Patient family phone unreachable yesterday. Physical home check needed.",
                "created_at": now - timedelta(days=5)
            }
        ]

        for fol in follow_ups_seed:
            db.add(models.FollowUp(**fol))

        db.commit()
        print("Swasthya Setu database seeded successfully with rich demo data!")
    except Exception as e:
        db.rollback()
        print("Error during seed:", e)
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
