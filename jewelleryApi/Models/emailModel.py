from pydantic import BaseModel


class OrderSuccessEmailRequest(BaseModel):
    userName: str
    email: str
    orderId: str


class RegisterSuccessEmailRequest(BaseModel):
    userName: str
    email: str


class TrackingEmailRequest(BaseModel):
    userName: str
    email: str
    orderId: str
    trackingId: str
