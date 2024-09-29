from models.abstracts.app_base_model import AppBaseModel
from models.common.accounts_model import AccountsModel


class AccountsSettingsModel(AppBaseModel):
    accounts: AccountsModel
