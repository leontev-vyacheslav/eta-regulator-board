from datetime import datetime
from typing import List

from flask_pydantic import validate
from models.regulator.archives_model import ArchivesDatesModel, ArchivesModel

from app import app


@app.api_route('/archives/<date>', methods=['GET'])
@validate(response_by_alias=True)
def get_archive(date: datetime) -> ArchivesModel:

    data_path = app.app_root_path.joinpath(
        f'data/archives/archive-{date.date().isoformat()}.json'
    )

    if not data_path.exists():
        raise Exception('Архив не найден')

    with open(data_path, 'r', encoding='utf-8') as file:
        json = file.read()
        archives = ArchivesModel.parse_raw(json)

    return archives


@app.api_route('/archives/dates', methods=['GET'])
@validate(response_by_alias=True)
def get_archives_list() -> List[str]:
    data_path = app.app_root_path.joinpath('data/archives')
    archive_dates = [
        datetime.strptime(f.name.replace('.json', '').replace('archive-', ''), '%Y-%m-%d')
        for f in data_path.iterdir()
        if f.is_file()
    ]

    return ArchivesDatesModel(
        items=archive_dates
    )
