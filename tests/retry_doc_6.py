import requests
import json

BASE_URL = "http://localhost:8000"

def retry_doc_6():
    print("Retrying Draft Agent for Document 6...")
    
    # 1. Login as testuser (owner of doc 6)
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
    
    # 2. Retry Draft Agent
    doc_id = 6
    agent_name = "draft"
    
    retry_url = f"{BASE_URL}/api/retry-agent/{doc_id}/{agent_name}"
    print(f"Calling: {retry_url}")
    
    response = requests.post(retry_url, headers=headers)
    
    if response.status_code == 200:
        print("Retry Successful!")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"Retry Failed: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    retry_doc_6()
