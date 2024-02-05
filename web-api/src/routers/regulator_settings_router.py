from typing import Optional
from http import HTTPStatus
from flask import send_file, request
from flask_pydantic import validate

from app import app
from models.common.enums.user_role_model import UserRoleModel
from models.common.message_model import MessageModel
from models.regulator.heating_circuits_model import HeatingCircuitModel
from models.regulator.regulator_settings_model import RegulatorSettingsModel
from responses.json_response import JsonResponse
from utils.auth_helper import authorize
from utils.encoding import verify_access_token


@app.api_route('/regulator-settings', methods=['GET'])
@authorize()
@validate(response_by_alias=True)
def get_regulator_settings() -> RegulatorSettingsModel:
    regulator_settings = app.get_regulator_settings()

    return regulator_settings


@app.api_route('/regulator-settings', methods=['PUT'])
@authorize(roles=[UserRoleModel.ADMIN])
@validate(response_by_alias=True)
def put_regulator_settings(body: RegulatorSettingsModel):
    regulator_settings = body
    regulator_settings_repository = app.get_regulator_settings_repository()
    change_tracker_items = regulator_settings_repository.find_changed_fields(regulator_settings)
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
    regulator_settings_repository.update(regulator_settings)

    return JsonResponse(
        response=regulator_settings_repository.settings,
        status=HTTPStatus.OK
    )


@app.api_route('/regulator-settings/download', methods=['GET'])
@authorize(roles=[UserRoleModel.ADMIN, UserRoleModel.OPERATOR])
def get_regulator_settings_as_file():
    return send_file(
        path_or_file=app.get_regulator_settings_repository().data_path,
        mimetype='application/json',
        download_name='regulator_settings.json'
    )


@app.api_route('/regulator-settings/default/<heating_circuit_type>', methods=['GET'])
@authorize(roles=[UserRoleModel.ADMIN])
@validate(response_by_alias=True)
def get_default_heating_circuits_settings(heating_circuit_type: int):
    regulator_settings_repository = app.get_regulator_settings_repository()
    default_heating_circuit_settings_list = regulator_settings_repository.get_default_heating_circuits_settings()

    default_heating_circuit_settings: Optional[HeatingCircuitModel] = next(
        (
            settings
            for settings in default_heating_circuit_settings_list.items
            if settings.type == heating_circuit_type
        ),
        None
    )

    if default_heating_circuit_settings is None:
        raise ValueError(f'Heating circuit type {heating_circuit_type} not found')

    default_heating_circuit_settings.modify_identifiers()

    return default_heating_circuit_settings


@app.api_route('/regulator-settings/reset', methods=['GET'])
@authorize(roles=[UserRoleModel.ADMIN])
@validate(response_by_alias=True)
def get_reset_default_heating_circuits_settings():
    regulator_settings_repository = app.get_regulator_settings_repository()
    default_heating_circuit_settings_list = regulator_settings_repository.get_default_heating_circuits_settings()

    for default_heating_circuit_settings in default_heating_circuit_settings_list.items:
        default_heating_circuit_settings.modify_identifiers()

    return default_heating_circuit_settings_list
