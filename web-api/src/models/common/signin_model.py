from models.abstracts.app_base_model import AppBaseModel


class SigninModel(AppBaseModel):
    password: str
