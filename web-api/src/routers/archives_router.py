from datetime import datetime
import fcntl
from http import HTTPStatus
from io import BytesIO
import gzip

from flask import send_file, Response
from flask_pydantic import validate

from app import app
from models.regulator.archive_model import ArchiveExistsModel
from models.regulator.archives_model import ArchivesModel
from models.common.message_model import MessageModel
from models.regulator.shared_regulator_state_model import SharedRegulatorStateModel
from responses.json_response import JsonResponse
from utils.auth_helper import authorize


def get_archive_path(heating_circuit_index: int, date: datetime):
    regulator_settings = app.get_regulator_settings()
    heating_circuit_type = regulator_settings.heating_circuits.items[heating_circuit_index].type
    archive_file_name = f'{heating_circuit_type.name}__{heating_circuit_index}__{date.replace(hour=0, minute=0, second=0).strftime("%Y-%m-%dT%H:%M:%SZ").replace(":", "_")}.json.gz'
    data_path = app.app_root_path.joinpath(
        f'data/archives/{date.year}/{archive_file_name}'
    )

    return data_path


@app.api_route('/archives/<heating_circuit_index>/<date>', methods=['GET'])
@authorize()
@validate(response_by_alias=True)
def get_archive(heating_circuit_index: int, date: datetime) -> ArchivesModel:

    archive_path = get_archive_path(heating_circuit_index, date)

    if not archive_path.exists():
        return ArchivesModel(items=[])

    with gzip.open(archive_path, 'r') as file:
        zip_content = file.read()
        json = zip_content.decode('utf-8')

    archives = ArchivesModel.parse_raw(json)

    return archives


@app.api_route('/archives/exists/<heating_circuit_index>/<date>', methods=['GET'])
@authorize()
@validate(response_by_alias=True)
def get_exists_archive(heating_circuit_index: int, date: datetime) -> ArchiveExistsModel:
    archive_path = get_archive_path(heating_circuit_index, date)

    if not archive_path.exists():
        return ArchiveExistsModel(exists=False)

    return ArchiveExistsModel(exists=True)


@app.api_route('/archives/download/<heating_circuit_index>/<date>', methods=['GET'])
@authorize()
@validate(response_by_alias=True)
def get_archives_as_file(heating_circuit_index: int, date: datetime):
    archive_path = get_archive_path(heating_circuit_index, date)

    if not archive_path.exists():
        return JsonResponse(
            response=MessageModel(
                message='Архивы на указанную дату отсутствуют в памяти.'
            ),
            status=HTTPStatus.NO_CONTENT
        )

    with gzip.open(archive_path, 'r') as file:
        zip_content = file.read()
        json = zip_content.decode('utf-8')

    in_memory_file = BytesIO(json.encode('utf-8'))

    file_response = send_file(
        path_or_file=in_memory_file,
        mimetype='application/json'
    )

    return file_response


@app.api_route('/archives/shared-regulator-state/<heating_circuit_index>', methods=['GET'])
@authorize()
@validate(response_by_alias=True)
def get_share_regulator_state(heating_circuit_index: int):
    regulator_settings = app.get_regulator_settings()
    heating_circuit_settings = regulator_settings.heating_circuits.items[heating_circuit_index]
    shared_regulator_state_file_name = f'{heating_circuit_settings.type.name}__{heating_circuit_index}'
    shared_regulator_state_file_path = app.app_root_path.joinpath(
        f'data/archives/{shared_regulator_state_file_name}'
    )
    if not shared_regulator_state_file_path.exists():
        return Response(status=HTTPStatus.NO_CONTENT)

    with open(shared_regulator_state_file_path, "r", encoding="utf-8") as shared_regulator_state_file:
        try:
            fcntl.flock(shared_regulator_state_file, fcntl.LOCK_SH)
            json_str = shared_regulator_state_file.read()
        finally:
            fcntl.flock(shared_regulator_state_file, fcntl.LOCK_UN)
    shared_regulator_state = SharedRegulatorStateModel.parse_raw(json_str)

    return shared_regulator_state
