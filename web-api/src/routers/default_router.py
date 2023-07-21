from app import app


@app.get('/')
def home():

    return {
        'data': {
                'message': 'eta-regulator-board-web-api'
        }
    }
