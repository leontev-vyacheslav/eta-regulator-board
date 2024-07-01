from regulation.engine import RegulationEngine
from models.regulator.control_parameters_model import ControlParametersModel
from models.regulator.enums.heating_circuit_type_model import HeatingCircuitTypeModel
from models.regulator.heating_circuits_model import HeatingCircuitModel
from models.regulator.regulation_parameters_model import RegulationParametersModel
from models.regulator.schedules_model import SchedulesModel
from models.regulator.temperature_graph_model import TemperatureGraphItemModel, TemperatureGraphModel

base_testable_settings = HeatingCircuitModel(
    id='00000000-0000-0000-0000-000000000000',
    name=str(),
    type=HeatingCircuitTypeModel.HEATING,
    control_parameters=ControlParametersModel(
        control_mode=2,
        manual_control_mode=2,
        outdoor_temperature_sensor_failure_action=4,
        supply_pipe_temperature_sensor_failure_action=2,
        manual_control_mode_temperature_setpoint=60.0,
        analog_valve_error_setpoint=50.0,
        summer_mode_transition_temperature=10.0,
        comfort_temperature=20.0,
        economical_temperature=18.0,
        frost_protection_temperature=5.0,
        room_temperature_influence=10.0,
        return_pipe_temperature_influence=0.0,
        supply_pipe_min_temperature=30.0,
        supply_pipe_max_temperature=90.0,
        control_circulation_pump=False
    ),
    regulation_parameters=RegulationParametersModel(
        proportionality_factor=70.0,
        integration_factor=30.0,
        differentiation_factor=30.0,
        calculation_period=25.0,
        pulse_duration_valve=5.0,
        drive_unit_analog_control=False,

        full_pid_impact_range=1000,
        insensivity_threshold=1,
        proportionality_factor_denominator=5,
        integration_factor_denominator=50
    ),
    temperature_graph=TemperatureGraphModel(
        items=[
            TemperatureGraphItemModel(
                id='00000000-0000-0000-0000-000000000000',
                outdoor_temperature=-2,
                supply_pipe_temperature=50.6,
                return_pipe_temperature=40.4
            )
        ]
    ),
    schedules=SchedulesModel(
        items=[]
    )
)


class BaseSettingsTestableRegulationEngine(RegulationEngine):

    def _get_settings(self) -> HeatingCircuitModel:

        return base_testable_settings
