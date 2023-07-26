from app import app
from decopators.validate import validate
from responses.json_response import JsonResponse
from models.test_model import TestModel


@app.get('/tests')
def get_tests():

    return JsonResponse([
        TestModel(id=1, message='Test 1'),
        TestModel(id=2, message='Test 2'),
        TestModel(id=3, message='Test 3')
    ])

@app.get('/tests/<id>')
@validate
def get_test(id: int):

    return JsonResponse(id)