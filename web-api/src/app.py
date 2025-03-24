import datetime
from http import HTTPStatus
import multiprocessing
import os
import sys
import signal
import os.path
import time

from flask_cors import CORS
from flask_ex import FlaskEx

from data_access.regulator_settings_repository import RegulatorSettingsRepository
from data_access.accounts_settings_repository import AccountsSettingsRepository
from models.common.message_model import MessageModel
from regulation.launcher import launch_regulation_engines
from responses.json_response import JsonResponse
from utils.datetime_helper import sync_sys_datetime
from utils.debugging import is_debug
from workers.worker_starter_extension import WorkerStarter
from lockers import worker_thread_locks

APP_VERSION = 'v.0.2.20250323-104047'
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


@app.errorhandler(Exception)
def handle_unhandled_exception(error):
    app.app_logger.error(f"Unhandled Exception: {str(error)}", exc_info=True)

    return JsonResponse(
        response=MessageModel(message="An unexpected error occurred"),
        status=HTTPStatus.INTERNAL_SERVER_ERROR
    )


# pylint: disable=wrong-import-position, disable=wildcard-import
from routers import *

background_processes_watcher_lock = worker_thread_locks.get('background_processes_watcher_lock')


def shutdown_handler(signum: signal.Signals, frame):
    current_process = multiprocessing.current_process()
    if current_process.name == 'MainProcess':

        with background_processes_watcher_lock:
            for app_background_process in app.app_background_processes:
                app_background_process.cancellation_event.set()
                app_background_process.process.join()
                app.app_logger.info(f'The child process \'{app_background_process.name}\' was down.')

        app.app_logger.info('The main app process is ready to over.')

        sys.exit(0)


signal.signal(signal.SIGTERM, shutdown_handler)

app.app_logger.critical('The main app process was started with PID %d.', os.getpid())

if not is_debug():
    try:
        sync_sys_datetime()
        app.app_logger.critical(f'The system datetime was updated { datetime.datetime.now() }')
    except Exception as ex:
        app.app_logger.error(f'The updating system datetime was failed: {str(ex)}', )

with background_processes_watcher_lock:
    launch_regulation_engines(app)
