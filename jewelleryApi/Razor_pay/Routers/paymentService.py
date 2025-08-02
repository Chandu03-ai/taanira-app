from fastapi import APIRouter, Request
from Razor_pay.Services.razorpayClient import client
from Razor_pay.Database.ordersDb import *
from ReturnLog.logReturn import returnResponse
from yensiAuthentication import logger
from Razor_pay.Database.paymentsDb import *
from Razor_pay.Database.invoiceDb import *
from Razor_pay.Utils.util import getCustomerId
from Razor_pay.Utils.orderUtils import verifySignature
from yensiDatetime.yensiDatetime import formatDateTime


from Razor_pay.Models.paymentModel import PaymentVerificationPayload

router = APIRouter(prefix="/payments", tags=["Payment Service"])


@router.get("/history")
def getPaymentHistory(request: Request):
    try:
        userId = request.state.userMetadata.get("id")
        customerId = getCustomerId(request)

        payments = listPayments({"customerId": customerId})
        logger.info(f"Retrieved payments for user {userId}")

        return returnResponse(1553, result=payments)
    except Exception as e:
        logger.error(f"Error retrieving payment history: {str(e)}")
        return returnResponse(1554)


@router.get("/invoice/{paymentId}")
def getInvoiceUsingPaymentId(paymentId: str):
    try:
        logger.info(f"Fetching invoice for payment ID: {paymentId}")
        payment = getPaymentById(paymentId)
        invoiceId = payment.get("invoiceId")

        if not invoiceId:
            logger.warning(f"No invoice linked to payment {paymentId}")
            return returnResponse(1555, result={"message": "No invoice linked."})

        invoice = getInvoiceFromDb({"invoiceId": invoiceId})
        logger.info(f"Invoice PDF link fetched for invoice {invoiceId}")
        return returnResponse(1556, result=invoice)
    except Exception as e:
        logger.error(f"Error fetching invoice for payment {paymentId}: {str(e)}")
        return returnResponse(1557)


@router.post("/payment/verify")
def verifyPayment(payload: PaymentVerificationPayload):
    try:
        logger.info("Verifying Razorpay payment.")
        isVerified = verifySignature(payload.razorpay_order_id, payload.razorpay_payment_id, payload.razorpay_signature)

        if not isVerified:
            logger.warning("Signature mismatch for orderId: %s", payload.razorpay_order_id)
            return returnResponse(1535, result={"status": "invalid signature"})

        orderData = client.order.fetch(payload.razorpay_order_id)
        if not orderData:
            logger.error(f"Razorpay fetch returned None for orderId: {payload.razorpay_order_id}")

        currentStatus = orderData.get("status", "created")
        logger.info("Fetched order status from Razorpay for orderId %s: %s", payload.razorpay_order_id, currentStatus)
        query={"orderId":payload.razorpay_order_id}
        order = getSingleOrder(query)
        logger.debug("Fetched local order data for orderId %s: %s", payload.razorpay_order_id)

        updateOrder(query, {"status": currentStatus,"updatedAt": formatDateTime()})

        if order.get("isHalfPaid") is True and order.get("paymentType") == "remaining":
            logger.info("Marking half payment as complete.")
            updateOrder(query, {"halfPaymentStatus": currentStatus})
        logger.info("Payment verification completed successfully for orderId: %s", payload.razorpay_order_id)
        return returnResponse(1534, result={"status": "success"})

    except Exception as e:
        logger.error("Payment verification failed: %s", str(e))
        return returnResponse(1536)


@router.post("/payment/remaining-verify")
def verifyRemaningPayment(payload: PaymentVerificationPayload):
    try:
        logger.info("Verifying Razorpay payment.")
        isVerified = verifySignature(payload.razorpay_order_id, payload.razorpay_payment_id, payload.razorpay_signature)

        if not isVerified:
            logger.warning("Signature mismatch for orderId: %s", payload.razorpay_order_id)
            return returnResponse(1535, result={"status": "invalid signature"})

        orderData = client.order.fetch(payload.razorpay_order_id)
        currentStatus = orderData.get("status", "created")
        order = getOrderById(payload.razorpay_order_id)

        if not order.get("isHalfPaid"):
            updateOrder({"orderId": payload.razorpay_order_id}, {"status": currentStatus,"updatedAt": formatDateTime()})

        if order.get("isHalfPaid") is True and order.get("paymentType") == "remaining":
            logger.info("Marking half payment as complete.")
            updateOrder({"secondOrderId": payload.razorpay_order_id}, {"halfPaymentStatus": currentStatus,"updatedAt": formatDateTime()})

        return returnResponse(1534, result={"status": "success"})

    except Exception as e:
        logger.error("Payment verification failed: %s", str(e))
        return returnResponse(1536)
