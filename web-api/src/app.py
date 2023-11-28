from flask_cors import CORS
from flask_ex import FlaskEx

from data_access.regulator_settings_repository import RegulatorSettingsRepository
from workers.worker_starter_extension import WorkerStarter

APP_VERSION = 'v.0.1.20231128-081605'
APP_NAME = 'Eta Regulator Board Web API'

app = FlaskEx(__name__)
CORS(
    app,
    allow_headers=['*'],
    methods=['GET', 'POST', 'PUT', 'DELETE'],
    origins=['*']
)
WorkerStarter(app)
RegulatorSettingsRepository(app)


#pylint: disable=wrong-import-position, disable=wildcard-import
from routers import *
#pylint: enable=wrong-import-position, enable=wildcard-import
