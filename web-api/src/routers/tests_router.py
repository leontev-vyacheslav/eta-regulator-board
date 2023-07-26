from flask import Response
from flask_pydantic import validate
from app import app
from models.test_list_model import TestListModel
from models.test_model import TestModel

@app.route('/tests', methods=['GET'])
@validate()
def get_tests():

    return TestListModel(items=[
        TestModel(id=1, message='Test 1'),
        TestModel(id=2, message='Test 2'),
    ])


@app.route('/tests/<test_id>', methods=['GET'])
@validate()
def get_test(test_id: int):
    test_list = TestListModel(items=[
        TestModel(id=1, message='Test 1'),
        TestModel(id=2, message='Test 2'),
    ])

    test = next((test for test in test_list.items if test.id == test_id), None)

    if test is not None:
        return test
    else:
        return Response(
            'Item not found',
            status=500
        )
