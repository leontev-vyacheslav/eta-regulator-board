from flask_pydantic import validate
from app import app, APP_VERSION
from models.message_model import MessageModel


@app.route('/', methods=['GET'])
@app.api_route('/', methods=['GET'])
@validate()
def home():

    return MessageModel(
        message=f'Eta Regulator Board Web API {APP_VERSION}'
    )
