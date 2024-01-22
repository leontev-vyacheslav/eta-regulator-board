from datetime import datetime
from typing import List

from flask_pydantic import validate
from models.regulator.archives_model import ArchivesDatesModel, ArchivesModel

from app import app
from utils.auth_helper import authorize


@app.api_route('/archives/<date>', methods=['GET'])
@authorize()
@validate(response_by_alias=True)
def get_archive(date: datetime) -> ArchivesModel:

    data_path = app.app_root_path.joinpath(
        f'data/archives/{date.strftime("%Y-%m-%dT%H:%M:%S")}.json'
    )

    if not data_path.exists():
        return ArchivesModel(items=[])

    with open(data_path, 'r', encoding='utf-8') as file:
        json = file.read()
        archives = ArchivesModel.parse_raw(json)

    return archives


@app.api_route('/archives', methods=['GET'])
@authorize()
@validate(response_by_alias=True)
def get_archives_list() -> List[str]:
    data_path = app.app_root_path.joinpath('data/archives')
    archive_dates = [
        datetime.strptime(f.stem, '%Y-%m-%dT%H:%M:%S')
        for f in data_path.iterdir()
        if f.is_file() and f.suffix == '.json'
    ]

    return ArchivesDatesModel(
        items=archive_dates
    )
