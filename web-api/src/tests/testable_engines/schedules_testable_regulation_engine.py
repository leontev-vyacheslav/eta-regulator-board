from datetime import datetime

from models.regulator.enums.control_mode_model import ControlModeModel
from models.regulator.heating_circuits_model import HeatingCircuitModel
from models.regulator.schedules_model import ScheduleModel, ScheduleWindowModel, SchedulesModel
from tests.testable_engines.base_settings_testable_regulation_engine import BaseSettingsTestableRegulationEngine


class SchedulesTestableRegulationEngine(BaseSettingsTestableRegulationEngine):

    def _get_settings(self) -> HeatingCircuitModel:
        settings = super()._get_settings()
        settings.control_parameters.control_mode = ControlModeModel.COMFORT
        settings.schedules = SchedulesModel(
            items=[
                ScheduleModel(
                    id='00000000-0000-0000-0000-000000000000',
                    day=2,
                    windows=[
                        ScheduleWindowModel(
                            id='00000000-0000-0000-0000-000000000000',
                            desired_temperature_mode=ControlModeModel.COMFORT,
                            start_time=datetime(
                                year=2000,
                                month=1,
                                day=1,
                                hour=10,
                                minute=0
                            ),
                            end_time=datetime(
                                year=2000,
                                month=1,
                                day=1,
                                hour=13,
                                minute=0
                            )
                        )
                    ]
                )
            ]
        )

        return settings
