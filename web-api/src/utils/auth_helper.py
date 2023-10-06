from functools import wraps
from flask import make_response, request, jsonify
import jwt

from app import app
from data_access.requlator_settings_repository import RegulatorSettingsRepository


def authorize(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = None
        if 'bearer' in request.headers:
            token = request.headers['bearer']

        if not token:
            return jsonify({'message': 'A valid access token is missing.'})
        try:
            regulator_settings_repository: RegulatorSettingsRepository = app.extensions['regulator_settings_repository']
            mac_address = regulator_settings_repository.settings.service.hardware_info.onion_mac_address
            pass_key = regulator_settings_repository.settings.signin.pass_key
            data = jwt.decode(token, pass_key, algorithms=["HS256"])

            if data is not None:
                auth_mac_address = data.get('mac_address')
                if auth_mac_address is None or auth_mac_address != mac_address:
                    raise Exception
            else:
                raise Exception
        except:
            return make_response(
                jsonify({'message': 'The access token is invalid.'}),
                401
            )

        return f(*args, **kwargs)

    return decorator
