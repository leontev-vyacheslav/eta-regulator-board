from models.abstracts.app_base_model import AppBaseModel


class RegulationParametersModel(AppBaseModel):
    proportionality_factor: float

    integration_factor: float

    differentiation_factor: float

    calculation_period: float

    pulse_duration_valve: float

    drive_unit_analog_control: bool

    insensivity_threshold: float

    full_pid_impact_range: float

    proportionality_factor_denominator: float

    integration_factor_denominator: float
