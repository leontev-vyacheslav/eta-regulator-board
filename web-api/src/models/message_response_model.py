from typing import Any, Optional

from pydantic import BaseModel


class MessageResponseModel(BaseModel):
        message: str
        data: Optional[Any] = None
