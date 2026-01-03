import requests
import time
import os

BASE_URL = "http://localhost:8000"
AUTH_URL = f"{BASE_URL}/auth"
DOCS_URL = f"{BASE_URL}/documents"
PROCESS_URL = f"{BASE_URL}/api/process-document"

def test_system():
    print("Starting System Verification...")

    # 1. Register
    print("\n1. Registering User...")
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "phone_number": "1234567890",
        "password": "password123",
        "name": "Test User"
    }
    try:
        resp = requests.post(f"{AUTH_URL}/register", json=user_data)
        if resp.status_code == 200:
            print("   Registration Successful")
        elif resp.status_code == 400 and "already registered" in resp.text:
            print("   User already registered")
        else:
            print(f"   Registration Failed: {resp.text}")
            return
    except Exception as e:
        print(f"   Failed to connect: {e}")
        return

    # 2. Login
    print("\n2. Logging In...")
    login_data = {
        "username": "testuser",
        "password": "password123"
    }
    resp = requests.post(f"{AUTH_URL}/token", data=login_data)
    if resp.status_code != 200:
        print(f"   Login Failed: {resp.text}")
        return
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("   Login Successful")

    # 3. Upload Document
    print("\n3. Uploading Document...")
    file_path = "tests/sample.txt"
    if not os.path.exists(file_path):
        with open(file_path, "w") as f:
            f.write("Sample legal text.")
    
    with open(file_path, "rb") as f:
        files = {"file": ("sample.txt", f, "text/plain")}
        resp = requests.post(f"{DOCS_URL}/upload", headers=headers, files=files)
    
    if resp.status_code != 200:
        print(f"   Upload Failed: {resp.text}")
        return
    
    doc_id = resp.json()["id"]
    print(f"   Upload Successful. Document ID: {doc_id}")

    # 4. Process Document
    print(f"\n4. Processing Document {doc_id} with Priority...")
    priority_payload = {
        "priority_agents": ["clause", "risk", "draft", "summary"]
    }
    resp = requests.post(f"{PROCESS_URL}/{doc_id}", headers=headers, json=priority_payload)
    
    if resp.status_code != 200:
        print(f"   Processing Trigger Failed: {resp.text}")
        return
    
    result = resp.json()
    print("   Processing Triggered Successfully")
    print(f"   Immediate Result (First Agent): {result.get('message')}")
    
    if "first_agent_result" in result:
        print("   Received First Agent Result!")
        # print(result["first_agent_result"]) # Optional: print full result
    else:
        print("   WARNING: First agent result missing from immediate response.")
    
    print("   Processing Triggered Successfully")
    
    # 5. Poll for Results
    print("\n5. Waiting for Processing Completion...")
    max_retries = 5
    for i in range(max_retries):
        time.sleep(2)
        # Assuming we have an endpoint to get document status/results
        # Since we don't have a specific status endpoint yet, we might need to check the document details or a new endpoint
        # For now, let's try to fetch the document details which might contain the extracted text or status if we added it
        # But wait, the user wants "processed result". The processing router returns {"message": "Processing started..."}
        # The results are stored in the database or file system.
        # Let's assume we can fetch the report via a new endpoint or just wait and try to download the PDF.
        
        # Actually, let's add a step to try and download the PDF report.
        # If the PDF exists, processing is likely done.
        
        report_url = f"{BASE_URL}/api/process-document/{doc_id}/report" 
        # Note: We need to ensure this endpoint exists or create it. 
        # Checking backend-gateway/processing/router.py... it seems we only have POST /process-document/{doc_id}
        # We might need to add a GET endpoint to retrieve the report.
        
        # Let's try to fetch the document details to see if we can get any info
        # resp = requests.get(f"{DOCS_URL}/{doc_id}", headers=headers)
        pass

    # Since we don't have a direct "get results" endpoint exposed yet in the previous steps,
    # I will add a loop that tries to download the PDF report.
    
    print("   Polling for PDF Report...")
    report_filename = f"report_{doc_id}.pdf"
    
    # We need an endpoint to download the report. 
    # The current processing router saves it to `shared_data/reports/`.
    # We should probably add a static file mount or an endpoint to serve this.
    # For this test script, let's assume we will add a GET /documents/{doc_id}/report endpoint.
    
    report_endpoint = f"{DOCS_URL}/{doc_id}/report"
    
    for i in range(max_retries):
        resp = requests.get(report_endpoint, headers=headers)
        if resp.status_code == 200:
            print("   Report Generated!")
            with open(report_filename, "wb") as f:
                f.write(resp.content)
            print(f"   Report saved to {report_filename}")
            break
        elif resp.status_code == 404:
            print(f"   Waiting... ({i+1}/{max_retries})")
            time.sleep(2)
        else:
            print(f"   Error fetching report: {resp.status_code} - {resp.text}")
            break
    else:
        print("   Timeout waiting for report generation.")

if __name__ == "__main__":
    test_system()
