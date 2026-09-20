"""
test_ai_and_booking.py — Test suite for Swasthya Setu AI Assistant & Smart Booking features
"""
import sys
import io

# Force UTF-8 on Windows console output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from fastapi.testclient import TestClient
from main import app, startup_event

# Ensure startup seeding has run
startup_event()
client = TestClient(app)

def test_ai_and_booking_flow():
    print("\n" + "="*70)
    print("SWASTHYA SETU — AI ASSISTANT & SMART BOOKING TEST SUITE")
    print("="*70)

    # 1. AI Service Status
    print("\n--- 1. Testing AI Status Endpoint ---")
    res = client.get("/api/ai/status")
    assert res.status_code == 200, res.text
    ai_stat = res.json()
    print("AI Status:", ai_stat)
    assert "ai_enabled" in ai_stat
    assert "demo_mode" in ai_stat

    # 2. AI Chat Endpoint
    print("\n--- 2. Testing AI Conversational Chat (/api/ai/chat) ---")
    chat_payload = {
        "messages": [
            {"role": "user", "content": "मुझे 2 दिन से बहुत तेज बुखार और सिरदर्द है।"}
        ],
        "language": "hi"
    }
    res = client.post("/api/ai/chat", json=chat_payload)
    assert res.status_code == 200, res.text
    chat_data = res.json()
    print("AI Chat Reply:", chat_data["reply"][:120] + "...")
    assert len(chat_data["reply"]) > 10

    # 3. AI Symptom Assessment (Structured JSON)
    print("\n--- 3. Testing Symptom Triage Assessment (/api/ai/symptom-assessment) ---")
    assessment_payload = {
        "symptoms": "High fever with chills, body ache and severe headache for 3 days",
        "language": "en"
    }
    res = client.post("/api/ai/symptom-assessment", json=assessment_payload)
    assert res.status_code == 200, res.text
    assess_data = res.json()
    print(f"Symptoms: {assess_data.get('symptoms')}")
    print(f"Urgency Level: {assess_data.get('urgency')}")
    print(f"Possible Conditions: {assess_data.get('possible_conditions')}")
    print(f"Recommended Specialty: {assess_data.get('recommended_specialty')}")
    print(f"Recommended Facility: {assess_data.get('recommended_centre_type')}")
    print(f"Medical Disclaimer: {assess_data.get('disclaimer')[:80]}...")
    assert "urgency" in assess_data
    assert "disclaimer" in assess_data

    # 4. Smart Healthcare Centre Recommendation (Nearby + GPS Distance + ETA)
    print("\n--- 4. Testing Nearby Facilities with Distance & ETA (/api/healthcare-centres/nearby) ---")
    res = client.get("/api/healthcare-centres/nearby?lat=25.594&lng=85.137&radius_km=100&urgency=Moderate")
    assert res.status_code == 200, res.text
    nearby_data = res.json()
    print(f"Found {nearby_data['count']} centres within 100 km.")
    assert nearby_data["count"] > 0
    nearest = nearby_data["facilities"][0]
    print(f"Nearest Facility: {nearest['name']} ({nearest['type']})")
    print(f"Distance: {nearest['distance_km']} km | ETA: ~{nearest['eta_minutes']} mins")
    print(f"Directions URL: {nearest['maps_url']}")
    assert "distance_km" in nearest
    assert "eta_minutes" in nearest
    assert "maps_url" in nearest

    # 5. Facility Appointment Slots
    print("\n--- 5. Testing Appointment Slots for Facility (/api/healthcare-centres/{id}/slots) ---")
    target_fac_id = "FAC-PHC-01"
    res = client.get(f"/api/healthcare-centres/{target_fac_id}/slots")
    assert res.status_code == 200, res.text
    slots_data = res.json()
    print(f"Facility: {slots_data['facility_name']}")
    print(f"Doctors available: {len(slots_data['doctors'])}")
    print(f"Total slots open: {slots_data['total_available']}")
    assert slots_data["total_available"] > 0
    available_slot = slots_data["available_slots"][0]
    slot_id = available_slot["slot_id"]
    print(f"Selected Slot #{slot_id}: {available_slot['slot_date']} at {available_slot['slot_time']} with {available_slot['doctor_name']}")

    # 6. Book Appointment
    print("\n--- 6. Testing Appointment Booking (/api/appointments) ---")
    booking_payload = {
        "slot_id": slot_id,
        "patient_name": "Ramesh Kumar Verma",
        "patient_phone": "9876543210",
        "patient_age": 42,
        "patient_gender": "Male",
        "chief_complaint": "Persistent high fever and severe headache"
    }
    res = client.post("/api/appointments", json=booking_payload)
    assert res.status_code == 200, res.text
    booked = res.json()
    appt_id = booked["appointment_id"]
    print(f"Appointment Confirmed! ID: {appt_id}")
    print(f"Doctor: {booked['doctor_name']} | Date: {booked['appointment_date']} at {booked['appointment_time']}")
    assert appt_id.startswith("APPT-2026-")
    assert booked["status"] == "CONFIRMED"

    # 7. Verify Slot Cannot Be Double-Booked
    print("\n--- 7. Testing Double-Booking Prevention ---")
    res_dup = client.post("/api/appointments", json=booking_payload)
    assert res_dup.status_code == 409, "Should reject double booking of the same slot"
    print("Double-booking prevented successfully with status 409 Conflict.")

    # 8. List Appointments ("My Appointments" verification)
    print("\n--- 8. Testing My Appointments Listing (/api/appointments) ---")
    res_list = client.get("/api/appointments?patient_phone=9876543210")
    assert res_list.status_code == 200, res_list.text
    appts = res_list.json()
    assert len(appts) >= 1
    found = any(a["appointment_id"] == appt_id for a in appts)
    assert found, f"Booked appointment {appt_id} should appear in patient's appointments list."
    print(f"Verified appointment {appt_id} in patient's appointment history.")

    print("\n" + "="*70)
    print("ALL AI ASSISTANT & SMART BOOKING TESTS PASSED!")
    print("="*70)

if __name__ == "__main__":
    test_ai_and_booking_flow()
