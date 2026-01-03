import requests
import time
import os

# Configuration
BASE_URL = "http://localhost:8000"
USERNAME = "admin"
PASSWORD = "password"  # Using the seeded admin password (or we can register a new one)
# Actually, let's use the same flow as verify_system to be safe: register or login
# But verify_system uses "testuser", let's stick to that if possible, or just register a new one.

def run_test():
    print("Starting Retry API Verification...")
    
    # 1. Login (or Register)
    print("\n1. Logging In...")
    # Use a unique user for this test to avoid conflicts
    username = "retry_tester"
    password = "retrypassword"
    
    login_payload = {
        "username": username,
        "password": password
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
    if response.status_code == 401:
        # Try registering
        print("   User not found, registering...")
        reg_payload = {
            "username": username,
            "email": "retry@example.com",
            "phone_number": "9876543210",
            "name": "Retry Tester",
            "password": password
        }
        reg_response = requests.post(f"{BASE_URL}/auth/register", json=reg_payload)
        print(f"   Registration Status: {reg_response.status_code}")
        if reg_response.status_code != 200 and reg_response.status_code != 400:
             print(f"   Registration Failed: {reg_response.text}")
        
        response = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
    
    if response.status_code != 200:
        print(f"   Login Failed: {response.text}")
        return
        
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("   Login Successful")

    # 2. Upload Document
    print("\n2. Uploading Document...")
    doc_content = """This AGREEMENT is made on this 1st day of January, 2024, by and between Company A ("Party A") and Company B ("Party B").

1. Confidentiality
Both parties agree to keep all information exchanged during the term of this agreement confidential.

2. Termination
Either party may terminate this agreement with 30 days written notice.

3. Governing Law
This agreement shall be governed by the laws of the State of California.

4. Indemnification
Party A agrees to indemnify Party B against any losses arising from Party A's negligence.
"""
    
    files = {"file": ("retry_test_doc.txt", doc_content, "text/plain")}
    response = requests.post(f"{BASE_URL}/documents/upload", headers=headers, files=files)
    
    if response.status_code != 200:
        print(f"   Upload Failed: {response.text}")
        return
        
    doc_id = response.json()["id"]
    print(f"   Upload Successful. Document ID: {doc_id}")

    # 3. Trigger Initial Processing (Optional, but good to have some state)
    # We can skip this and go straight to retry if we want, but retry expects extracted text.
    # Upload extracts text? No, process-document does.
    # So we MUST call process-document first to extract text.
    print(f"\n3. Initial Processing for Document {doc_id}...")
    process_payload = {"priority_agents": ["clause"]} # Just run clause first
    response = requests.post(f"{BASE_URL}/api/process-document/{doc_id}", headers=headers, json=process_payload)
    if response.status_code != 200:
        print(f"   Processing Failed: {response.text}")
        return
    print("   Initial Processing Triggered")

    # 4. Test Retry API for 'draft' agent
    print(f"\n4. Testing Retry API for 'draft' agent on Document {doc_id}...")
    # This simulates retrying the draft agent (which might have failed or we just want to run it)
    retry_url = f"{BASE_URL}/api/retry-agent/{doc_id}/draft"
    
    start_time = time.time()
    response = requests.post(retry_url, headers=headers)
    end_time = time.time()
    
    if response.status_code == 200:
        print("   Retry Successful!")
        result = response.json()
        print(f"   Message: {result.get('message')}")
        print(f"   PDF Regenerated: {result.get('pdf_regenerated')}")
        print(f"   Time Taken: {end_time - start_time:.2f}s")
        
        # Check if result contains expected keys
        agent_result = result.get("result", {})
        if "error" in agent_result:
             print(f"   Agent returned error: {agent_result['error']}")
        else:
             print("   Agent returned valid response.")
    else:
        print(f"   Retry Failed: {response.status_code} - {response.text}")

if __name__ == "__main__":
    run_test()
