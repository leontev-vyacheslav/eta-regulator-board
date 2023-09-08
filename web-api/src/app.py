import os

from flask import send_from_directory
from flask_cors import CORS
from flask_pydantic import validate
from flask_ex import FlaskEx

from models.shutdown_request_model import ShutdownRequestModel
from workers.worker_starter_extension import WorkerStarter

APP_VERSION = 'v.0.1.20230908-073525'

app = FlaskEx(__name__)
CORS(
    app,
    allow_headers=['*'],
    methods=['GET', 'POST', 'PUT', 'DELETE'],
    origins=['*']
)
WorkerStarter(app)


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


from routers import *
