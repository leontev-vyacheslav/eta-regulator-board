from uuid import uuid4
from openpyxl import Workbook, load_workbook
from openpyxl.worksheet.worksheet import Worksheet
from json import dumps

work_book: Workbook = load_workbook(filename='/workspaces/eta-regulator-board/.doc/температурный график.xlsx')
work_sheet: Worksheet = work_book.get_sheet_by_name('Лист1')

temperature_graph = []

for row in work_sheet['A1:C54']:
    temperature_graph.append({
        "id": str(uuid4()),
        "outdoorTemperature": row[0].value,
        "supplyPipeTemperature": float(row[1].value) / 1000,
        "returnPipeTemperature": float(row[2].value) / 1000
    })

json_text = dumps(temperature_graph)

with open('/workspaces/eta-regulator-board/.doc/temperature_graph.json', 'w') as f:
    f.write(json_text)
    f.close()



