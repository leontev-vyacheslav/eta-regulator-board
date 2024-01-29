from pydantic import Field
from models.abstracts.app_base_model import AppBaseModel
from models.common.enums.user_role_model import UserRoleModel


class AccountModel(AppBaseModel):
    id: str

    role: UserRoleModel

    login: str

    password: str = Field(required_access_token=True)


class ExtendedAccountModel(AccountModel):
    confirmed_password: str
