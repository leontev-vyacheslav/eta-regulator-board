from datetime import datetime, timedelta
from flask_pydantic import validate
import jwt

from app import app
from data_access.requlator_settings_repository import RegulatorSettingsRepository
from models.common.auth_user_model import AuthUserModel
from models.common.message_model import MessageModel
from models.common.signin_model import SigninModel
from responses.json_response import JsonResponse
from utils.auth_helper import authorize


@app.route('/sign-in', methods=['POST'])
@validate()
def signin(body: SigninModel):
    user_password = body.password

    regulator_settings_repository: RegulatorSettingsRepository = app.extensions['regulator_settings_repository']
    regulator_settings = regulator_settings_repository.settings

    password = regulator_settings.signin.password
    mac_address = regulator_settings.service.hardware_info.onion_mac_address

    if user_password == password:
        token = jwt.encode({
            'mac_address': mac_address,
            'exp': datetime.utcnow() + timedelta(minutes = 1)
        }, password)

        return JsonResponse(
            response=AuthUserModel(token=token),
            status=201
        )

    return JsonResponse(
        response=MessageModel(message='A singin is failed. The pass key is wrong.'),
        status=401
    )


@app.route('/sign-out', methods=['POST'])
@validate()
@authorize
def signout():

    return JsonResponse(
        response=MessageModel(message='The user token has been revoked.'),
        status=200
    )
