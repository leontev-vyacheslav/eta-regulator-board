from flask_pydantic import validate
from app import app
from models.message_model import MessageModel


@app.route('/', methods=['GET'])
@app.api_route('/', methods=['GET'])
@validate()
def home():

    return MessageModel(
        message='Eta Regulator Board Web API v.0.1.20230819-073217'
    )
