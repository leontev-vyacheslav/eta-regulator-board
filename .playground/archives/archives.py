import pathlib
import gzip
import json

archives_root = '/workspaces/eta-regulator-board/web-api/data/archives/'


for p in pathlib.Path(archives_root).iterdir():
    if p.is_file() and p.suffix == '.json':
        with open(p, 'r', encoding='utf-8') as f, gzip.open(p.__str__() + '.gz', 'w') as zf:
            json_text = f.read()
            zf.write(json_text.encode('utf-8'))

