from flask_pydantic import validate

from app import app
from workers import environment_state

@app.api_route('/environment', methods=['GET'])
@validate()
def get_environment_state():

    return environment_state
