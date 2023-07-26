import os

from flask import Flask, send_from_directory
from flask_cors import CORS
from decorators.app_route_prefix import app_route_prefix

app = Flask(__name__)
CORS(app)

app.api_route = app_route_prefix(app.route, '/api')

@app.route('/favicon.ico', methods=['GET'])
def favicon():
    return send_from_directory(
        os.path.join(app.root_path, 'static'),
        'favicon.ico',
        mimetype='image/vnd.microsoft.icon'
    )

@app.route('/shutdown', methods=['POST'])
def shutdown(security_pass: str):
    if security_pass == 'onioneer':
        os.kill(os.getpid(), 9)

        return 'Shutting down...'
    else:

        return 'Shut down was rejected...'


from routers import *