from models.regulator.enums.control_mode_model import ControlModeModel
from models.regulator.heating_circuits_model import HeatingCircuitModel
from tests.testable_engines.base_settings_testable_regulation_engine import BaseSettingsTestableRegulationEngine


class AutoControlModeTestableRegulationEngine(BaseSettingsTestableRegulationEngine):

    def _get_settings(self) -> HeatingCircuitModel:
        settings = super()._get_settings()
        settings.control_parameters.control_mode = ControlModeModel.AUTO

        return settings
