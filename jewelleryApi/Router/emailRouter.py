from fastapi import APIRouter
from ReturnLog.logReturn import returnResponse
from yensiEmailService.gmail import sendEmail
from yensiAuthentication import logger
from yensiDatetime.yensiDatetime import formatDateTime
from Utils.emailUtility import loadHtmlTemplate
from Database.emailDb import insertData
from Models.emailModel import OrderSuccessEmailRequest, RegisterSuccessEmailRequest, TrackingEmailRequest

router = APIRouter()


@router.post("/auth/sendEmail")
async def sendEmailUser(payload: RegisterSuccessEmailRequest):
    try:
        email = payload.email
        logger.info(f"Sending OTP to {email}")
        sentTime = formatDateTime()
        subject = "User Registred Successfully"
        templatePath = "Templates/registerSuccess.html"
        htmlBody = loadHtmlTemplate(templatePath, {"userName": payload.userName})
        sendEmail(email, subject=subject, body=htmlBody, isHtml=True)
        logger.info(f"Email sent successfully to {email}")
        insertData({"email": email, "sentAt": sentTime, "status": "sent", "type": "register-success"})
        return returnResponse(2147)
    except Exception as e:
        logger.error(f"Error sending email to {email}: {e}")
        return returnResponse(2148)


@router.post("/sendOrderSuccessEmail")
async def sendOrderSuccessEmail(payload: OrderSuccessEmailRequest):
    try:
        logger.info(f"Sending order confirmation email to {payload.email}")
        sentTime = formatDateTime()
        subject = " Order Confirmation"
        templatePath = "Templates/orderSuccess.html"
        htmlBody = loadHtmlTemplate(templatePath, {"userName": payload.userName, "orderId": payload.orderId})
        sendEmail(toEmail=payload.email, subject=subject, body=htmlBody, isHtml=True)
        insertData({"email": payload.email, "sentAt": sentTime, "orderId": payload.orderId, "type": "order-success", "status": "sent"})
        return returnResponse(2147)
    except Exception as e:
        logger.error(f"Failed to send order email: {e}")
        return returnResponse(2148)


@router.post("/sendTrackingEmail")
async def sendTrackingEmail(payload: TrackingEmailRequest):
    try:
        email = payload.email
        logger.info(f"Sending tracking email to {email}")
        sentTime = formatDateTime()
        subject = f"Your Order {payload.orderId} Has Been Shipped"
        templatePath = "Templates/trackingEmail.html"
        htmlBody = loadHtmlTemplate(templatePath, {"userName": payload.userName, "orderId": payload.orderId, "trackingId": payload.trackingId})
        sendEmail(toEmail=payload.email, subject=subject, body=htmlBody, isHtml=True)
        insertData({"email": email, "sentAt": sentTime, "orderId": payload.orderId, "trackingId": payload.trackingId, "type": "tracking-email", "status": "sent"})
        logger.info(f"email sent successfully with trackingId to :{email}")
        return returnResponse(2160)
    except Exception as e:
        logger.error(f"Failed to send tracking email: {e}")
        return returnResponse(2161)
