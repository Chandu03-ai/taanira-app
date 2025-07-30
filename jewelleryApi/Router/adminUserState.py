from fastapi import APIRouter, HTTPException, Request
from yensiAuthentication import logger, YensiKeycloakConfig
from yensiAuthentication.mongoData import getAllUsers, updateUser
from Models.userModel import UserRoles
from ReturnLog.logReturn import returnResponse
from Utils.utils import hasRequiredRole
from Utils.emailUtility import verifyPasswordWithKeycloak
from Models.userModel import ChangePasswordRequest

router = APIRouter()


@router.get("/admin/users")
async def getAllUser(request: Request):
    try:
        requiredRoles = [UserRoles.Admin.value]
        if not hasRequiredRole(request, requiredRoles):
            logger.warning("unAuthorized access attempt ")
            return returnResponse(2000)

        logger.info("Fetching all users.")
        users = list(getAllUsers({}))
        if not users:
            logger.warning("No users found.")
            return returnResponse(2111)

        result = [{**{key: value for key, value in doc.items() if key not in ("_id", "keycloakId")}} for doc in users]
        logger.info(f"users retrieved successfully")
        return returnResponse(2110, result)
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}", exc_info=True)
        return returnResponse(2112)


@router.put("/admin/users/{userId}/role")
async def updateUserRole(request: Request, userId: str, role: dict):
    try:
        requiredRoles = [UserRoles.Admin.value]
        if not hasRequiredRole(request, requiredRoles):
            logger.warning(f"Unauthorized role update attempt by user [{request.state.userMetadata.get('id')}]")
            return returnResponse(2000)

        query = {"id": userId}
        result = updateUser(query, role)
        if result.modified_count == 1:
            logger.info(f"Role for user [{userId}] set to [{role}]")
            return returnResponse(2122)
        else:
            logger.warning(f"No user updated. User [{userId}] not found or already has role [{role}].")
            return returnResponse(2123)

    except Exception as e:
        logger.error(f"Error updating user role: {str(e)}", exc_info=True)
        return returnResponse(2124)


@router.post("/change-password")
async def changePassword(request: Request, data: ChangePasswordRequest):
    try:
        logger.debug("Change Password function started.")

        userMetadata = request.state.userMetadata
        if not userMetadata:
            logger.warning("User metadata not found in request.")
            raise HTTPException(status_code=401, detail="Unauthorized")

        email = userMetadata.get("email")
        keycloakId = userMetadata.get("keycloakId")

        logger.info(f"Verifying old password for user: {email}")
        if not verifyPasswordWithKeycloak(email, data.oldPassword):
            logger.warning("Old password verification failed.")
            return returnResponse(2162)

        logger.info("Old password verified. Updating password in Keycloak.")
        payload = {"credentials": [{"type": "password", "value": data.newPassword, "temporary": False}]}
        YensiKeycloakConfig.keycloak_admin.update_user(user_id=keycloakId, payload=payload)

        logger.info("Password changed successfully.")
        return returnResponse(2163)

    except Exception as e:
        logger.error(f"Error occurred while changing password: {str(e)}")
        return returnResponse(2164)
