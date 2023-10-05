from pydantic import BaseModel

from models.regulator.rtc_datetime_model import RtcDateTimeModel

class SoftwareInfoModel(BaseModel):
    web_api_version: str

    web_ui_version: str


class HardwareInfoModel(BaseModel):
    onion_mac_address: str


class ServiceModel(BaseModel):
    software_info: SoftwareInfoModel

    hardware_info: HardwareInfoModel

    rtc_datetime: RtcDateTimeModel
