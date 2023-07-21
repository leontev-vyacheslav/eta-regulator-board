import os

from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

from routers import *

@app.route('/shutdown', methods=['POST'])
def shutdown(security_pass: str):
    if security_pass == 'onioneer':
        os.kill(os.getpid(), 9)
        return 'Shutting down...'
    else:
        return 'Shut down was rejected...'