from datetime import datetime
from http import HTTPStatus
from io import BytesIO
import re
from typing import List
import gzip

from flask import send_file
from flask_pydantic import validate

from models.regulator.archives_model import ArchivesDatesModel, ArchivesModel
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
        f'data/archives/{heating_circuit_type.name}_{heating_circuit_index}_{date.strftime("%Y-%m-%dT%H:%M:%SZ").replace(":", "_")}.json.gz'
    )

    if not data_path.exists():
        return ArchivesModel(items=[])

    with gzip.open(data_path, 'r') as file:
        zip_content = file.read()
        json = zip_content.decode('utf-8')

    archives = ArchivesModel.parse_raw(json)

    return archives


@app.api_route('/archives', methods=['GET'])
@authorize()
@validate(response_by_alias=True)
def get_archives_list() -> List[str]:
    data_path = app.app_root_path.joinpath('data/archives')
    file_names = [
        f.stem.replace('_', ':').replace('.json', '')
        for f in data_path.iterdir()
        if f.is_file() and f.suffix == '.gz'
    ]

    archive_dates = [
        datetime.strptime(f, '%Y-%m-%dT%H:%M:%SZ')
        for f in file_names
        if re.match(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$', f) is not None
    ]

    return ArchivesDatesModel(
        items=archive_dates
    )


@app.api_route('/archives/download/<date>', methods=['GET'])
@authorize()
@validate(response_by_alias=True)
def get_archives_as_file(date: datetime):

    data_path = app.app_root_path.joinpath(
        f'data/archives/{date.strftime("%Y-%m-%dT%H:%M:%SZ").replace(":", "_")}.json.gz'
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

    file_response =  send_file(
        path_or_file=in_memory_file,
        mimetype='application/json'
    )

    return file_response
