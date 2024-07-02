from datetime import datetime
from http import HTTPStatus
from io import BytesIO
import gzip

from flask import send_file
from flask_pydantic import validate

from models.regulator.archive_model import ArchiveExistsModel
from models.regulator.archives_model import ArchivesModel
from models.common.message_model import MessageModel
from app import app
from responses.json_response import JsonResponse
from utils.auth_helper import authorize


@app.api_route('/archives/<heating_circuit_index>/<date>', methods=['GET'])
@authorize()
@validate(response_by_alias=True)
def get_archive(heating_circuit_index: int, date: datetime) -> ArchivesModel:
    regulator_settings = app.get_regulator_settings()
    heating_circuit_type = regulator_settings.heating_circuits.items[heating_circuit_index].type
    data_path = app.app_root_path.joinpath(
        f'data/archives/{heating_circuit_type.name}__{heating_circuit_index}__{date.replace(hour=0, minute=0, second=0).strftime("%Y-%m-%dT%H:%M:%SZ").replace(":", "_")}.json.gz'
    )

    if not data_path.exists():
        return ArchivesModel(items=[])

    with gzip.open(data_path, 'r') as file:
        zip_content = file.read()
        json = zip_content.decode('utf-8')

    archives = ArchivesModel.parse_raw(json)

    return archives


@app.api_route('/archives/exists/<heating_circuit_index>/<date>', methods=['GET'])
@authorize()
@validate(response_by_alias=True)
def get_exists_archive(heating_circuit_index: int, date: datetime) -> ArchiveExistsModel:
    regulator_settings = app.get_regulator_settings()
    heating_circuit_type = regulator_settings.heating_circuits.items[heating_circuit_index].type
    data_path = app.app_root_path.joinpath(
        f'data/archives/{heating_circuit_type.name}__{heating_circuit_index}__{date.replace(hour=0, minute=0, second=0).strftime("%Y-%m-%dT%H:%M:%SZ").replace(":", "_")}.json.gz'
    )

    if not data_path.exists():
        return ArchiveExistsModel(exists=False)

    return ArchiveExistsModel(exists=True)


@app.api_route('/archives/download/<heating_circuit_index>/<date>', methods=['GET'])
@authorize()
@validate(response_by_alias=True)
def get_archives_as_file(heating_circuit_index: int, date: datetime):
    regulator_settings = app.get_regulator_settings()
    heating_circuit_type = regulator_settings.heating_circuits.items[heating_circuit_index].type

    data_path = app.app_root_path.joinpath(
        f'data/archives/{heating_circuit_type.name}__{heating_circuit_index}__{date.replace(hour=0, minute=0, second=0).strftime("%Y-%m-%dT%H:%M:%SZ").replace(":", "_")}.json.gz'
    )

    if not data_path.exists():
        return JsonResponse(
            response=MessageModel(
                message='Архивы на указанную дату отсутствуют в памяти.'
            ),
            status=HTTPStatus.NOT_FOUND
        )

    with gzip.open(data_path, 'r') as file:
        zip_content = file.read()
        json = zip_content.decode('utf-8')

    in_memory_file = BytesIO(json.encode('utf-8'))

    file_response = send_file(
        path_or_file=in_memory_file,
        mimetype='application/json'
    )

    return file_response
