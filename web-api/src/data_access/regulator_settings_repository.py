from datetime import datetime

from models.common.signin_model import SigninModel
from models.regulator.control_parameters_model import ControlParametersModel
from models.regulator.gpio_set_model import GpioSetModel
from models.regulator.heating_circuits_model import HeatingCircuitModel, HeatingCircuitsModel
from models.regulator.regulation_parameters_model import RegulationParametersModel
from models.regulator.regulator_parameters_model import RegulatorParametersModel
from models.regulator.enums.regulator_state_model import RegulatorStateModel
from models.regulator.regulator_settings_model import RegulatorSettingsModel
from models.regulator.rtc_datetime_model import RtcDateTimeModel
from models.regulator.schedules_model import ScheduleModel, ScheduleWindowModel, SchedulesModel
from models.regulator.service_model import HardwareInfoModel, RegulatorOwnerModel, ServiceModel, SoftwareInfoModel
from models.regulator.temperature_graph_model import TemperatureGraphItemModel, TemperatureGraphModel


class RegulatorSettingsRepository():

    def __init__(self, app=None, **kwargs):
        self._options = kwargs

        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        self.data_path = app.app_root_path.joinpath('data/regulator_settings.json')
        try:
            with open(self.data_path, 'r', encoding='utf-8') as file:
                json = file.read()
                self.settings: RegulatorSettingsModel = RegulatorSettingsModel.parse_raw(json)
        except FileNotFoundError:
            self.settings = self._get_default_settings()
            self._dump()

        app.extensions['regulator_settings_repository'] = self

    def _get_default_settings(self):

        return RegulatorSettingsModel(
            regulator_state=RegulatorStateModel.ON,

            signin=SigninModel(
                password='1234567890'
            ),
            heating_circuits=HeatingCircuitsModel(
                items=[
                    HeatingCircuitModel(
                        name='Отопительный контур 1',
                        regulator_parameters=RegulatorParametersModel(
                            control_parameters=ControlParametersModel(),
                            temperature_graph=TemperatureGraphModel(
                                items=[
                                    TemperatureGraphItemModel(
                                        id='1a0ec2da-5949-422d-8b20-e412178ec947',
                                        outdoor_temperature=-30.0,
                                        supply_pipe_temperature=90.0,
                                        return_pipe_temperature=60.0
                                    ),
                                    TemperatureGraphItemModel(
                                        id='edd75bb3-e0e1-4277-871a-67657bba70a0',
                                        outdoor_temperature=10.0,
                                        supply_pipe_temperature=33.5,
                                        return_pipe_temperature=29.6
                                    )
                                ]
                            ),
                            regulation_parameters=RegulationParametersModel(),


                            schedules=SchedulesModel(items=[
                                ScheduleModel(
                                    id='5895f8bf-9fb4-468b-bdac-cbf2010a72f0',
                                    day=1,
                                    windows=[
                                        ScheduleWindowModel(
                                            id='71d1c170-7d37-464f-98bd-ab793a1242b4',
                                            start_time=datetime(year=1900, month=1, day=1, hour=7, minute=30, second=0),
                                            end_time=datetime(year=1900, month=1, day=1, hour=12, minute=30, second=0),
                                            desired_temperature_mode=2
                                        ),
                                        ScheduleWindowModel(
                                            id='461e5aa1-5fda-44a7-9fca-d3c77de4da22',
                                            start_time=datetime(year=1900, month=1, day=1,
                                                                hour=12, minute=30, second=0),
                                            end_time=datetime(year=1900, month=1, day=1, hour=17, minute=30, second=0),
                                            desired_temperature_mode=2
                                        ),
                                    ]),
                                ScheduleModel(
                                    id='cb5595dc-fd0f-4245-acd5-eef83874c09d',
                                    day=2,
                                    windows=[
                                        ScheduleWindowModel(
                                            id='2687d2b1-7de3-4eac-a43a-75347708c912',
                                            start_time=datetime(year=1900, month=1, day=1, hour=7, minute=30, second=0),
                                            end_time=datetime(year=1900, month=1, day=1, hour=12, minute=30, second=0),
                                            desired_temperature_mode=2
                                        ),
                                        ScheduleWindowModel(
                                            id='1dc9e361-8565-4966-b1d3-f02d80b78d79',
                                            start_time=datetime(year=1900, month=1, day=1,
                                                                hour=12, minute=30, second=0),
                                            end_time=datetime(year=1900, month=1, day=1, hour=17, minute=30, second=0),
                                            desired_temperature_mode=2
                                        ),
                                    ])
                            ]),
                        ),
                    )
                ]
            ),

            service=ServiceModel(
                regulator_owner=RegulatorOwnerModel(
                    name='ETA',
                    phone_number='(+7)9274484221'
                ),
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
            ),
            gpio_set=GpioSetModel(items=[])
        )

    def _dump(self) -> bool:
        with open(self.data_path, 'w', encoding='utf-8') as file:
            json = self.settings.json(by_alias=True, indent=4)
            dumped_bytes = file.write(json)

        return len(json) == dumped_bytes

    def update(self, current_settings):
        self.settings = current_settings

        self._dump()
