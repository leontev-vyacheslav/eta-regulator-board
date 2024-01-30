from copy import deepcopy
from hashlib import sha256
from http import HTTPStatus
from flask import request
from flask_pydantic import validate

from app import app
from models.accounts_settings_model import AccountsSettingsModel
from models.common.account_model import AccountModel, ExtendedAccountModel
from models.common.accounts_model import AccountsModel
from models.common.message_model import MessageModel
from models.common.enums.user_role_model import UserRoleModel
from utils.auth_helper import authorize
from utils.encoding import verify_access_token
from responses.json_response import JsonResponse


@app.api_route('/accounts', methods=['GET'])
@authorize(roles=[UserRoleModel.ADMIN])
@validate()
def get_accounts_settings():
    accounts_settings_repository = app.get_accounts_settings_repository()
    accounts_settings: AccountsSettingsModel = accounts_settings_repository.settings

    accountList = [
       AccountModel(
            id=acc.id,
            role=acc.role,
            login=acc.login,
            password=''
        )
        for acc in accounts_settings.accounts.items
    ]

    return AccountsModel (
        items=accountList
    )


@app.api_route('/accounts', methods=['PUT'])
@authorize(roles=[UserRoleModel.ADMIN])
@validate(response_by_alias=True)
def put_account(body: ExtendedAccountModel):
    extended_account = body

    if extended_account.password != extended_account.confirmed_password:
        raise Exception('Пароль не подтвержден.')

    accounts_settings_repository = app.get_accounts_settings_repository()
    accounts_settings: AccountsSettingsModel = accounts_settings_repository.settings

    updated_accounts_settings = deepcopy(accounts_settings)
    account = next((acc for acc in updated_accounts_settings.accounts.items if acc.id == extended_account.id), None)
    if account is None:
        raise Exception('Учетная запись не найдена.')
    account.password = sha256(extended_account.password.encode(encoding='utf-8')).hexdigest()

    change_tracker_items = accounts_settings_repository.find_changed_fields(updated_accounts_settings)

    required_access_token = next(
        (
            c.required_access_token
            for c in change_tracker_items
            if c.required_access_token is not None
        ),
        None
    )
    if required_access_token is not None:
        access_token = request.headers.get('X-Access-Token')
        is_verify = access_token is not None and verify_access_token(access_token=access_token)

        if not is_verify:

            return JsonResponse(
                response=MessageModel(message='Токен доступа отсутствует или указан неверно.'),
                status=HTTPStatus.FORBIDDEN
            )

        # log here change_tracker_items
        accounts_settings_repository.update(updated_accounts_settings)


    return JsonResponse(
        response=accounts_settings,
        status=HTTPStatus.OK
    )
