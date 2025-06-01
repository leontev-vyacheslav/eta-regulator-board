from flask_pydantic import validate

from app import app
from models.common.enums.user_role_model import UserRoleModel
from models.remote_connector.remote_connectors_settings_model import RemoteConnectorsSettingsModel
from utils.auth_helper import authorize


@app.api_route('/remote-connectors', methods=['GET'])
@authorize(roles=[UserRoleModel.ADMIN])
@validate()
def get_remote_connector_settings():
    remote_connector_settings: RemoteConnectorsSettingsModel = app.get_remote_connector_settings()

    return remote_connector_settings