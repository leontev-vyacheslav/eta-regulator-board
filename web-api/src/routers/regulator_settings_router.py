from typing import List, Optional
import re
from http import HTTPStatus
from flask import send_file, request
from flask_pydantic import validate

from app import app
from models.common.change_tracker_item_model import ChangeTrackerItemModel
from models.common.enums.user_role_model import UserRoleModel
from models.common.message_model import MessageModel
from models.regulator.enums.control_mode_model import ControlModeModel
from models.regulator.heating_circuits_model import HeatingCircuitModel
from models.regulator.regulator_settings_model import RegulatorSettingsModel
from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from responses.json_response import JsonResponse
from regulation.launcher import launch_regulation_engines
from utils.auth_helper import authorize
from utils.encoding import verify_access_token
from lockers import worker_thread_locks


def on_changed_control_mode_settings_property(change_tracker_items: List[ChangeTrackerItemModel]) -> None:
    """
    This method define a specific response to a change of the "control_mode" property in the regulator settings model.
    We need to stop a certain regulation process when the "control_mode" property equals "OFF" value or start the new regulation process otherwise
    """
    control_mode_change_tracker_item = next(
        (
            c
            for c in change_tracker_items
            if ".control_mode" in c.path
        ),
        None
    )

    if control_mode_change_tracker_item is None:
        app.app_logger.debug('control_mode_change_tracker_item: %s', control_mode_change_tracker_item)
        return

    control_mode_current_value = control_mode_change_tracker_item.current_value
    control_mode_original_value = control_mode_change_tracker_item.original_value

    app.app_logger.debug('control_mode_current_value: %s', control_mode_current_value.name)
    app.app_logger.debug('control_mode_original_value: %s', control_mode_original_value.name)

    search_match = re.search(r'\[(\d+)\]', control_mode_change_tracker_item.path)
    if search_match is None:
        return

    regulator_engine_process_index = int(search_match.group(1))
    heating_circuit_index = HeatingCircuitIndexModel(regulator_engine_process_index)

    app.app_logger.debug('heating_circuit_index: %s', heating_circuit_index.name)

    background_processes_watcher_lock = worker_thread_locks.get('background_processes_watcher_lock')
    with background_processes_watcher_lock:
        if control_mode_current_value == ControlModeModel.OFF:
            regulator_engine_process = next(
                (
                    p for p in app.app_background_processes
                    if p.name.startswith(f"regulation_process_{regulator_engine_process_index}")
                ),
                None
            )
            if regulator_engine_process is not None:
                regulator_engine_process.cancellation_event.set()
                regulator_engine_process.process.join()
                app.app_background_processes.remove(regulator_engine_process)

        if control_mode_original_value == ControlModeModel.OFF and control_mode_current_value != ControlModeModel.OFF:
            launch_regulation_engines(app=app, target_heating_circuit_index=heating_circuit_index)


def on_changed_type_settings_property(change_tracker_items: List[ChangeTrackerItemModel]) -> None:
    """
    This method define a specific response to a change of the "type" property (the heating system type) in the regulator settings model.
    The current regulation engine process must be stopped and restarted for a new type of heating system
    """
    type_change_tracker_item = next(
        (
            c
            for c in change_tracker_items
            if ".type" in c.path
        ),
        None
    )

    if type_change_tracker_item is not None:
        search_match = re.search(r'\[(\d+)\]', type_change_tracker_item.path)
        if search_match is None:
            return

        regultor_engine_process_index = int(search_match.group(1))
        heating_circuit_index = HeatingCircuitIndexModel(regultor_engine_process_index)

        background_processes_watcher_lock = worker_thread_locks.get('background_processes_watcher_lock')
        with background_processes_watcher_lock:
            regulator_engine_process = next(
                (
                    p for p in app.app_background_processes
                    if p.name.startswith(f"regulation_process_{regultor_engine_process_index}")
                ),
                None
            )

            if regulator_engine_process is not None and regulator_engine_process.process.is_alive():
                regulator_engine_process.cancellation_event.set()
                regulator_engine_process.process.join()
                app.app_background_processes.remove(regulator_engine_process)

                regulator_settings = app.get_regulator_settings()
                if regulator_settings.heating_circuits.items[regultor_engine_process_index].control_parameters.control_mode != ControlModeModel.OFF:
                    launch_regulation_engines(app=app, target_heating_circuit_index=heating_circuit_index)


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
    try:
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

        on_changed_type_settings_property(change_tracker_items)
        on_changed_control_mode_settings_property(change_tracker_items)

        return JsonResponse(
            response=regulator_settings_repository.settings,
            status=HTTPStatus.OK
        )
    except Exception as ex:
        app.app_logger.error("The saving of the regulation settings failed: %s", str(ex), exc_info=True, stack_info=True)


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
