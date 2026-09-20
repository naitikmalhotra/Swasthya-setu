from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_all():
    print("--- 1. Testing Health Endpoint ---")
    res = client.get("/api/health")
    assert res.status_code == 200, res.text
    print("Health check passed:", res.json())

    print("\n--- 2. Testing Demo Accounts ---")
    res = client.get("/api/demo-accounts")
    assert res.status_code == 200
    accounts = res.json()
    assert len(accounts) == 4
    print("Demo accounts:", [a["email"] for a in accounts])

    print("\n--- 3. Testing Facilities & Smart Recommendation ---")
    res = client.get("/api/facilities")
    assert res.status_code == 200
    facilities = res.json()
    assert len(facilities) == 10
    print(f"Loaded {len(facilities)} facilities.")

    # Smart Recommendation test: "Specialist Consultation"
    res = client.get("/api/facilities/recommend?district=Chandanpur&requirement=Specialist+Consultation")
    assert res.status_code == 200
    recs = res.json()
    top = recs[0]
    print(f"Top recommendation for Specialist in Chandanpur: {top['name']} (Score: {top['match_score']}, Recommended: {top['is_recommended']})")
    assert top["is_recommended"] == True
    # Verify a Sub-Centre has is_recommended == False
    sub = next((f for f in recs if "Sub-Centre" in f["type"]), None)
    if sub:
        print(f"Sub-Centre match: {sub['name']} (Recommended: {sub['is_recommended']}, Reason: {sub['recommendation_reason']})")
        assert sub["is_recommended"] == False

    print("\n--- 4. Testing End-to-End Referral Creation & Transitions ---")
    # Step A: Health Worker creates a new referral
    new_ref_payload = {
        "patient_id": "PAT-101",
        "referring_facility_id": "FAC-PHC-01",
        "receiving_facility_id": "FAC-DH-01",
        "referring_health_worker_id": "HW-01",
        "reason": "Test Exertional angina with ECG abnormalities",
        "required_service": "Specialist Consultation - Cardiology",
        "priority": "Urgent",
        "clinical_notes": "BP 160/100, ST depressions"
    }
    res = client.post("/api/referrals", json=new_ref_payload)
    assert res.status_code == 200
    ref_created = res.json()
    ref_id = ref_created["id"]
    print("Created referral:", ref_id, "Status:", ref_created["status"])
    assert ref_created["status"] == "REFERRED"

    # Step B: Facility accepts referral
    res = client.post(f"/api/referrals/{ref_id}/transition", json={
        "target_status": "ACCEPTED",
        "action_by_role": "Facility Doctor",
        "action_by_name": "Dr. A. K. Verma",
        "facility_id": "FAC-DH-01",
        "note": "Cardiology bed confirmed"
    })
    assert res.status_code == 200
    assert res.json()["current_status"] == "ACCEPTED"
    print("Accepted referral:", ref_id)

    # Step C: Patient arrives and is received
    res = client.post(f"/api/referrals/{ref_id}/transition", json={
        "target_status": "PATIENT_RECEIVED",
        "action_by_role": "Staff Nurse",
        "action_by_name": "Sister Anita",
        "facility_id": "FAC-DH-01",
        "note": "Patient checked in and admitted to Bed 5"
    })
    assert res.status_code == 200
    assert res.json()["current_status"] == "PATIENT_RECEIVED"
    print("Patient received:", ref_id)

    # Step D: Treatment completed
    res = client.post(f"/api/referrals/{ref_id}/transition", json={
        "target_status": "TREATMENT_COMPLETED",
        "action_by_role": "Cardiologist",
        "action_by_name": "Dr. Verma",
        "facility_id": "FAC-DH-01",
        "note": "Coronary angiogram clear of acute occlusion; medical therapy started"
    })
    assert res.status_code == 200
    assert res.json()["current_status"] == "TREATMENT_COMPLETED"
    print("Treatment completed:", ref_id)

    # Step E: Schedule follow-up
    res = client.post("/api/follow-ups", json={
        "referral_id": ref_id,
        "patient_id": "PAT-101",
        "scheduled_date": "2026-09-12",
        "reason": "Home BP check & medication adherence",
        "assigned_worker_id": "HW-01",
        "assigned_facility_id": "FAC-PHC-01",
        "notes": "Ensure patient takes blood pressure medication daily"
    })
    assert res.status_code == 200
    fol_data = res.json()
    fol_id = fol_data["id"]
    print("Follow-up scheduled:", fol_id)

    # Verify referral status is now FOLLOW_UP_REQUIRED
    res = client.get(f"/api/referrals/{ref_id}")
    assert res.status_code == 200
    ref_detail = res.json()
    print("Current referral status after scheduling follow-up:", ref_detail["current_status"])
    assert ref_detail["current_status"] == "FOLLOW_UP_REQUIRED"
    assert len(ref_detail["history"]) >= 5

    # Step F: Health Worker completes follow-up
    res = client.post(f"/api/follow-ups/{fol_id}/complete", json={
        "action_by_name": "Sunita Devi (ANM)",
        "action_by_role": "Health Worker",
        "notes": "Visited home. BP 122/80. Taking all medications on time."
    })
    assert res.status_code == 200
    print("Follow-up completed!")

    # Verify referral status is now CLOSED
    res = client.get(f"/api/referrals/{ref_id}")
    assert res.status_code == 200
    assert res.json()["current_status"] == "CLOSED"
    print("Referral successfully reached CLOSED status!")

    print("\n--- 5. Testing Admin Analytics ---")
    res = client.get("/api/admin/analytics")
    assert res.status_code == 200
    analytics = res.json()
    print(f"Total Facilities: {analytics['total_facilities']}")
    print(f"Total Referrals: {analytics['total_referrals']}")
    print(f"Active Referrals: {analytics['active_referrals']}")
    print(f"Completed Referrals: {analytics['completed_referrals']}")
    print(f"Completion Rate: {analytics['completion_rate_percentage']}%")
    print(f"Medicine Shortages: {analytics['medicine_shortages_count']}")
    print(f"Diagnostic Gaps: {analytics['diagnostic_gaps_count']}")
    print("Facility Health Matrix length:", len(analytics["facility_metrics"]))

    print("\nALL BACKEND TESTS PASSED SUCCESSFULLY! The core referral continuity engine is 100% operational.")

if __name__ == "__main__":
    test_all()
