import multiprocessing
import os
import sys
import signal
import os.path

from flask_cors import CORS
from flask_ex import FlaskEx

from data_access.regulator_settings_repository import RegulatorSettingsRepository
from data_access.accounts_settings_repository import AccountsSettingsRepository
from regulation.launcher import launch_regulation_engines
from workers.worker_starter_extension import WorkerStarter

APP_VERSION = 'v.0.1.20250223-103947'
APP_NAME = 'Eta Regulator Board Web API'

MASTER_KEY = 'XAMhI3XWj+PaXP5nRQ+nNpEn9DKyHPTVa95i89UZL6o='

app = FlaskEx(__name__)
CORS(
    app,
    origins=['*'],
    methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allow_headers=['*'],
)
WorkerStarter(app)
AccountsSettingsRepository(app)
RegulatorSettingsRepository(app)


#pylint: disable=wrong-import-position, disable=wildcard-import
from routers import *


def shutdown_handler(signum: signal.Signals, frame):
    current_process = multiprocessing.current_process()
    if current_process.name == 'MainProcess':
        for app_background_process in app.app_background_processes:
            app_background_process.cancellation_event.set()

            while app_background_process.process.is_alive():
                pass

            app.app_logger.info(f'The child process \'{app_background_process.name}\' was down.')

        app.app_logger.info('The main app process is ready to over.')

        sys.exit(0)


signal.signal(signal.SIGTERM, shutdown_handler)

app.app_logger.info('The master process PID is %d.', os.getpid())


launch_regulation_engines(app)
