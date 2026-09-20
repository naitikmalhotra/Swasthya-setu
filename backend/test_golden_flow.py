import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000/api"

def make_req(endpoint, method="GET", data=None):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    body = json.dumps(data).encode("utf-8") if data else None
    with urllib.request.urlopen(req, data=body) as resp:
        return json.loads(resp.read().decode("utf-8"))

def run_golden_demo_verification():
    print("==================================================")
    print("STARTING SWASTHYA SETU GOLDEN DEMO FLOW VALIDATION")
    print("==================================================")

    # 1. Reset to initial clean state
    print("\n[Step 0] Resetting to pristine demo state...")
    reset_res = make_req("/admin/reset-demo", method="POST")
    print("Reset response:", reset_res["message"])

    initial_analytics = make_req("/admin/analytics")
    initial_completed = initial_analytics["completed_referrals"]
    print(f"Initial completed referrals: {initial_completed}")

    # 2. Login as Health Worker & Create Referral for Ramesh Kumar to Chandanpur DH
    print("\n[Step 1] Health Worker creates referral for Demo Patient Ramesh Kumar...")
    create_payload = {
        "patient_id": "PAT-101",
        "referring_facility_id": "FAC-PHC-01",
        "receiving_facility_id": "FAC-DH-01",
        "referring_health_worker_id": "HW-01",
        "reason": "Severe exertional chest pain with ST depression on ECG, uncontrolled BP 170/110",
        "required_service": "Specialist Consultation - Cardiology",
        "priority": "Urgent",
        "clinical_notes": "Sublingual sorbitrate given. Transferred via 108 ambulance."
    }
    create_res = make_req("/referrals", method="POST", data=create_payload)
    ref_id = create_res["id"]
    print(f"-> Referral successfully created! ID: {ref_id}, Initial Status: {create_res['status']}")
    assert create_res["status"] == "REFERRED"

    # 3. Facility Dashboard sees incoming referral and Accepts it
    print(f"\n[Step 2] Facility receives {ref_id} and clicks 'Accept Referral'...")
    accept_res = make_req(f"/referrals/{ref_id}/transition", method="POST", data={
        "target_status": "ACCEPTED",
        "action_by_role": "Facility Doctor",
        "action_by_name": "Dr. A. K. Verma",
        "facility_id": "FAC-DH-01",
        "note": "Cardiology triage bed reserved. On-call cardiologist notified."
    })
    print(f"-> Status transitioned: {accept_res['current_status']}")
    assert accept_res["current_status"] == "ACCEPTED"

    # 4. Patient physically arrives at hospital
    print(f"\n[Step 3] Patient arrives at hospital -> Facility marks 'Patient Received'...")
    received_res = make_req(f"/referrals/{ref_id}/transition", method="POST", data={
        "target_status": "PATIENT_RECEIVED",
        "action_by_role": "Triage Nurse",
        "action_by_name": "Sister Anita",
        "facility_id": "FAC-DH-01",
        "note": "Patient checked-in at emergency triage. Admitted in Cardiology Ward Bed 6."
    })
    print(f"-> Status transitioned: {received_res['current_status']}")
    assert received_res["current_status"] == "PATIENT_RECEIVED"

    # 5. Doctor treats patient and completes clinical care
    print(f"\n[Step 4] Clinical treatment delivered -> Facility marks 'Treatment Completed'...")
    treated_res = make_req(f"/referrals/{ref_id}/transition", method="POST", data={
        "target_status": "TREATMENT_COMPLETED",
        "action_by_role": "Cardiologist",
        "action_by_name": "Dr. A. K. Verma",
        "facility_id": "FAC-DH-01",
        "note": "Coronary angiogram performed. Medical therapy stabilized. Discharged on dual antiplatelets."
    })
    print(f"-> Status transitioned: {treated_res['current_status']}")
    assert treated_res["current_status"] == "TREATMENT_COMPLETED"

    # 6. Facility schedules community follow-up for the patient's local health worker
    print(f"\n[Step 5] Facility clicks 'Schedule Follow-up'...")
    followup_payload = {
        "referral_id": ref_id,
        "patient_id": "PAT-101",
        "scheduled_date": "2026-09-12",
        "reason": "Post-cardiac discharge: Check blood pressure, adherence to blood thinners & pedal edema",
        "assigned_worker_id": "HW-01",
        "assigned_facility_id": "FAC-PHC-01",
        "notes": "Verify patient takes aspirin & atorvastatin daily; escalate if chest tightness recurs."
    }
    fol_res = make_req("/follow-ups", method="POST", data=followup_payload)
    fol_id = fol_res["id"]
    print(f"-> Follow-up created! ID: {fol_id}")
    print(f"-> Follow-up status: {fol_res['status']}")

    ref_after_fol = make_req(f"/referrals/{ref_id}")
    print(f"-> Associated referral status updated to: {ref_after_fol['current_status']}")
    assert ref_after_fol["current_status"] == "FOLLOW_UP_REQUIRED"

    # 7. Health Worker opens portal, sees follow-up in 'Follow-ups Due Today', and marks completed
    print(f"\n[Step 6] Health Worker conducts home visit and marks follow-up completed...")
    comp_res = make_req(f"/follow-ups/{fol_id}/complete", method="POST", data={
        "action_by_name": "Sunita Devi (ANM)",
        "action_by_role": "Health Worker",
        "notes": "Home visit conducted in Rampur. BP 124/82. Taking prescribed medications. No complaints of chest pain."
    })
    print(f"-> Follow-up marked: {comp_res['status']}")
    assert comp_res["status"] == "COMPLETED"

    # 8. Verify Referral Status is now CLOSED
    print(f"\n[Step 7] Checking final referral state for {ref_id}...")
    final_ref = make_req(f"/referrals/{ref_id}")
    print(f"-> Final referral status: {final_ref['current_status']}")
    assert final_ref["current_status"] == "CLOSED"
    print(f"-> Full audit trail history stages logged: {len(final_ref['history'])} entries:")
    for h in final_ref["history"]:
        print(f"   [{h['status']}] by {h['action_by_name']} ({h['action_by_role']}): {h['note']}")

    # 9. Verify Admin Dashboard reflects updated statistics
    print("\n[Step 8] Verifying Admin Analytics reflects completion...")
    final_analytics = make_req("/admin/analytics")
    new_completed = final_analytics["completed_referrals"]
    print(f"Initial completed: {initial_completed} -> New completed: {new_completed}")
    assert new_completed == initial_completed + 1
    print(f"New Referral Completion Rate: {final_analytics['completion_rate_percentage']}%")

    print("\n==================================================")
    print("SUCCESS: FULL GOLDEN DEMO FLOW 100% VERIFIED!")
    print("==================================================")

if __name__ == "__main__":
    run_golden_demo_verification()
