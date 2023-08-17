import os
import pathlib

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

data_path = os.path.join(pathlib.Path(os.path.dirname(__file__)).__str__(), 'data')

class CeleryConfig:
    timezone = 'UTC'
    enable_utc = True
    worker_pool='solo'
    ignore_result = False

    broker_url = 'sqla+sqlite:///' + os.path.join(data_path, 'eta-regulator-board-tasks-broker.db')
    result_backend = 'db+sqlite:///' +  os.path.join(data_path, 'eta-regulator-board-tasks-backend.db')

    broker_connection_retry_on_startup = True
    beat_schedule = {
            'simple_task-10-seconds': {
            'task': 'app.simple_task',
            'schedule': 10.0,
            'args': (16, 16)
        },
    }
    accept_content = ['json']

celery = Celery()
celery.config_from_object(CeleryConfig)

@celery.task(name='app.simple_task')
def simple_task(x, y):

    file = open('./data/eta-regulator-board-tasks.dat', 'a')
    file.write(f'Result: {x + y} \n')

    return f'Result: {x + y}'

from routers import *
