import requests
import time
import os

BASE_URL = "http://localhost:8000"

def test_separate_reports():
    print("Starting Separate Reports Verification...")
    
    # 1. Login
    print("\n1. Logging In...")
    login_payload = {
        "username": "testuser",
        "password": "password123"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
    if response.status_code != 200:
        print(f"Login Failed: {response.text}")
        return

    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("   Login Successful")

    # 2. Upload Document
    print("\n2. Uploading Document...")
    doc_content = "This is a test document for separate reports generation."
    files = {"file": ("separate_reports_test.txt", doc_content, "text/plain")}
    response = requests.post(f"{BASE_URL}/documents/upload", headers=headers, files=files)
    
    if response.status_code != 200:
        print(f"   Upload Failed: {response.text}")
        return
        
    doc_id = response.json()["id"]
    print(f"   Upload Successful. Document ID: {doc_id}")

    # 3. Process Document
    print(f"\n3. Processing Document {doc_id}...")
    process_payload = {"priority_agents": ["clause", "risk"]}
    response = requests.post(f"{BASE_URL}/api/process-document/{doc_id}", headers=headers, json=process_payload)
    
    if response.status_code != 200:
        print(f"   Processing Failed: {response.text}")
        return
    print("   Processing Triggered")

    # 4. Check for Separate Reports
    print("\n4. Checking for Separate Reports...")
    agents = ["clause", "risk", "combined"]
    
    for agent in agents:
        print(f"   Fetching report for: {agent}...")
        report_url = f"{BASE_URL}/documents/{doc_id}/report"
        params = {}
        if agent != "combined":
            params = {"agent": agent}
            
        # Retry logic as processing might take a few seconds
        for i in range(5):
            resp = requests.get(report_url, headers=headers, params=params)
            if resp.status_code == 200:
                print(f"   SUCCESS: Found report for {agent}")
                break
            else:
                time.sleep(2)
        else:
            print(f"   FAILED: Could not find report for {agent} after retries")

if __name__ == "__main__":
    test_separate_reports()
