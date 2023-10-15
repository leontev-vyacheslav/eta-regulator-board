from datetime import datetime, timedelta
from flask_pydantic import validate
import jwt

from app import app
from models.common.owner_info_model import OwnerInfoModel
from models.common.auth_user_model import AuthUserModel
from models.common.message_model import MessageModel
from models.common.signin_model import SigninModel
from responses.json_response import JsonResponse
from utils.auth_helper import authorize


@app.route('/sign-in', methods=['POST'])
@validate()
def signin(body: SigninModel):
    user_password = body.password
    regulator_settings = app.get_regulator_settings()

    password = regulator_settings.signin.password
    mac_address = regulator_settings.service.hardware_info.onion_mac_address

    if user_password == password:
        token = jwt.encode({
            'mac_address': mac_address,
            'exp': datetime.utcnow() + timedelta(minutes = 30)
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

@app.route('/auth-check', methods=['GET'])
@validate()
@authorize
def auth_check():

    return JsonResponse(
        response=MessageModel(
            message='The authorization token is valid.'
        ),
        status=200
    )

@app.route('/owner-info', methods=['GET'])
@validate()
def get_owner_info():
    regulator_settings = app.get_regulator_settings()

    return  JsonResponse(
        response=OwnerInfoModel(name=regulator_settings.service.regulator_owner.name),
        status=200
    )
