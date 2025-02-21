from datetime import datetime

from models.abstracts.app_base_model import AppBaseModel

class RtcDateTimeModel(AppBaseModel):
    datetime: datetime
