from datetime import datetime
from http import HTTPStatus
from io import BytesIO
from typing import List
import gzip

from flask import send_file
from flask_pydantic import validate

from models.regulator.archives_model import ArchivesDatesModel, ArchivesModel
from models.common.message_model import MessageModel
from app import app
from responses.json_response import JsonResponse
from utils.auth_helper import authorize


@app.api_route('/archives/<date>', methods=['GET'])
@authorize()
@validate(response_by_alias=True)
def get_archive(date: datetime) -> ArchivesModel:

    data_path = app.app_root_path.joinpath(
        f'data/archives/{date.strftime("%Y-%m-%dT%H:%M:%SZ")}.json.gz'
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
    archive_dates = [
        datetime.strptime(f.stem.replace('.json', ''), '%Y-%m-%dT%H:%M:%SZ')
        for f in data_path.iterdir()
        if f.is_file() and f.suffix == '.gz'
    ]

    return ArchivesDatesModel(
        items=archive_dates
    )


@app.api_route('/archives/download/<date>', methods=['GET'])
@authorize()
@validate(response_by_alias=True)
def download_archives(date: datetime):

    data_path = app.app_root_path.joinpath(
        f'data/archives/{date.strftime("%Y-%m-%dT%H:%M:%SZ")}.json.gz'
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
