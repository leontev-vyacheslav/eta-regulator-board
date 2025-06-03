from http import HTTPStatus
from flask import Response
from flask_pydantic import validate

from app import app
from models.common.enums.user_role_model import UserRoleModel
from models.remote_connector.remote_connectors_settings_model import RemoteConnectorsSettingsModel
from responses.json_response import JsonResponse
from utils.auth_helper import authorize


@app.api_route('/remote-connectors', methods=['GET'])
@authorize(roles=[UserRoleModel.ADMIN])
@validate()
def get_remote_connector_settings():
    remote_connectors_settings: RemoteConnectorsSettingsModel = app.get_remote_connectors_settings()

    return remote_connectors_settings


@app.api_route('/remote-connectors', methods=['PUT'])
@authorize(roles=[UserRoleModel.ADMIN])
@validate(response_by_alias=True)
def put_remote_connector_settings(body: RemoteConnectorsSettingsModel):
    remote_connector_settings = body

    try:
        remote_connectors_settings_repository = app.get_remote_connectors_settings_repository()
        remote_connectors_settings_repository.update(remote_connector_settings)
    except Exception as ex:
        app.app_logger.error("The saving of the remote connectors settings failed: %s", str(ex), exc_info=True, stack_info=True)

        return Response(
            status=HTTPStatus.INTERNAL_SERVER_ERROR
        )

    return JsonResponse(
        response=remote_connectors_settings_repository.settings,
        status=HTTPStatus.OK
    )
