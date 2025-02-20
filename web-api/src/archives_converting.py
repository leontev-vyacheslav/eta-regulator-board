import pathlib
import gzip
import json

from models.regulator.archives_model import ArchivesModel

archives_root = '/workspaces/eta-regulator-board/.temp/2025'


for p in pathlib.Path(archives_root).iterdir():
    if p.is_file():
        with gzip.open(p.__str__(), 'r') as zf:
            json_text1 = zf.read()

        a = ArchivesModel.parse_raw(json_text1, encoding='utf-8')

        with gzip.open(p.__str__(), 'w') as zf:
            json_text2 = a.json(by_alias=True)
            zf.write(json_text2.encode())


