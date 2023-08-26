import os
import pathlib
from datetime import timedelta

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_pydantic import validate

from decorators.app_router_prefix import app_route_prefix
from models.shutdown_request_model import ShutdownRequestModel

app = Flask(__name__)
CORS(app,
     allow_headers=['*'],
     methods=['GET', 'POST', 'PUT', 'DELETE'],
     origins=['*']
    )

app.api_route = app_route_prefix(app.route, '/api')

@app.route('/favicon.ico', methods=['GET'])
def favicon():

    return send_from_directory(
        os.path.join(app.root_path, 'static'),
        'favicon.ico',
        mimetype='image/vnd.microsoft.icon'
    )

@app.route('/shutdown', methods=['POST'])
@validate()
def shutdown(form: ShutdownRequestModel):

    if form.security_pass == 'onioneer':
        os.kill(os.getpid(), 9)

        return 'Shutting down...'
    else:

        return 'Shut down was rejected...'

from celery import Celery

celery_data_path = pathlib.Path(__file__).parent.resolve().joinpath('data/celery')

celery_backend_folder = celery_data_path.joinpath('results')
celery_backend_folder.mkdir(exist_ok=True, parents=True)

celery_broker_folders = {
    'data_folder_in': celery_data_path.joinpath('in'),
    'data_folder_out': celery_data_path.joinpath('in'),  # has to be the same as 'data_folder_in'
    'processed_folder': celery_data_path.joinpath('processed')
}

for celery_broker_folder in celery_broker_folders.values():
    celery_broker_folder.mkdir(exist_ok=True)


class CeleryConfig:
    worker_pool='solo'
    ignore_result = False

    broker_url = 'filesystem://'
    broker_transport_options = {k: str(f) for k, f in celery_broker_folders.items()}
    result_backend = 'file://{}'.format(str(celery_backend_folder).replace('\\', '/'))

    result_expires=10
    task_serializer = 'json'
    persist_results = False
    result_serializer = 'json'
    accept_content = ['json']

    broker_connection_retry_on_startup = True
    beat_schedule = {
            'simple_task-10-seconds': {
            'task': 'app.simple_task',
            'schedule': 10.0,
            'args': (16, 16)
        },
    }

celery = Celery()
celery.config_from_object(CeleryConfig)

@celery.task(name='app.simple_task')
def simple_task(x, y):

    file = open('./data/eta-regulator-board-tasks.dat', 'a', encoding='utf-8')
    file.write(f'Result: {x + y}\n')

    return f'Result: {x + y}'

from routers import *
