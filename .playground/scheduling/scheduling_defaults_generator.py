from datetime import datetime, timedelta
import calendar
import locale
import os
import pathlib
from uuid import uuid4
from json import dumps

locale.setlocale(locale.LC_ALL, 'ru_RU.utf8')

schedules = []
now = datetime.now()
root = pathlib.Path(os.path.dirname(__file__))

for i, day in enumerate(calendar.day_name):

    if i + 1 in range(6, 8):
       day_schedule = {
           'id': str(uuid4()),
           'day': i + 1,
           'windows': [
               {
                   'id': str(uuid4()),
                   'startTime': datetime(year=now.year, month=now.month, day=now.day, hour=0, minute=0, second=0),
                   'endTime': datetime(year=now.year, month=now.month, day=now.day, hour=23, minute=59, second=59),
                   'desiredTemperatureMode': 2
               }
           ]
       }

    if i + 1 in range(1, 6):
        day_schedule = {
            'id': str(uuid4()),
            'day': i + 1,
            'windows': [
                {
                    'id': str(uuid4()),
                    'startTime': datetime(year=now.year, month=now.month, day=now.day, hour=0, minute=0, second=0),
                    'endTime': datetime(year=now.year, month=now.month, day=now.day, hour=5, minute=0, second=0),
                    'desiredTemperatureMode': 3
                },
                {
                    'id': str(uuid4()),
                    'startTime': datetime(year=now.year, month=now.month, day=now.day, hour=5, minute=0, second=0),
                    'endTime': datetime(year=now.year, month=now.month, day=now.day, hour=10, minute=0, second=0),
                    'desiredTemperatureMode': 2
                },
                {
                    'id': str(uuid4()),
                    'startTime': datetime(year=now.year, month=now.month, day=now.day, hour=10, minute=0, second=0),
                    'endTime': datetime(year=now.year, month=now.month, day=now.day, hour=16, minute=0, second=0),
                    'desiredTemperatureMode': 3
                },
                {
                    'id': str(uuid4()),
                    'startTime': datetime(year=now.year, month=now.month, day=now.day, hour=16, minute=0, second=0),
                    'endTime': datetime(year=now.year, month=now.month, day=now.day, hour=21, minute=0, second=0),
                    'desiredTemperatureMode': 2
                },
                {
                    'id': str(uuid4()),
                    'startTime': datetime(year=now.year, month=now.month, day=now.day, hour=21, minute=0, second=0),
                    'endTime': datetime(year=now.year, month=now.month, day=now.day, hour=23, minute=59, second=59),
                    'desiredTemperatureMode': 3
                }
            ]
        }

    day_schedule['windows'] = [{
        'id': w['id'],
        'startTime': (w['startTime'] - timedelta(hours=3)).isoformat(timespec='milliseconds') + 'Z',
        'endTime': (w['endTime'] - timedelta(hours=3)).isoformat(timespec='milliseconds') + 'Z',
        'desiredTemperatureMode': w['desiredTemperatureMode'],
    } for w in day_schedule['windows']]

    schedules.append(day_schedule)

json_text = dumps(schedules, indent=4)


with open(f'{root.__str__()}/scheduling_defaults.json', 'w') as f:
    f.write(json_text)
    f.close()
