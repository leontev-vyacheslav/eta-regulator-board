from typing import Any, Optional

from models.common.message_model import MessageModel


class ExtendedMessageModel(MessageModel):
    data: Optional[Any] = None
