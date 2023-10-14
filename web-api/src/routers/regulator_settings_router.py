from flask_pydantic import validate

from app import app
from models.regulator.regulator_settings_model import RegulatorSettingsModel

@app.api_route('/regulator-settings', methods=['GET'])
@validate(response_by_alias=True)
def get_regulator_settings() -> RegulatorSettingsModel:
    regulator_settings = app.get_regulator_settings()

    return regulator_settings
