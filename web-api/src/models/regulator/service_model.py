from pydantic.fields import Field
from models.abstracts.app_base_model import AppBaseModel

class RegulatorOwnerModel(AppBaseModel):
    name: str = Field(required_access_token=True)

    phone_number: str = Field(required_access_token=True)


class SoftwareInfoModel(AppBaseModel):
    web_api_version: str

    web_ui_version: str


class HardwareInfoModel(AppBaseModel):
    onion_mac_address: str


class ServiceModel(AppBaseModel):
    regulator_owner: RegulatorOwnerModel

    software_info: SoftwareInfoModel

    hardware_info: HardwareInfoModel

    allow_debug_mode: bool
