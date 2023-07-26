import os

from flask import Flask, request, send_from_directory
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


@app.route('/favicon.ico', methods=['GET'])
def favicon():

    return send_from_directory(
        os.path.join(app.root_path, 'static'),
        'favicon.ico',
        mimetype='image/vnd.microsoft.icon'
    )

@app.route('/shutdown', methods=['POST'])
def shutdown():

    if request.form['security_pass'] == 'onioneer':
        os.kill(os.getpid(), 9)

        return 'Shutting down...'
    else:

        return 'Shut down was rejected...'


from routers import *