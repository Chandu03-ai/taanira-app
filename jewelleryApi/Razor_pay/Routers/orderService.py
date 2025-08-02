from bson import ObjectId
from fastapi import APIRouter, Request
from pydantic import BaseModel
from Razor_pay.Models.model import OrderRequest, RemainingPaymentRequest
from Razor_pay.Services.razorpayClient import client
from Razor_pay.Database.ordersDb import *
from ReturnLog.logReturn import returnResponse
from yensiAuthentication import logger
from Models.userModel import UserRoles
from Utils.utils import hasRequiredRole
from yensiDatetime.yensiDatetime import formatDateTime


router = APIRouter(tags=["Order Service"])


@router.post("/order")
def createOrder(request: Request, payload: OrderRequest):
    try:
        logger.info("Initiating Razorpay order creation.")

        isHalfPayment = payload.isHalfPaid is True
        # Prepare Razorpay payload
        razorpayPayload = {"amount": payload.amount, "currency": payload.currency, "receipt": payload.receipt, "notes": payload.notes or {}}

        # Create order with Razorpay
        orderData = client.order.create(razorpayPayload)
        orderId = orderData.get("id")
        if not orderId:
            logger.warning("Razorpay returned no order ID.")
            return returnResponse(1527)

        # Prepare full order document to insert into DB
        fullOrder = {
            "id": str(ObjectId()),
            "orderId": orderId,
            "secondOrderId": "",
            "amount": orderData.get("amount"),
            "currency": orderData.get("currency"),
            "receipt": orderData.get("receipt"),
            "notes": orderData.get("notes"),
            "createdAt": formatDateTime(),
            "items": [item.model_dump() for item in payload.items] if payload.items else [],
            "shippingAddress": payload.shippingAddress.model_dump() if payload.shippingAddress else None,
            "trackingNumber": "",
            "isHalfPaid": isHalfPayment,
            "remainingAmount": payload.remainingAmount,
            "halfPaymentStatus": "pending" if isHalfPayment else "not_applicable",
            "paymentType": "half" if isHalfPayment else "full",
            "halfPaymentDetails": (
                {"firstPaymentAmount": payload.amount, "remainingAmount": payload.remainingAmount, "firstPaymentDate": formatDateTime(), "remainingPaymentDate": None, "remindersSent": 0}
                if isHalfPayment
                else None
            ),
            **{k: v for k, v in orderData.items() if k != "id"},  # Merge rest of Razorpay data
        }

        # Store in DB
        insertOrder(fullOrder)
        fullOrder.pop("_id", None)

        logger.info("Order created and stored successfully. orderId: %s", orderId)
        return returnResponse(1526, result=fullOrder)

    except Exception as e:
        logger.error("Order creation failed. Error: %s", str(e))
        return returnResponse(1527)


@router.get("/orders/{id}")
def fetchOrder(request: Request, id: str):
    try:
        logger.info("Fetching order. orderId: %s", id)
        localOrder = getSingleOrder({"id": id})
        print(localOrder)
        if not localOrder:
            logger.warning("Local order not found.")
            return returnResponse(1556)

        if localOrder.get("status") == "paid" and localOrder.get("halfPaymentStatus") in ["paid", "not_applicable"]:
            logger.info("Both payments already completed. Returning local order.")
            return returnResponse(1528, result=localOrder)
        orderId = localOrder.get("orderId") if localOrder.get("status") != "paid" else localOrder.get("secondOrderId")
        print(orderId)
        # Fetch latest status from Razorpay
        orderData = client.order.fetch(orderId)
        currentStatus = orderData.get("status")
        if not currentStatus:
            logger.warning("No status found in Razorpay response.")
            return returnResponse(1555)

        logger.debug("Fetched status from Razorpay: %s", currentStatus)

        # Update local order status if different
        if localOrder.get("status") != "paid":
            updateOrder({"id": id}, {"status": currentStatus, "updatedAt": formatDateTime()})
            logger.info("Updated status: %s", currentStatus)

        # Update half payment status if applicable
        if localOrder.get("isHalfPaid") and localOrder.get("paymentType") == "remaining":
            updateOrder({"id": id}, {"halfPaymentStatus": currentStatus, "updatedAt": formatDateTime()})
            logger.info("Updated half payment status: %s", currentStatus)

        updatedOrder = getSingleOrder({"id": id})
        logger.info("Returning updated order: %s", orderId)
        return returnResponse(1528, result=updatedOrder)
    except Exception as e:
        logger.error("Failed to fetch order. Error: %s", str(e))
        return returnResponse(1529)


@router.get("/orders/{orderId}/payments")
def fetchAllPaymentsForOrder(request: Request, orderId: str):
    try:
        logger.info("Fetching payments for order. orderId: %s", orderId)
        payments = client.order.payments(orderId)
        logger.info("Payments fetched successfully. orderId: %s", orderId)
        return returnResponse(1530, result=payments)
    except Exception as e:
        logger.error(f"Failed to fetch payments for orderId: {orderId} , Error : {str(e)}")
        return returnResponse(1531)


@router.get("/orderservice")
def listOrders(request: Request):
    try:
        logger.info("Fetching all orders.")
        orders = getAllOrders()
        logger.info("All orders fetched successfully.")
        return returnResponse(1532, result=orders)
    except Exception as e:
        logger.error("Failed to fetch all orders, Error: %s", str(e))
        return returnResponse(1533)


@router.get("/user/orders")
def getUserOrders(request: Request):
    try:
        userId = request.state.userMetadata.get("id")
        if not userId:
            logger.warning("Unauthorized access: userId not found in request metadata.")
            return returnResponse(1559)
        query = {"notes.userId": userId}
        logger.info(f"Fetching orders for user [{userId}]")
        orders = getAllOrders(query)
        for order in orders:
            order.pop("_id", None)
        logger.info(f"successfully fetched user Order")
        return returnResponse(1557, result=orders)
    except Exception as e:
        logger.error(f"Failed to fetch user orders. Error: {str(e)}", exc_info=True)
        return returnResponse(1558)


@router.get("/admin/orders")
def getUserOrders(request: Request):
    try:
        userId = request.state.userMetadata.get("id")
        if not hasRequiredRole(request, [UserRoles.Admin.value]):
            logger.warning(f"Unauthorized access attempt by user [{userId}] to fetch product stats.")
            return returnResponse(2000)

        logger.info(f"Fetching orders for user [{userId}]")
        orders = getAllOrders({})
        for order in orders:
            order.pop("_id", None)
        logger.info(f"successfully fetched user Order")
        return returnResponse(1560, result=orders)
    except Exception as e:
        logger.error(f"Failed to fetch user orders. Error: {str(e)}", exc_info=True)
        return returnResponse(1561)
