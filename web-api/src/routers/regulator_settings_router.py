from flask_pydantic import validate

from app import app
from models.regulator.settings_model import SettingsModel

@app.api_route('/regulator-settings', methods=['GET'])
@validate(response_by_alias=True)
def get_regulator_settings() -> SettingsModel:

    return app.regulator_settings_repository.settings
