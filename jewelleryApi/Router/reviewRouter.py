from fastapi import APIRouter, Request
from bson import ObjectId
from Models.reviewModel import ReviewModel
from Database.reviewDb import insertReviewToDb, getReviewsFromDb, getReviewFromDb, deleteReviewFromDb
from yensiDatetime.yensiDatetime import formatDateTime
from yensiAuthentication import logger
from ReturnLog.logReturn import returnResponse
from Models.userModel import UserRoles
from Utils.utils import hasRequiredRole
from yensiAuthentication import verifyUser

router = APIRouter(tags=["Reviews"])


#  CREATE Review
@router.post("/review/create")
async def createReview(request: Request, payload: ReviewModel):
    try:
        userId = request.state.userMetadata.get("id")
        userData = verifyUser({"id": userId})
        userName = f"{userData.get('firstname')} {userData.get('lastname')}"
        reviewDict = payload.model_dump()
        reviewDict.update({"id": str(ObjectId()), "createdAt": formatDateTime(), "updatedAt": formatDateTime(), "isDeleted": False, "userName": userName})
        insertReviewToDb(reviewDict)
        reviewDict.pop("_id", None)
        logger.info(f"Review created for product [{payload.productId}] by user [{userId}]")
        return returnResponse(2149, result=reviewDict)

    except Exception as e:
        logger.error(f"[REVIEW_CREATE_ERROR] {str(e)}")
        return returnResponse(2150)


#  GET all reviews for a product
@router.get("/public/review/product/{productId}")
async def getProductReviews(productId: str):
    try:
        reviews = list(getReviewsFromDb({"productId": productId, "isDeleted": False}))
        logger.info(f"successfully fetched review by product:{productId}")
        return returnResponse(2151, result=reviews)
    except Exception as e:
        logger.error(f"[REVIEW_FETCH_ERROR] {str(e)}")
        return returnResponse(2152)


#  GET single review by ID
@router.get("/public/review/{reviewId}")
async def getReviewById(reviewId: str):
    try:
        review = getReviewFromDb({"id": reviewId, "isDeleted": False})
        if not review:
            logger.warning(f" no review found for this id :{reviewId}")
            return returnResponse(2153)
        logger.info(f"successfully fetched review by id :{reviewId}")
        return returnResponse(2154, result=review)
    except Exception as e:
        logger.error(f"[REVIEW_GET_ONE_ERROR] {str(e)}")
        return returnResponse(2155)


@router.delete("/review/{reviewId}")
async def deleteReview(request: Request, reviewId: str):
    try:
        userId = request.state.userMetadata.get("id")
        isAdmin = hasRequiredRole(request, [UserRoles.Admin.value])
        review = getReviewFromDb({"id": reviewId, "isDeleted": False})
        if not review:
            logger.warning(f"No review found for ID [{reviewId}]")
            return returnResponse(2153)

        # Allow deletion if admin or if user is the reviewer
        if isAdmin or review.get("reviewedBy") == userId:
            deleteReviewFromDb({"id": reviewId}, {"isDeleted": True, "updatedAt": formatDateTime()})
            logger.info(f"Review [{reviewId}] soft-deleted by user [{userId}] (Admin: {isAdmin})")
            return returnResponse(2156)
        else:
            logger.warning(f"User [{userId}] unauthorized to delete review [{reviewId}]")
            return returnResponse(2000)  # Unauthorized

    except Exception as e:
        logger.error(f"[REVIEW_DELETE_ERROR] {str(e)}")
        return returnResponse(2157)
