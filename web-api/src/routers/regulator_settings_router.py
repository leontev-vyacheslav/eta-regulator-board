from typing import Optional
from flask import send_file
from flask_pydantic import validate
from models.regulator.heating_circuits_model import HeatingCircuitsModel
from responses.json_response import JsonResponse

from app import app
from models.regulator.regulator_settings_model import RegulatorSettingsChangeModel, RegulatorSettingsModel
from utils.auth_helper import authorize


@app.api_route('/regulator-settings', methods=['GET'])
@validate(response_by_alias=True)
@authorize
def get_regulator_settings() -> RegulatorSettingsModel:
    regulator_settings = app.get_regulator_settings()

    return regulator_settings


@app.api_route('/regulator-settings', methods=['PUT'])
@validate(response_by_alias=True)
@authorize
def put_regulator_settings(body: RegulatorSettingsChangeModel):
    regulator_settings_change = body

    regulator_settings_repository = app.get_regulator_settings_repository()
    regulator_settings_repository.update(current_settings=regulator_settings_change.regulator_settings)

    return JsonResponse(
        response=regulator_settings_repository.settings, status=200
    )

@app.api_route('/regulator-settings/download', methods=['GET'])
@authorize
def get_regulator_settings_as_file():
    return send_file(
        path_or_file = app.get_regulator_settings_repository().data_path,
        mimetype='application/json',
        download_name='regulator_settings.json'
    )


@app.api_route('/regulator-settings/default/<heating_circuit_type>', methods=['GET'])
@validate(response_by_alias=True)
@authorize
def get_default_heating_circuits_settings(heating_circuit_type: int):
    regulator_settings_repository = app.get_regulator_settings_repository()
    default_heating_circuit_settings_list = regulator_settings_repository.get_default_heating_circuits_settings()
    default_heating_circuit_settings: Optional[HeatingCircuitsModel] = next(
        (
            settings
            for settings in default_heating_circuit_settings_list.items
            if settings.type == heating_circuit_type
        ),
        None
    )

    return default_heating_circuit_settings
