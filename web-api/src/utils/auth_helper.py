from functools import wraps
from typing import Callable, List, Optional
from flask import request
import jwt

from app import app
from data_access.regulator_settings_repository import RegulatorSettingsRepository
from models.common.enums.user_role_model import UserRoleModel
from models.common.message_model import MessageModel
from responses.json_response import JsonResponse


def authorize(roles: Optional[List[UserRoleModel]] = None):
    def decorator(router_endpoint_func: Callable):

        @wraps(router_endpoint_func)
        def wrapper(*args, **kwargs):
            token: Optional[str] = None
            requested_user: Optional[str] = None

            if 'Authorization' in request.headers and 'X-Requested-User' in request.headers:
                token = request.headers['Authorization'].replace('Bearer ', '')
                requested_user = request.headers['X-Requested-User']

            if not token or not requested_user:
                return  JsonResponse(
                    response=MessageModel(message='Токен авторизации или пользователь не найден.'),
                    status=401
                )

            try:
                regulator_settings_repository: RegulatorSettingsRepository = app.extensions['regulator_settings_repository']
                regulator_settings = regulator_settings_repository.settings

                account = next((acc for acc in regulator_settings.accounts.items if acc.login == requested_user) , None)

                if not account:
                    raise Exception('Учетная запись не найдена.')

                mac_address = regulator_settings.service.hardware_info.onion_mac_address
                data = jwt.decode(token, account.password, algorithms=["HS256"])

                is_in_role = (roles is None or len(roles) == 0) or account.role in roles

                if not is_in_role:
                    raise Exception('Отсутствуют права доступа.')

                auth_mac_address = data.get('mac_address')

                if auth_mac_address is None or auth_mac_address != mac_address:
                    raise Exception('Требуемое поле "mac_address" в токене авторизации отсутствует или не указано неверно.')


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

            return router_endpoint_func(*args, **kwargs)

        return wrapper

    return decorator
