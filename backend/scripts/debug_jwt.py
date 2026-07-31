
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.auth import create_access_token, decode_token, settings
from jose import jwt

def debug_jwt():
    print(f"Secret Key: {settings.secret_key}")
    print(f"Algorithm: {settings.algorithm}")
    
    data = {"sub": "123", "role": "admin"}
    print(f"Encoding data: {data}")
    
    try:
        token = create_access_token(data)
        print(f"Generated Token: {token}")
    except Exception as e:
        print(f"Error Encoding: {e}")
        return

    try:
        decoded = decode_token(token)
        print(f"Decoded successfully: {decoded}")
    except Exception as e:
        print(f"Error Decoding via decode_token: {e}")
        
    # Test against RUNNING SERVER
    import requests
    try:
        # 1. Login
        login_url = "http://localhost:8570/api/auth/login"
        login_payload = {"email": "admin@tabletalk.com", "password": "admin123"}
        print(f"\nLogging in to {login_url}...")
        resp = requests.post(login_url, json=login_payload)
        print(f"Login Response: {resp.status_code} {resp.text}")
        
        if resp.status_code == 200:
            token = resp.json().get("access_token")
            # 2. Verify /me
            me_url = "http://localhost:8570/api/auth/me"
            headers = {"Authorization": f"Bearer {token}"}
            print(f"Verifying token at {me_url}...")
            me_resp = requests.get(me_url, headers=headers)
            print(f"Me Response: {me_resp.status_code} {me_resp.text}")
        else:
            print("Login failed, skipping /me check")

    except Exception as e:
        print(f"Request Error: {e}")

if __name__ == "__main__":
    debug_jwt()
