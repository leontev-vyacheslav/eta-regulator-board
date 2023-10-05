from datetime import datetime

from models.abstracts.app_base_model import AppBaseModel


def convert_datetime_to_iso_8601_with_z_suffix(dt: datetime) -> str:
    return  dt.isoformat(timespec='milliseconds') + 'Z'
    #$.strftime('%Y-%m-%dT%H:%M:%S.%fZ')


class RtcDateTimeModel(AppBaseModel):
    datetime: datetime

    class Config:
        json_encoders = {
            # custom output conversion for datetime
            datetime: convert_datetime_to_iso_8601_with_z_suffix
        }
