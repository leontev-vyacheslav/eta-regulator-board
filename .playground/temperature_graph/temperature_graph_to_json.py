import os
import pathlib
from uuid import uuid4
from openpyxl import Workbook, load_workbook
from openpyxl.worksheet.worksheet import Worksheet
from json import dumps
from openpyxl.formula.translate import Translator

root = pathlib.Path(os.path.dirname(__file__))

work_book: Workbook = load_workbook(filename=f'{root.__str__()}/температурный график.xlsx')
work_sheet: Worksheet = work_book.get_sheet_by_name('Лист1')

temperature_graph = []
count = len(work_sheet['A1:G55'])
n = count // 5

for ind, row in enumerate(work_sheet['A1:G55']):
    if ind % n == 0 or ind == count - 1:
        temperature_graph.append({
            "id": str(uuid4()),
            "outdoorTemperature": row[0].value,
            "supplyPipeTemperature": round(-1.389 * float(row[0].value) + 47.774, 1),
            "returnPipeTemperature": round(-0.926 * float(row[0].value) + 38.516, 1)
        })


json_text = dumps(temperature_graph, indent=4)

with open(f'{root.__str__()}/temperature_graph.json', 'w') as f:
    f.write(json_text)
    f.close()



