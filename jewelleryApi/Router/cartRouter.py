# routers/cartWishlistRouter.py
from bson import ObjectId
from fastapi import APIRouter, Request
from Database.cartWishlistDb import addToCartDb, getCartDb, updateCartDb, updateQuantityCartDb, getSingleCartDb, addBulkToCartDb, updateCartManyDb
from Database.productDb import getProductFromDb
from yensiAuthentication import logger
from ReturnLog.logReturn import returnResponse
from yensiDatetime.yensiDatetime import formatDateTime
from Models.cartWishlistModel import CartItemModel, BulkCartRequest
from typing import Optional

router = APIRouter(tags=["Cart & Wishlist"])


@router.post("/cart/add")
async def addToCart(request: Request, payload: CartItemModel):
    try:
        userId = request.state.userMetadata.get("id")
        logger.debug(f"Adding to cart for user: {userId}")
        cartItem = payload.model_dump()
        productId = cartItem["productId"]
        selectedSize = cartItem.get("selectedSize", "")

        product = getProductFromDb({"id": productId})
        if not product:
            logger.warning(f"Product with ID {productId} not found.")
            return returnResponse(2003)

        cartItem.update({"id": str(ObjectId()), "userId": userId, "createdAt": formatDateTime(), "isDeleted": False, "productId": productId, "selectedSize": selectedSize, "product": product})

        addToCartDb(cartItem)
        cartItem.pop("_id", None)
        logger.info("cartItem added successfully")
        return returnResponse(2060, result=cartItem)
    except Exception as e:
        logger.error(f"Error adding to cart: {e}")
        return returnResponse(2062)


@router.get("/cart")
async def getCart(request: Request):
    try:
        userId = request.state.userMetadata.get("id")
        logger.debug(f"Fetching cart for user: {userId}")
        cart = list(getCartDb({"userId": userId, "isDeleted": False}))
        return returnResponse(2061, result=cart)
    except Exception as e:
        logger.error(f"Error fetching cart: {e}")
        return returnResponse(2062)


@router.put("/cart/update/{productId}")
async def updateCartItem(request: Request, productId: str, quantity: int, selectedSize: Optional[str] = None):
    try:
        userId = request.state.userMetadata.get("id")
        logger.debug(f"Updating cart item for user {userId}, product {productId}, size {selectedSize}")

        filterQuery = {"productId": productId, "userId": userId, "isDeleted": False}

        if selectedSize is not None:
            filterQuery["selectedSize"] = selectedSize

        cartItem = getSingleCartDb(filterQuery)

        if not cartItem:
            logger.warning(f"No matching cart item for productId={productId}, size={selectedSize}")
            return returnResponse(2119)

        newQuantity = cartItem.get("quantity", 0) + quantity
        if newQuantity < 1:
            logger.warning(f"Cannot decrease below 1 for cart item")
            return returnResponse(2131)

        query = {"id": cartItem["id"], "userId": userId, "isDeleted": False}
        updateQuantityCartDb(query, {"$inc": {"quantity": quantity}})

        updatedItem = getSingleCartDb({"id": cartItem["id"], "isDeleted": False})
        return returnResponse(2120, result=updatedItem)

    except Exception as e:
        logger.error(f"Error updating quantity for cart item: {e}", exc_info=True)
        return returnResponse(2121)


@router.delete("/cart/remove/{productId}")
async def removeCartItem(request: Request, productId: str, selectedSize: Optional[str] = None):
    try:
        userId = request.state.userMetadata.get("id")
        logger.debug(f"Removing cart item for user {userId}, product {productId}, size {selectedSize}")

        filterQuery = {"productId": productId, "userId": userId, "isDeleted": False}

        if selectedSize is not None:
            filterQuery["selectedSize"] = selectedSize

        cartItem = getSingleCartDb(filterQuery)

        if not cartItem:
            logger.warning(f"No cart item found for user {userId}, product {productId}, size {selectedSize}")
            return returnResponse(2116)

        query = {"id": cartItem["id"], "userId": userId, "isDeleted": False}
        updateData = {"isDeleted": True, "deletedAt": formatDateTime()}
        result = updateCartDb(query, updateData)

        if result.modified_count == 0:
            logger.warning(f"No active cart item found with id [{cartItem['id']}]")
            return returnResponse(2116)

        logger.info(f"Cart item [{cartItem['id']}] removed successfully")
        return returnResponse(2117)
    except Exception as e:
        logger.error(f"Error deleting cart item: {e}", exc_info=True)
        return returnResponse(2118)


@router.post("/cart/merge")
async def mergeToCart(request: Request, payload: BulkCartRequest):
    try:
        userId = request.state.userMetadata.get("id")
        logger.debug(f"Bulk merge cart for user [{userId}]")
        cartItems = []

        for item in payload.items:
            product = item.product or getProductFromDb({"id": item.productId, "isDeleted": False})
            if not product:
                logger.warning(f"Product [{item.productId}] not found. Skipping.")
                continue

            cartItem = {
                "id": str(ObjectId()),
                "userId": userId,
                "productId": item.productId,
                "quantity": item.quantity,
                "selectedSize": item.selectedSize or "",
                "product": product.model_dump() if hasattr(product, "model_dump") else product,
                "isDeleted": False,
                "createdAt": formatDateTime(),
            }
            cartItems.append(cartItem)

        if not cartItems:
            logger.warning(f"No valid items to merge for user [{userId}]")
            return returnResponse(2134)

        addBulkToCartDb(cartItems)
        logger.info(f"Bulk cart merge successful for user [{userId}]")
        return returnResponse(2132)

    except Exception as e:
        logger.error(f"Error in bulk cart merge: {e}", exc_info=True)
        return returnResponse(2133)


@router.delete("/cart/clear")
async def clearAllCartItems(request: Request):
    try:
        userId = request.state.userMetadata.get("id")
        logger.debug(f"Clearing all cart items for user [{userId}]")

        query = {"userId": userId, "isDeleted": False}
        updateData = {"isDeleted": True, "deletedAt": formatDateTime()}
        result = updateCartManyDb(query, updateData)

        if result.modified_count == 0:
            logger.warning(f"No items found to clear for user [{userId}]")
            return returnResponse(2116)

        logger.info(f"Cleared {result.modified_count} cart items for user [{userId}]")
        return returnResponse(2070)

    except Exception as e:
        logger.error(f"Error clearing cart for user: {e}", exc_info=True)
        return returnResponse(2071)
