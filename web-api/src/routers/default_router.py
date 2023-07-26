from app import app
from responses.json_response import JsonResponse


@app.get('/')
def home():

    return JsonResponse({
        'message': 'eta-regulator-board-web-api'
    })
