import os
import pathlib
from typing import Optional

from flask import Response
from flask_pydantic import validate

from app import app
from models.message_response_model import MessageModel
from models.test_list_response_model import TestListModel
from models.test_response_model import TestModel


def get_test_list() -> TestListModel:
    current_path = pathlib.Path(os.path.dirname(__file__)).parent
    data_path = os.path.join(current_path.__str__(), 'data/tests.json')

    with open(data_path, 'r') as tests_file:
        json = tests_file.read()
        test_list: TestListModel = TestListModel.model_validate_json(json)

    return test_list

def update_test_list(test: TestModel) -> None:
    current_path = pathlib.Path(os.path.dirname(__file__)).parent
    data_path = os.path.join(current_path.__str__(), 'data/tests.json')

    test_list = get_test_list();
    test_list.items.append(test)

    with open(data_path, 'w') as tests_file:
        json = test_list.model_dump_json();
        tests_file.write(json)


@app.api_route('/tests/list', methods=['GET'])
@validate()
def get_tests():
    test_list = get_test_list()

    return test_list


@app.api_route('/tests/<test_id>', methods=['GET'])
@validate()
def get_test(test_id: int):
    test_list: TestListModel = get_test_list()
    test: Optional[TestModel] = next((test for test in test_list.items if test.id == test_id), None)

    if test is not None:
        return test
    else:
        return Response(
            MessageModel(
                message='Item not found'
            ),
            status=500
        )


@app.api_route('/tests/post', methods=['POST'])
@validate()
def post_test(body: TestModel) -> TestModel:
    test = body

    test_list: TestListModel = get_test_list()
    test_next_id = max((test.id for test in test_list.items)) + 1
    test.id = test_next_id

    update_test_list(test)

    return test