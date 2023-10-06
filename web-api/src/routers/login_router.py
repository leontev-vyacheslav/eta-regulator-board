from flask import jsonify, make_response
from flask_pydantic import validate
import jwt

from app import app
from data_access.requlator_settings_repository import RegulatorSettingsRepository
from models.regulator.signin_model import SignInModel


@app.route('/sign-in', methods=['POST'])
@validate()
def signin(body: SignInModel):
    user_pass_key = body.pass_key
    regulator_settings_repository: RegulatorSettingsRepository = app.extensions['regulator_settings_repository']
    pass_key = regulator_settings_repository.settings.signin.pass_key

    if user_pass_key == pass_key:
        token = jwt.encode({
            'mac_address': regulator_settings_repository.settings.service.hardware_info.onion_mac_address
        }, pass_key)

        return make_response(
            jsonify({'token': token}),
            201
        )
