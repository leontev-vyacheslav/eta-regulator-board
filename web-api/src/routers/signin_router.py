from datetime import datetime, timedelta
from hashlib import sha256
from flask_pydantic import validate
import jwt

from app import app
from models.common.auth_user_model import AuthUserModel
from models.common.message_model import MessageModel
from models.common.signin_model import SignInModel
from responses.json_response import JsonResponse
from utils.auth_helper import authorize


@app.route('/sign-in', methods=['POST'])
@validate()
def signin(body: SignInModel):
    regulator_settings = app.get_regulator_settings()
    accounts_settings = app.get_accounts_settings()

    account = next((acc for acc in accounts_settings.accounts.items if acc.login == body.login), None)

    if account is None:
        return JsonResponse(
            response=MessageModel(message='Не удалось войти в систему. Пользователь не найден.'),
            status=401
        )

    hashed_signin_password = sha256(body.password.encode(encoding='utf-8')).hexdigest()
    mac_address = regulator_settings.service.hardware_info.onion_mac_address

    if hashed_signin_password == account.password:
        token = jwt.encode({
            'mac_address': mac_address,
            'exp': datetime.utcnow() + timedelta(days=1)
        }, account.password)

        return JsonResponse(
            response=AuthUserModel(
                role=account.role,
                login=account.login,
                token=token
            ),
            status=201
        )

    return JsonResponse(
        response=MessageModel(message='Не удалось войти в систему. Пароль неправильный.'),
        status=401
    )


@app.route('/sign-out', methods=['POST'])
@validate()
@authorize()
def signout():

    return JsonResponse(
        response=MessageModel(message='Токен авторизации для текущего пользователя отозван.'),
    )


@app.route('/auth-check', methods=['GET'])
@validate()
@authorize()
def auth_check():

    return JsonResponse(
        response=MessageModel(
            message='The authorization token is valid.'
        ),
    )
