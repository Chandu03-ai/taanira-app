import httpx
from testConfig import registerUrl, username, adminEmail, adminPassword, role


def registerUser():
    payload = {"username": username, "email": adminEmail, "password": adminPassword, "role": role}
    try:
        print(f"[INFO] Registering {role}: {adminEmail}")
        response = httpx.post(registerUrl, json=payload)
        print(f"[INFO] Status Code: {response.status_code}")
        print("[INFO] Response:", response.json())
    except Exception as e:
        print(f"[ERROR] Failed to register {role}: {e}")


if __name__ == "__main__":
    registerUser()
