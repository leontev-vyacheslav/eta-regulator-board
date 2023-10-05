from models.abstracts.app_base_model import AppBaseModel


class ShutdownRequestModel(AppBaseModel):
    security_pass: str
