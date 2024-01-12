from functools import wraps
from flask import make_response, request, jsonify
import jwt

from app import app
from data_access.regulator_settings_repository import RegulatorSettingsRepository
from models.common.message_model import MessageModel
from responses.json_response import JsonResponse


def authorize(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = None
        requested_user = None

        if 'Authorization' in request.headers and 'X-ETA-Requested-User' in request.headers:
            token = request.headers['Authorization'].replace('Bearer ', '')
            requested_user = request.headers['X-ETA-Requested-User']

        if not token or not requested_user:
            return make_response(
                jsonify({'message': 'The access token is invalid.'}),
                401
            )

        try:
            regulator_settings_repository: RegulatorSettingsRepository = app.extensions['regulator_settings_repository']
            regulator_settings = regulator_settings_repository.settings

            account = next((acc for acc in regulator_settings.accounts.items if acc.login == requested_user) , None)
            if not account:
                return make_response(
                    jsonify({'message': 'Account was not found.'}),
                    401
                )

            mac_address = regulator_settings.service.hardware_info.onion_mac_address
            data = jwt.decode(token, account.password, algorithms=["HS256"])

            if data is not None:
                auth_mac_address = data.get('mac_address')
                if auth_mac_address is None or auth_mac_address != mac_address:
                    raise Exception('The access token is invalid.')
            else:
                raise Exception('The access token is invalid.')
        except jwt.ExpiredSignatureError:
            return JsonResponse(
                response=MessageModel(message='Срок действия токена авторизации истек.'),
                status=401
            )
        # pylint: disable=broad-except
        except Exception as ex:
            return JsonResponse(
                response=MessageModel(message=ex.__str__()),
                status=401
            )

        return f(*args, **kwargs)

    return decorator
