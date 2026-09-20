# Swasthya Setu (स्वास्थ्य सेतु)
### Digital Healthcare Coordination & Care-Continuity Platform for Rural and Underserved Communities
**Smart India Hackathon 2026 — Problem Statement SIH26133**

> **“Don’t just create a referral. Make sure the referral gets completed.”**

---

## 1. Project Overview
**Swasthya Setu** is a digital coordination and healthcare-continuity platform designed to solve the critical post-diagnosis drop-off gap in rural public healthcare.

In rural India, an estimated **40% to 60% of primary health centre (PHC) referrals are never completed** because of three systemic friction points:
1. **Misdirected Care Journeys:** Patients travel hours to basic Sub-Centres only to find no doctor, diagnostic lab, or emergency equipment present.
2. **The "Referral Black Hole":** Once a paper referral slip is handed to a patient, the referring health worker has zero visibility into whether the patient reached the hospital or was admitted.
3. **Follow-up Breakdown:** After hospital discharge, patients return to remote villages without structured follow-up, causing high rates of relapse and avoidable re-admissions.

### Crucial Principle
**Swasthya Setu does NOT seek to replace existing government healthcare systems** like eSanjeevani, ABHA/ABDM, or Hospital Management Information Systems (HMIS). Instead, it serves as a lightweight, intelligent **coordination and continuity layer** that bridges facilities:
$$\text{Patient} \longrightarrow \text{First Healthcare Centre} \longrightarrow \text{Intelligent Referral} \longrightarrow \text{Hospital Triage} \longrightarrow \text{Treatment} \longrightarrow \text{Community Follow-up} \longrightarrow \text{Closed Cycle}$$

---

## 2. Target Roles & Demo Credentials

To ensure effortless demonstration for evaluators and judges, Swasthya Setu features a **universal 1-click role switcher in the navigation bar**:

| Role | Demo Email | Role Profile & Purpose |
|---|---|---|
| **Patient** | `patient@demo.com` | Ramesh Kumar (54, Rampur). Bilingual (English / हिन्दी) portal to search suitable care and check real-time referral progress. |
| **Health Worker** | `worker@demo.com` | Sunita Devi (ANM). Issues digital referrals with clinical triage notes and conducts assigned community follow-ups. |
| **Hospital Facility** | `facility@demo.com` | Dr. A. K. Verma (District Hospital Chandanpur). Incoming referral queue, bed triage, clinical care discharge notes, and follow-up scheduling. |
| **Govt Admin** | `admin@demo.com` | Dr. Rajesh Singh (Chief Medical Officer). District-wide oversight: referral completion rates, funnel drop-offs, and facility problem matrix. |

> **Evaluator Tip:** A dedicated **"Reset Demo"** button is built into the top navigation header to restore all referrals and inventories to initial pristine states during live presentations.

---

## 3. Core Features

### A. Bilingual Accessible Patient Portal (English / हिन्दी)
- **Large Accessible Actions:** Designed for low digital literacy with high-contrast icons and clean layout.
- **Smart Capability-Based Recommendation:** Recommends facilities by clinical capability rather than mere geographic proximity.
  - *Example:* If a patient selects **"Specialist Consultation"**, the system directs them to a Community Health Centre (CHC) or District Hospital with an active specialist, flagging nearby Sub-Centres with an explicit advisory notice (*"⚠️ Basic Sub-Centre without specialist doctors. In-person visit would trigger immediate onward referral"*).
- **Self-Service Referral Tracker:** Patients can input their ABHA ID or Referral ID (e.g. `REF-2026-00001`) to inspect their live milestone pipeline.

### B. The 7-Stage Visual Referral Timeline (The Core Feature)
Tracks every referral across seven audited stages:
```
1. REFERRED
   ↓
2. ACCEPTED
   ↓
3. PATIENT RECEIVED
   ↓
4. TREATMENT COMPLETED
   ↓
5. FOLLOW-UP REQUIRED
   ↓
6. FOLLOW-UP COMPLETED
   ↓
7. CLOSED & COMPLETE
```
Each milestone records:
- Date and exact timestamp
- Facility where the action took place
- Person/role responsible (e.g., *Sister Anita - Triage Nurse*, *Dr. A. K. Verma - Cardiologist*, *Sunita Devi - ANM*)
- Clinical transition notes and vitals

### C. Community Follow-up Continuity Loop
- When a tertiary hospital completes in-patient treatment, the physician clicks **"Schedule Follow-up"**, specifying scheduled date, target health worker, and instructions (e.g., BP check, surgical wound dressing, medication adherence).
- This automatically transitions the referral to `FOLLOW_UP_REQUIRED` and populates the **"Follow-ups Due Today"** banner on the local health worker’s portal.
- Once the health worker visits the patient in the village and records observations, the follow-up is marked `COMPLETED` and the referral status reaches **`CLOSED`**.

### D. Live Facility Inventory & Readiness Managers
- **Medicine Formulary:** Displays essential rural medicines (Paracetamol, ORS, Amoxicillin, Iron & Folic Acid, Metformin, Amlodipine) with real-time stock statuses (`AVAILABLE`, `LOW_STOCK`, `OUT_OF_STOCK`).
- **Diagnostic Services:** Point-of-care diagnostics (CBC, Blood Sugar, Blood Pressure, Urine Routine, X-Ray, Ultrasound, ECG) with statuses (`AVAILABLE`, `UNAVAILABLE`, `REFERRAL_REQUIRED`).

### E. Government Administrator Analytics & Gap Monitoring
- **Referral Continuity Funnel:** Step chart illustrating progression from referral initiation through hospital treatment to community closure.
- **Referral Completion Rate KPI:** Directly highlights how many patients finished care rather than simply counting open referrals.
- **Facility Health Matrix:** Ranks facilities as `GOOD`, `WARNING`, or `CRITICAL` based on on-duty doctors, stockouts, and overdue follow-up counts.
- **Interactive OpenStreetMap Leaflet Map:** Displays facilities across districts, color-coded by tier (District Hospital, CHC, PHC).

---

## 4. Tech Stack

- **Backend:** Python 3.13, FastAPI, SQLAlchemy ORM, Pydantic v2, SQLite (Zero external database dependency).
- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide React icons, Recharts (analytics), Leaflet + OpenStreetMap.
- **Architecture:** Modular REST API architecture with static build mounting for single-port deployment (`http://127.0.0.1:8000/`) and separate Vite HMR dev server (`http://127.0.0.1:5173/`).

---

## 5. Folder Structure

```
swasthya-setu/
├── backend/
│   ├── database.py              # SQLite engine, sessionmaker, Base
│   ├── models.py                # 9 SQLAlchemy relational models
│   ├── schemas.py               # Pydantic schemas (requests, responses, analytics)
│   ├── crud.py                  # State machine logic, recommendation engine, analytics
│   ├── seed_data.py             # Rich fictional demo dataset (10 facilities, 20 patients, 30+ referrals)
│   ├── main.py                  # FastAPI application with REST endpoints & static mount
│   ├── test_api.py              # Automated test suite for all endpoints
│   ├── test_golden_flow.py      # Automated script validating the end-to-end hackathon demo flow
│   └── requirements.txt         # Backend Python dependencies
├── frontend/
│   ├── index.html               # Entry HTML with typography and Leaflet CDN
│   ├── vite.config.ts           # Vite bundler configuration with API proxy
│   ├── tailwind.config.js       # Custom healthcare emerald/teal design palette
│   ├── package.json             # React, Lucide, Recharts, Leaflet dependencies
│   ├── dist/                    # Compiled production bundle served directly by FastAPI
│   └── src/
│       ├── types/               # TypeScript models matching backend schemas
│       ├── api/client.ts        # Typed fetch client for backend endpoints
│       ├── context/RoleContext.tsx # 1-click role switcher & language context
│       ├── locales/translations.ts # English & Hindi (हिन्दी) dictionaries
│       ├── components/
│       │   ├── Navbar.tsx       # Universal role switcher, bilingual toggle, reset button
│       │   ├── Footer.tsx       # SIH notice and disclaimer banner
│       │   ├── ReferralTimeline.tsx # Visual 7-stage milestone progression pipeline
│       │   ├── FacilityCard.tsx # Facility card with capability fit score
│       │   ├── FacilityMap.tsx  # Interactive Leaflet / OpenStreetMap component
│       │   ├── FacilityDetailModal.tsx # Live medicine & diagnostic inventory viewer
│       │   ├── StatusBadge.tsx  # Color-coded badges for stages, priorities, and stock
│       │   └── StatCard.tsx     # KPI summary cards
│       └── pages/
│           ├── LandingPage.tsx  # SIH problem statement, architecture, journey overview
│           ├── PatientPortal.tsx # Bilingual care finder & referral tracking
│           ├── HealthWorkerPortal.tsx # Referral creation & follow-up queue
│           ├── FacilityPortal.tsx # Incoming triage queue & inventory manager
│           └── AdminDashboard.tsx # Gap analysis, funnel charts & facility matrix
└── README.md
```

---

## 6. How to Run

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ (tested on Node.js v20.18.0)

### 1. Run the Backend & Integrated Frontend (One Command)
```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
Open your browser at:
👉 **`http://127.0.0.1:8000/`** (Serves both the React frontend and REST API simultaneously!)

### 2. Optional: Run Frontend in Vite Development Mode (With Hot Reloading)
```powershell
cd frontend
npm install
npm run dev
```
Open:
👉 **`http://127.0.0.1:5173/`**

---

## 7. The Golden Demo Presentation Walkthrough

Follow this exact scenario during hackathon judging to demonstrate the platform’s core differentiator:

1. **Step 1: Open the Application**
   - Open `http://127.0.0.1:8000/` (or `http://127.0.0.1:5173/`).
   - Notice the Landing Page showing the SIH26133 problem context and core value proposition: *"Don't just create a referral. Make sure the referral gets completed."*

2. **Step 2: Patient Portal (Bilingual & Capability Matching)**
   - Click **"Patient"** in the top navigation bar.
   - Toggle to **"हिन्दी"** to demonstrate accessibility for rural citizens.
   - Select District: **"Chandanpur"** and Requirement: **"Specialist Consultation"**.
   - Observe how **Chandanpur District Hospital** is recommended (99% fit) because of on-duty specialists, while the nearby Sub-Centre displays an advisory warning that visiting would trigger an immediate onward referral.

3. **Step 3: Health Worker Creates Referral**
   - Click **"Health Worker"** in the navigation bar.
   - Click **"Create New Referral"**.
   - Select Patient: **Ramesh Kumar**, Destination: **Chandanpur District Hospital**, Priority: **Urgent**, Reason: *"Severe exertional chest pain with ST depression on ECG"*.
   - Click **"Submit Referral"**. A unique ID (e.g. `REF-2026-00014`) is generated with status `REFERRED`.

4. **Step 4: Hospital Facility Triages & Treats Patient**
   - Click **"Hospital Facility"** in the navigation bar.
   - The new referral appears in the incoming triage queue.
   - Click **"Accept Referral (Step 2)"** $\rightarrow$ status becomes `ACCEPTED`.
   - When the patient arrives, click **"Mark Patient Received (Step 3)"** $\rightarrow$ status becomes `PATIENT_RECEIVED`.
   - After stabilization, click **"Mark Treatment Completed (Step 4)"** $\rightarrow$ status becomes `TREATMENT_COMPLETED`.
   - Click **"Schedule Community Follow-up (Step 5)"** $\rightarrow$ select date, reason: *"Post-cardiac discharge: Check BP and medication adherence"*, assigned to ANM Sunita Devi.
   - Referral transitions to `FOLLOW_UP_REQUIRED`.

5. **Step 5: Health Worker Closes the Continuity Loop**
   - Switch back to **"Health Worker"** role.
   - Notice the new task in the **"Follow-ups Due Today"** banner.
   - Click **"Mark Completed"**, input visit notes: *"Visited Ramesh Kumar at home in Rampur. BP 124/82. Taking medications on time."*
   - Click **"Verify & Close Referral Cycle"**.
   - The referral status updates to **`CLOSED & COMPLETE`**!

6. **Step 6: Government Admin Monitors Public Health Gaps**
   - Click **"Govt Admin"** in the navigation bar.
   - Observe the updated KPIs: Completed Referrals incremented, Referral Completion Rate recalculated.
   - Inspect the **Referral Continuity Funnel** showing zero patient drop-off for closed cases.
   - Review the **Facility Health & Readiness Matrix** highlighting medicine stockouts and diagnostic gaps.

---

---

## 8. AI Healthcare Assistant & Smart Booking (New Intelligent Layer)

Swasthya Setu now includes an intelligent conversational healthcare layer specifically adapted for rural, low-digital-literacy users.

### Feature 1: AI Health Assistant with Voice Interaction
- **Voice-Enabled STT & TTS:** Tap 🎤 **"Tap to Speak"** to describe symptoms verbally in **Hindi, English, Punjabi, or Bengali**. Built with the browser-native Web Speech API. Text-to-speech automatically reads out responses in natural cadence.
- **Conversational Triage:** Setu AI asks clarifying follow-up questions to understand duration, severity, and associated symptoms.
- **Urgency Classification:** Categorizes cases into four clear levels:
  - 🟢 **Low:** Self-care advice, routine visit
  - 🟡 **Moderate:** Consult doctor within 24 hours
  - 🟠 **High:** Visit healthcare centre today
  - 🔴 **Emergency:** Immediate emergency triage with automated 108 ambulance hotline alert
- **Medical Safety Guardrails:** Strict disclaimers that the assistant is an AI-assisted triage tool, never a definitive medical diagnosis. No prescription medicine recommendations or dangerous dosage instructions.

### Feature 2: Smart Healthcare Centre Recommendation & Navigation
- **Location-Aware Facilities:** Computes real **Haversine geographic distance** and estimated travel time (ETA) based on rural road conditions.
- **Capability-Driven Sorting:** Matches urgency with appropriate facility tier (Emergency $\rightarrow$ District Hospital 24x7; Moderate $\rightarrow$ PHC/CHC).
- **Turn-by-Turn Navigation:** 1-click **"Get Directions"** button opens Google Maps route with an automated voice announcement of the distance and travel time.

### Feature 3: Appointment / Slot Booking Engine
- **Multi-Day Slot Calendar:** View available time slots for doctors and specialists over the next 7 days.
- **Structured Booking Confirmation:** Instant generation of unique **`APPT-2026-XXXXX`** appointment IDs.
- **Double-Booking Prevention:** Backend locks booked slots and rejects concurrent reservation attempts with HTTP 409 Conflict.
- **"My Appointments" Portal:** Patients can search and track their upcoming hospital visits by mobile number.
- **Demo Data Tagging:** All mock doctor and slot schedules are explicitly badged as **"Demo Data"** for transparent SIH evaluation.

---

## 9. New API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/ai/status` | Reports whether Gemini API key is active or running in demo mode |
| `POST` | `/api/ai/chat` | Multi-turn conversational triage dialogue (`messages`, `language`) |
| `POST` | `/api/ai/symptom-assessment` | Returns structured triage JSON (symptoms, urgency, conditions, facility recommendation, disclaimer) |
| `GET` | `/api/healthcare-centres/nearby` | Queries facilities sorted by Haversine distance, travel ETA, and capability fit (`lat`, `lng`, `radius_km`, `urgency`) |
| `GET` | `/api/healthcare-centres/{id}/slots` | Returns available 30-min consultation slots and doctor profiles |
| `POST` | `/api/appointments` | Books an appointment slot; generates `APPT-2026-XXXXX` |
| `GET` | `/api/appointments` | Lists confirmed appointments, filterable by `patient_phone` |
| `GET` | `/api/appointments/{id}` | Retrieves appointment confirmation details |

---

## 10. Data Safety & Limitations

- **Fictional Data Only:** All patient names, ABHA numbers, phone numbers, and clinical scenarios are completely fictional and generated for hackathon demonstration.
- **Not a Diagnostic Tool:** Swasthya Setu coordinates logistics, referrals, and follow-up continuity. It does NOT generate autonomous medical diagnoses or replace licensed clinical judgment.
- **Demo Mode Fallback:** If `GEMINI_API_KEY` is not provided in `backend/.env`, the system automatically falls back to deterministic demo triage assessments, ensuring a reliable SIH presentation even without internet or API quotas.

---

## 11. Future Scope
- Integration with official ABDM (Ayushman Bharat Digital Mission) Health Facility Registry (HFR) and Health Professional Registry (HPR).
- Offline-first Progressive Web App (PWA) caching with background synchronization for health workers in deep rural areas with zero cellular connectivity.
- Automated multi-lingual voice calls (IVR) in local dialects for patient follow-up reminders.
- Predictive medicine stockout forecasting using regional seasonal disease trend models.
