from typing import List
from models.abstracts.app_base_model import AppBaseModel
from models.common.account_model import AccountModel


class AccountsModel(AppBaseModel):
    items: List[AccountModel]
