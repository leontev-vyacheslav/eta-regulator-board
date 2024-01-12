from models.abstracts.app_base_model import AppBaseModel


class SignInModel(AppBaseModel):
    login: str

    password: str
