from typing import Any, Optional

from pydantic import BaseModel


class MessageModel(BaseModel):
    message: str
    
    data: Optional[Any] = None
