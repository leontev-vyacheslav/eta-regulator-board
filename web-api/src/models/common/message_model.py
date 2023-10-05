from typing import Any, Optional

from models.abstracts.app_base_model import AppBaseModel


class MessageModel(AppBaseModel):
    message: str

    data: Optional[Any] = None
