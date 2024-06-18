import os

from flask import send_from_directory
from flask_pydantic import validate

from app import app, APP_NAME, APP_VERSION
from models.common.message_model import MessageModel


@app.route('/favicon.ico', methods=['GET'])
def favicon():

    return send_from_directory(
        os.path.join(app.root_path, 'static'),
        'favicon.ico',
        mimetype='image/vnd.microsoft.icon'
    )


@app.route('/', methods=['GET'])
@app.api_route('/', methods=['GET'])
@validate()
def home():
    return MessageModel(
        message=f'{APP_NAME} {APP_VERSION}'
    )
