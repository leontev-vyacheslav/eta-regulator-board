from datetime import datetime
from typing import Optional

from flask_ex import FlaskEx
from models.common.signin_model import SigninModel
from models.regulator.control_model import ControlModel
from models.regulator.control_parameters_model import ControlParametersModel
from models.regulator.enums.regulator_state_model import RegulatorStateModel
from models.regulator.regulator_owner_model import RegulatorOwnerModel
from models.regulator.rtc_datetime_model import RtcDateTimeModel
from models.regulator.service_model import HardwareInfoModel, ServiceModel, SoftwareInfoModel
from models.regulator.settings_model import SettingsModel
from models.regulator.tempetrature_graph_model import TemperatureGraphItemModel, TemperatureGraphModel


class RegulatorSettingsRepository():

    def __init__(self, app: Optional[FlaskEx] = None, **kwargs):
        self._options = kwargs

        if app is not None:
            self.init_app(app)

    def init_app(self, app: FlaskEx):
        self.data_path = app.app_root_path.joinpath('data/regulator_settings.json')
        try:
            with open(self.data_path, 'r', encoding='utf-8') as file:
                json = file.read()
                self.settings: SettingsModel = SettingsModel.parse_raw(json)
        except FileNotFoundError:
            self.settings = self._get_default_settings()
            self._dump()

        app.extensions['regulator_settings_repository'] = self

    def _get_default_settings(self):

        return SettingsModel(
            regulator_state=RegulatorStateModel.ON,

            mhenoscheme_name='Независимое присоединение системы отопления с управлением двумя насосами и функцией подпитки',

            signin=SigninModel(
                password='1234567890'
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

    def _dump(self) -> bool:
        with open(self.data_path, 'w', encoding='utf-8') as file:
            json = self.settings.json(by_alias=True, indent=4)
            dumped_bytes = file.write(json)

        return len(json) == dumped_bytes

    def update(self, settings):
        self.settings = settings
        self._dump()
