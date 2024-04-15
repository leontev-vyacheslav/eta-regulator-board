import sys
import signal

from flask_cors import CORS
from flask_ex import FlaskEx
from flask import request

from data_access.regulator_settings_repository import RegulatorSettingsRepository
from data_access.accounts_settings_repository import AccountsSettingsRepository
from workers.worker_starter_extension import WorkerStarter

APP_VERSION = 'v.0.1.20240404T062124'
APP_NAME = 'Eta Regulator Board Web API'

MASTER_KEY = 'XAMhI3XWj+PaXP5nRQ+nNpEn9DKyHPTVa95i89UZL6o='

app = FlaskEx(__name__)
CORS(
    app,
    allow_headers=['*'],
    methods=['GET', 'POST', 'PUT', 'DELETE'],
    origins=['*']
)
WorkerStarter(app)
AccountsSettingsRepository(app)
RegulatorSettingsRepository(app)


#pylint: disable=wrong-import-position, disable=wildcard-import
from routers import *


def shutdown_server(signum: signal.Signals, frame):
    sys.exit(0)

signal.signal(signal.SIGTERM, shutdown_server)
