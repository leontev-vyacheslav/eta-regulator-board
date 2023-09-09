from datetime import datetime

from pydantic import BaseModel


class RtcDatetime(BaseModel):
    datetime: datetime
