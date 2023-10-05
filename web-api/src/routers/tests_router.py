from datetime import datetime
from flask import Response
from flask_pydantic import validate

from app import app

from data_access.test_list_repository import TestListRepository
from models.playground.test_list_model import TestListModel
from models.playground.test_model import TestModel
from models.regulator.control_model import ControlModel
from models.regulator.control_parameters_model import ControlParametersModel
from models.regulator.enums.regulator_state_model import RegulatorStateModel
from models.regulator.regulator_owner_model import RegulatorOwnerModel
from models.regulator.rtc_datetime_model import RtcDateTimeModel
from models.regulator.service_model import HardwareInfoModel, ServiceModel, SoftwareInfoModel
from models.regulator.settings_model import SettingsModel
from models.regulator.signin_model import SignInModel
from models.regulator.tempetrature_graph_model import TemperatureGraphItemModel, TemperatureGraphModel



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


@app.api_route('/tests/settings', methods=['POST'])
@validate()
def post_settings():

    return SettingsModel(
        regulator_state=RegulatorStateModel.ON,

        mhenoscheme_name='Независимое присоединение системы отопления с управлением двумя насосами и функцией подпитки',

        signin=SignInModel(
            pass_key='1234567890'
        ),

        regulator_owner=RegulatorOwnerModel(
            name='ETA',
            phone_number='(+7)9274484221'
        ),

        control_parameters=ControlParametersModel(
            control=ControlModel(),
            temperature_graph=TemperatureGraphModel(
                items=[
                    TemperatureGraphItemModel(
                        outdoor_temperature=-30.0,
                        supply_pipe_temperature=90.0,
                        return_pipe_temperature=60.0
                    ),
                    TemperatureGraphItemModel(
                        outdoor_temperature=10.0,
                        supply_pipe_temperature=33.5,
                        return_pipe_temperature=29.6
                    )
                ]
            )
        ),

        service=ServiceModel(
            hardware_info=HardwareInfoModel(
                onion_mac_address='40-A3-6B-C9-8F-79'
            ),
            software_info=SoftwareInfoModel(
                web_api_version='v.0.1.20231004-064321',
                web_ui_version='v.0.1.20231004-064113'
            ),
            rtc_datetime=RtcDateTimeModel(
                datetime=datetime.now()
            )
        )
    )
