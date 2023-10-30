from models.abstracts.app_base_model import AppBaseModel


class RegulationParametersModel(AppBaseModel):
    proportionality_factor: float = 40

    integration_factor: float = 3

    differentiation_factor: float = 2

    calculation_period: float = 10

    pulse_duration_valve: float = 0

    drive_unit_analog_control: bool = False
