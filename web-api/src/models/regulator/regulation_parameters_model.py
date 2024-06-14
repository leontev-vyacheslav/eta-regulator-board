from models.abstracts.app_base_model import AppBaseModel


class RegulationParametersModel(AppBaseModel):
    proportionality_factor: float = 70.0

    integration_factor: float = 30.0

    differentiation_factor: float = 30.0

    calculation_period: float = 25.0

    pulse_duration_valve: float = 5.0

    drive_unit_analog_control: bool = False
