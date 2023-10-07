from models.abstracts.app_base_model import AppBaseModel


class AuthUserModel(AppBaseModel):
    token: str
