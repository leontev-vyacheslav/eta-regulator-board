from datetime import datetime

from pydantic import BaseModel


def convert_datetime_to_iso_8601_with_z_suffix(dt: datetime) -> str:
    return  dt.isoformat(timespec='milliseconds') + 'Z'
    #$.strftime('%Y-%m-%dT%H:%M:%S.%fZ')


class RtcDateTimeModel(BaseModel):
    datetime: datetime

    class Config:
        json_encoders = {
            # custom output conversion for datetime
            datetime: convert_datetime_to_iso_8601_with_z_suffix
        }
