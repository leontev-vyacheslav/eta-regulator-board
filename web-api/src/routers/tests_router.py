from flask import Response
from flask_pydantic import validate

from app import app
from models.message_response_model import MessageResponseModel
from models.test_list_response_model import TestListResponseModel
from models.test_response_model import TestResponseModel


test_list = [
    TestResponseModel(id=1, message='Test 1'),
    TestResponseModel(id=2, message='Test 2'),
]

@app.api_route('/tests/list', methods=['GET'])
@validate()
def get_tests():

    return TestListResponseModel(items=test_list, status=200)


@app.api_route('/tests/<test_id>', methods=['GET'])
@validate()
def get_test(test_id: int):

    test = next((test for test in test_list.items if test.id == test_id), None)

    if test is not None:
        return test
    else:
        return Response(
            MessageResponseModel(
                message='Item not found'
            ),
            status=500
        )
