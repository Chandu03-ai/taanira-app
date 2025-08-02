from yensiAuthentication import logger
import hashlib
import hmac
from constants import razorpaySecret


def verifySignature(orderId: str, paymentId: str, signature: str) -> bool:
    try:
        message = f"{orderId}|{paymentId}"
        generatedSignature = hmac.new(key=bytes(razorpaySecret, "utf-8"), msg=bytes(message, "utf-8"), digestmod=hashlib.sha256).hexdigest()
        return generatedSignature == signature
    except Exception as e:
        logger.error("Signature verification failed: %s", str(e))
        return False
