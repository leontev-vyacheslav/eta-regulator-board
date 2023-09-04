import os
from threading import Thread, get_ident
from time import sleep

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_pydantic import validate


from decorators.app_router_prefix import app_route_prefix
from models.shutdown_request_model import ShutdownRequestModel

APP_VERSION = 'v.0.1.20230904-060219'

app = Flask(__name__)
CORS(
    app,
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

    return 'Shut down was rejected...'


def background_task(interval_sec, message):

    while True:
        sleep(interval_sec)
        print(f'{message} {get_ident()}')


thread = Thread(
    target=background_task,
    args=(10, 'Task1 thread'),
    daemon=True
)

thread.start()


from routers import *
