from constants import keycloakClientId,keycloakClientSecret,tokenUrl
from yensiAuthentication import logger
import httpx
from fastapi import HTTPException


def loadHtmlTemplate(templatePath: str, replacements: dict) -> str:
    try:
        with open(templatePath, "r", encoding="utf-8") as file:
            content = file.read()
            for key, value in replacements.items():
                content = content.replace(f"{{{{ {key} }}}}", str(value))  # Jinja-style
                content = content.replace(f"{{{{{key}}}}}", str(value))  # no-space style
            return content
    except Exception as e:
        raise RuntimeError(f"Error reading HTML template: {e}")



def verifyPasswordWithKeycloak(email: str, password: str) -> bool:
    try:
        
        clientId = keycloakClientId
        clientSecret = keycloakClientSecret  
        payload = {
            "grant_type": "password",
            "client_id": clientId,
            "username": email,
            "password": password
        }

        # Add client secret if your client is confidential
        if clientSecret:
            payload["client_secret"] = clientSecret

        logger.debug(f"Sending password verification request to Keycloak for {email}")
        response = httpx.post(tokenUrl, data=payload, timeout=10)

        if response.status_code == 200:
            logger.debug("Password verified successfully via Keycloak.")
            return True
        else:
            logger.warning(f"Keycloak password verification failed: {response.text}")
            return False

    except Exception as e:
        logger.error(f"Error verifying password with Keycloak: {str(e)}")
        raise HTTPException(status_code=500, detail="Keycloak password verification error.")