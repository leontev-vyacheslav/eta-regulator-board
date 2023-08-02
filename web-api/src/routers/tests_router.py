from flask import Response
from flask_pydantic import validate

from app import app
from models.message_response_model import MessageResponseModel
from models.test_list_response_model import TestListResponseModel
from models.test_response_model import TestResponseModel

test_list = [
    TestResponseModel(id=1, message='Test 1'),
    TestResponseModel(id=2, message='Test 2'),
    TestResponseModel(id=3, message='Test 3'),
    TestResponseModel(id=4, message='Test 4'),
    TestResponseModel(id=5, message='Test 5'),
    TestResponseModel(id=6, message='Test 6'),
    TestResponseModel(id=7, message='Test 7'),
]

@app.api_route('/tests/list', methods=['GET'])
@validate()
def get_tests():

    return TestListResponseModel(items=test_list)


@app.api_route('/tests/<test_id>', methods=['GET'])
@validate()
def get_test(test_id: int):

    test = next((test for test in test_list if test.id == test_id), None)

    if test is not None:
        return test
    else:
        return Response(
            MessageResponseModel(
                message='Item not found'
            ),
            status=500
        )
