from flask_pydantic import validate
from responses.json_response import JsonResponse

from app import app
from models.regulator.regulator_settings_model import RegulatorSettingsChangeModel, RegulatorSettingsModel


@app.api_route('/regulator-settings', methods=['GET'])
@validate(response_by_alias=True)
def get_regulator_settings() -> RegulatorSettingsModel:
    regulator_settings = app.get_regulator_settings()

    return regulator_settings


@app.api_route('/regulator-settings', methods=['PUT'])
@validate(response_by_alias=True)
def put_regulator_settings(body: RegulatorSettingsChangeModel):
    regulator_settings_change = body

    regulator_settings_repository = app.get_regulator_settings_repository()
    regulator_settings_repository.update(current_settings=regulator_settings_change.regulator_settings)

    return JsonResponse(
        response=regulator_settings_repository.settings, status=200
    )
