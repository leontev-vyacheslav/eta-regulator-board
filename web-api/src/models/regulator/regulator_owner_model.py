from models.abstracts.app_base_model import AppBaseModel


class RegulatorOwnerModel(AppBaseModel):
    name: str

    phone_number: str
