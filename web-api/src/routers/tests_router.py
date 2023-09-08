from typing import Optional
from flask import Response
from flask_pydantic import validate

from app import app

from data_access.test_list_repository import TestListRepository
from models.test_list_model import TestListModel
from models.test_model import TestModel


@app.api_route('/tests', methods=['GET'])
@validate()
def get_list():
    test_list_repository = TestListRepository()
    test_list: TestListModel = test_list_repository.get_list()

    return test_list


@app.api_route('/tests/<test_id>', methods=['GET'])
@validate()
def get(test_id: int):
    test_list_repository = TestListRepository()
    current_test = test_list_repository.get(test_id)

    return current_test if current_test is not None else Response(status=204)


@app.api_route('/tests', methods=['POST'])
@validate()
def post(body: TestModel) -> TestModel:
    test_list_repository = TestListRepository()
    current_test = test_list_repository.append(body)

    return current_test


@app.api_route('/tests', methods=['PUT'])
@validate()
def put(body: TestModel):
    test_list_repository = TestListRepository()
    current_test = test_list_repository.update(body)

    return current_test if current_test is not None else Response(status=204)


@app.api_route('/tests/<test_id>', methods=['DELETE'])
@validate()
def delete(test_id: int):
    test_list_repository = TestListRepository()
    current_test = test_list_repository.delete(test_id)

    return current_test if current_test is not None else Response(status=204)
