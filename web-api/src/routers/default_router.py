from flask_pydantic import validate
from app import app
from models.simple_message_model import SimpleMessageModel


@app.get('/')
@validate()
def home():

    return SimpleMessageModel(
        message='Eta Regulator Board Web API v. 0.1'
    )

