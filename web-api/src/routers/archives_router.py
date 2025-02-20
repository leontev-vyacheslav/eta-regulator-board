from datetime import datetime, timedelta, timezone
import fcntl
from http import HTTPStatus
from io import BytesIO
import gzip
from pathlib import Path

from flask import send_file, Response
from flask_pydantic import validate

from app import app
from models.regulator.archive_model import ArchiveExistsModel
from models.regulator.archives_model import ArchivesModel
from models.common.message_model import MessageModel
from models.regulator.shared_regulator_state_model import SharedRegulatorStateModel
from responses.json_response import JsonResponse
from utils.auth_helper import authorize


def get_archives_content(heating_circuit_index: int, timezone_date: datetime):

    def __get_archive_path(date: datetime) -> Path:
        regulator_settings = app.get_regulator_settings()
        heating_circuit_type = regulator_settings.heating_circuits.items[heating_circuit_index].type
        archive_file_name = f'{heating_circuit_type.name}__{heating_circuit_index}__{date.replace(hour=0, minute=0, second=0).strftime("%Y-%m-%dT%H:%M:%SZ").replace(":", "_")}.json.gz'
        data_path = app.app_root_path.joinpath(
            f'data/archives/{date.year}/{archive_file_name}'
        )

        return data_path

    def __get_archives(date: datetime):
        data_path = __get_archive_path(date)
        if not data_path.exists():
            return ArchivesModel(items=[])

        try:
            with gzip.open(data_path, 'r') as file:
                zip_content = file.read()
                json_text = zip_content.decode('utf-8')
            archives = ArchivesModel.parse_raw(json_text, encoding='utf-8')
        except:
            archives = ArchivesModel(items=[])

        return archives

    total_archives = ArchivesModel(items=[])
    base_date = timezone_date
    archives = __get_archives(base_date)

    if len(archives.items) > 0:
        total_archives.items.extend(archives.items)

    shift_timezone_hours = int(timezone_date.utcoffset().total_seconds() / 3600)
    if shift_timezone_hours != 0:
        shift_date = timezone_date
        if shift_timezone_hours > 0:
            shift_date -= timedelta(days=1)
        else:
            shift_date += timedelta(days=1)

        archives = __get_archives(shift_date)

        if len(archives.items) > 0:
            total_archives.items.extend(archives.items)

    target_date = datetime(timezone_date.year, timezone_date.month, timezone_date.day, tzinfo=timezone.utc)
    start_of_day_utc = target_date - timedelta(hours=shift_timezone_hours)
    end_of_day_utc = target_date + timedelta(hours=24 - shift_timezone_hours)

    total_archives.items = [item for item in total_archives.items if start_of_day_utc <= item.datetime < end_of_day_utc]
    total_archives.items.sort(key=lambda archive: archive.datetime)

    return total_archives


@app.api_route('/archives/<heating_circuit_index>/<timezone_date>', methods=['GET'])
@authorize()
@validate(response_by_alias=True)
def get_archive(heating_circuit_index: int, timezone_date: datetime) -> ArchivesModel:
    archives = get_archives_content(heating_circuit_index, timezone_date)

    return archives


@app.api_route('/archives/exists/<heating_circuit_index>/<timezone_date>', methods=['GET'])
@authorize()
@validate(response_by_alias=True)
def get_exists_archive(heating_circuit_index: int, timezone_date: datetime) -> ArchiveExistsModel:
    archives = get_archives_content(heating_circuit_index, timezone_date)

    if len(archives.items) == 0:
        return ArchiveExistsModel(exists=False)

    return ArchiveExistsModel(exists=True)


@app.api_route('/archives/download/<heating_circuit_index>/<timezone_date>', methods=['GET'])
@authorize()
@validate(response_by_alias=True)
def get_archives_as_file(heating_circuit_index: int, timezone_date: datetime):
    archives = get_archives_content(heating_circuit_index, timezone_date)

    if len(archives.items) == 0:
        return JsonResponse(
            response=MessageModel(
                message='Архивы на указанную дату отсутствуют в памяти.'
            ),
            status=HTTPStatus.NO_CONTENT
        )

    json_text = archives.json(by_alias=True)
    in_memory_file = BytesIO(json_text.encode('utf-8'))

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
