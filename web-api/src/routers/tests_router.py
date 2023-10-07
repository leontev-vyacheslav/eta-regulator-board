from typing import List
from flask import Response
from flask_pydantic import validate

from app import app
from data_access.test_list_repository import TestListRepository
from models.playground.test_list_model import TestListModel
from models.playground.test_model import TestModel
from utils.auth_helper import authorize


@app.api_route('/tests', methods=['GET'])
@validate(response_by_alias=True)
@authorize
def get_test_list() -> List[TestModel]:
    test_list_repository = TestListRepository()
    test_list: TestListModel = test_list_repository.get_list()

    return test_list


@app.api_route('/tests/<test_id>', methods=['GET'])
@validate(response_by_alias=True)
def get_test(test_id: int):
    test_list_repository = TestListRepository()
    current_test = test_list_repository.get(test_id)

    return current_test if current_test is not None else Response(status=204)


@app.api_route('/tests', methods=['POST'])
@validate(response_by_alias=True)
def post_test(body: TestModel) -> TestModel:
    test_list_repository = TestListRepository()
    current_test = test_list_repository.append(body)

    return current_test


@app.api_route('/tests', methods=['PUT'])
@validate(response_by_alias=True)
def put_test(body: TestModel):
    test_list_repository = TestListRepository()
    current_test = test_list_repository.update(body)

    return current_test if current_test is not None else Response(status=204)



@app.api_route('/tests/<test_id>', methods=['DELETE'])
@validate(response_by_alias=True)
@authorize
def delete_test(test_id: int):
    test_list_repository = TestListRepository()
    current_test = test_list_repository.delete(test_id)

    return current_test if current_test is not None else Response(status=204)
