from fastapi import APIRouter, Request
from Razor_pay.Models.model import RemainingPaymentRequest
from Razor_pay.Services.razorpayClient import client
from Razor_pay.Database.ordersDb import *
from Razor_pay.Database.customerDb import createNotification
from ReturnLog.logReturn import returnResponse
from yensiAuthentication import logger
from Models.userModel import UserRoles
from Utils.utils import hasRequiredRole
from yensiDatetime.yensiDatetime import formatDateTime
from Razor_pay.Models.model import OrderRequest

router = APIRouter(tags=["Half-Payment"])


@router.post("/admin/orders/{orderId}/enable-remaining-payment")
def enableRemainingPayment(request: Request, orderId: str):
    try:
        logger.info("Admin enabling remaining payment for orderId: %s", orderId)
        userId = request.state.userMetadata.get("id")
        if not hasRequiredRole(request, [UserRoles.Admin.value]):
            logger.warning(f"Unauthorized access attempt by user [{userId}] to create product.")
            return returnResponse(2000)

        order = getOrderById(orderId)
        if not order:
            logger.warning("Order not found for orderId: %s", orderId)
            return returnResponse(1562)

        isHalfPayment = order.get("isHalfPaid")
        halfPaymentStatus = order.get("halfPaymentStatus")

        if not isHalfPayment or halfPaymentStatus == "paid":
            logger.warning("Order %s is not eligible for remaining payment.", orderId)
            return returnResponse(1563)
        updateOrder({"id": orderId}, {"enableRemainingPayment": True, "trackingIdSentAt": formatDateTime()})
        orderData = getOrderById(orderId)
        return returnResponse(1568, result=orderData)
    except Exception as e:
        logger.error("Error enabling remaining payment for orderId %s: %s", orderId, str(e))
        return returnResponse(1569)


@router.post("/admin/orders/{orderId}/send-remaining-payment-notification")
def sendRemainingPaymentNotification(request: Request, orderId: str):
    try:
        logger.info("Sending remaining payment notification for orderId: %s", orderId)
        userId = request.state.userMetadata.get("id")
        if not hasRequiredRole(request, [UserRoles.Admin.value]):
            logger.warning(f"Unauthorized access attempt by user [{userId}] to create product.")
            return returnResponse(2000)

        order = getOrderById(orderId)
        if not order:
            logger.warning("Order not found for orderId: %s", orderId)
            return returnResponse(1562)

        userEmail = order.get("notes", {}).get("userEmail")
        # Create a notification document
        createNotification(
            {
                "orderId": orderId,
                "type": "remaining_payment_available",
                "title": "Complete your payment",
                "message": "Your order is ready for delivery. Please complete the remaining payment.",
                "isRead": False,
                "userId": order.get("notes", {}).get("userId"),
                "actionUrl": f"/pay-remaining/{orderId}",
                "createdAt": formatDateTime(),
            }
        )
        logger.info(f"notification created successfully for order:{orderId}")
        return returnResponse(1570, result={"orderId": orderId, "notificationSent": True, "userEmail": userEmail})

    except Exception as e:
        logger.error("Failed to send remaining payment notification for orderId %s: %s", orderId, str(e))
        return returnResponse(1571)


@router.post("/orders/remaining-payment")
def createRemainingPaymentOrder(request: Request, payload: OrderRequest):
    try:
        logger.info("Initiating Razorpay order creation.")
        razorpayPayload = {"amount": payload.amount, "currency": payload.currency, "receipt": payload.receipt, "notes": payload.notes or {}}
        orderId = payload.notes.get("originalOrderId") if payload.notes else None

        order = getOrderById(orderId)
        if not order:
            logger.warning("Order not found for orderId: %s", orderId)
            return returnResponse(1562)
        # Create order with Razorpay
        orderData = client.order.create(razorpayPayload)
        secondOrderId = orderData.get("id")
        if not secondOrderId:
            logger.warning("Razorpay returned no order ID.")
            return returnResponse(1527)
        updateOrder(
            {"id": orderId},
            {"secondOrderId": secondOrderId, "halfPaymentDetails.remainingPaymentDate": formatDateTime(), "halfPaymentStatus": "created", "paymentType": "remaining"},
        )
        logger.info("Order created and stored successfully. orderId: %s", orderId)
        return returnResponse(1566)

    except Exception as e:
        logger.error("Order creation failed. Error: %s", str(e))
        return returnResponse(1567)
