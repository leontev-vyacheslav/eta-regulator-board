from flask_pydantic import validate

from app import app
from models.message_response_model import MessageResponseModel


@app.route('/', methods=['GET'])
@app.api_route('/', methods=['GET'])
@validate()
def home():

    return MessageResponseModel(
        message='Eta Regulator Board Web API v.0.2.20230802-072525'
    )
