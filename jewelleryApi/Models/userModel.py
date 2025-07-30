from enum import Enum
from pydantic import BaseModel


class UserRoles(Enum):
    Admin = "Admin"
    User = "user"


class ChangePasswordRequest(BaseModel):
    oldPassword: str
    newPassword: str