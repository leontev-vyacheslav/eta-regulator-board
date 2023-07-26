from app import app
from decorators.validate import validate 
from responses.json_response import JsonResponse
from models.test_model import TestModel

tests = [
    TestModel(id=1, message='Test 1'),
    TestModel(id=2, message='Test 2'),
    TestModel(id=3, message='Test 3')
]

@app.api_route('/tests', methods=['GET'])
def get_tests():

    return JsonResponse(tests)

@app.api_route('/tests/<int:id>', methods=['GET'])
@validate
def get_test(id: int):

    test = next((test for test in tests if test.id == id), None)

    return JsonResponse(test)