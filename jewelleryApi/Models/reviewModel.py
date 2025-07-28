from pydantic import BaseModel, Field
from typing import Optional

class ReviewModel(BaseModel):
    productId: str
    rating: float = Field(ge=1, le=5)
    comment: Optional[str] = ""
    reviewedBy: str

class ReviewUpdateModel(BaseModel):
    rating: Optional[float] = Field(default=None, ge=1, le=5)
    comment: Optional[str]
