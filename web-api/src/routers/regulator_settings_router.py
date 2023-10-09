from flask_pydantic import validate

from app import app
from data_access.requlator_settings_repository import RegulatorSettingsRepository
from models.regulator.settings_model import SettingsModel

@app.api_route('/regulator-settings', methods=['GET'])
@validate(response_by_alias=True)
def get_regulator_settings() -> SettingsModel:
    regulator_settings_repository: RegulatorSettingsRepository = app.extensions['regulator_settings_repository']
    regulator_settings = regulator_settings_repository.settings

    return regulator_settings
