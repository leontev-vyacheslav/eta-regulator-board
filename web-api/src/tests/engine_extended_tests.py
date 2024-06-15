from datetime import datetime
import logging
from multiprocessing import Event as ProcessEvent, Lock as ProcessLock
from models.regulator.archive_model import ArchiveModel

from models.regulator.control_parameters_model import ControlParametersModel
from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.enums.heating_circuit_type_model import HeatingCircuitTypeModel
from models.regulator.enums.regulation_engine_mode_model import RegulationEngineLoggingLevelModel
from models.regulator.heating_circuits_model import HeatingCircuitModel
from models.regulator.pid_impact_entry_model import PidImpactEntryModel, PidImpactResultComponentsModel
from models.regulator.regulation_parameters_model import RegulationParametersModel
from models.regulator.regulator_parameters_model import RegulatorParametersModel
from models.regulator.schedules_model import SchedulesModel
from models.regulator.temperature_graph_model import TemperatureGraphItemModel, TemperatureGraphModel
from regulation.engine import RegulationEngine

logger = logging.getLogger(__name__)


class PidImpackTestableRegulationEngine(RegulationEngine):

    def _get_settings(self) -> HeatingCircuitModel:

        return HeatingCircuitModel(
            id='00000000-0000-0000-0000-000000000000',
            name=str(),
            type=HeatingCircuitTypeModel.HEATING,
            regulator_parameters=RegulatorParametersModel(
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
                    drive_unit_analog_control=False
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
        )

    def _get_pid_impact_components(self, entry=PidImpactEntryModel) -> PidImpactResultComponentsModel:

        return super()._get_pid_impact_components(entry)


def get_pid_impact_components_check():
    logger.setLevel(logging.DEBUG)

    hardware_process_lock = ProcessLock()
    process_cancellation_event = ProcessEvent()

    engine = PidImpackTestableRegulationEngine(
        heating_circuit_index=HeatingCircuitIndexModel.FIRST,
        process_cancellation_event=process_cancellation_event,
        hardwares_process_lock=hardware_process_lock,
        logging_level=RegulationEngineLoggingLevelModel.FULL_TRACE
    )

    asserted_archive = ArchiveModel(
        datetime=datetime.now(),
        outdoor_temperature=-2,
        room_temperature=25.0,
        supply_pipe_temperature=45.6,
        return_pipe_temperature=35.4
    )

    asserted_calc_temperatures = engine._get_calculated_temperatures(asserted_archive.outdoor_temperature)
    asserted_heating_circuit_settings: HeatingCircuitModel = engine._get_settings()
    
    asserted_previous_deviation = -5.0
    asserted_previoustotal_deviation = 10

    asserted_deviation = (asserted_calc_temperatures.supply_pipe_temperature - asserted_archive.supply_pipe_temperature) + \
        (asserted_calc_temperatures.return_pipe_temperature - asserted_archive.return_pipe_temperature) * asserted_heating_circuit_settings.regulator_parameters.control_parameters.return_pipe_temperature_influence + \
        (asserted_archive.room_temperature - 20) * asserted_heating_circuit_settings.regulator_parameters.control_parameters.room_temperature_influence

    asserted_proportional_impact = asserted_heating_circuit_settings.regulator_parameters.regulation_parameters.proportionality_factor * \
        asserted_deviation

    asserted_integration_impact = asserted_heating_circuit_settings.regulator_parameters.regulation_parameters.integration_factor * \
        (asserted_previoustotal_deviation + asserted_deviation)

    asserted_differentiation_impact = asserted_heating_circuit_settings.regulator_parameters.regulation_parameters.differentiation_factor * \
        (asserted_previous_deviation - asserted_deviation)

    tested_pid_impact_components = engine._get_pid_impact_components(
        entry=PidImpactEntryModel(
            deviation=asserted_previous_deviation,
            total_deviation=asserted_previoustotal_deviation,
            archive=asserted_archive
        )
    )

    assert asserted_proportional_impact == tested_pid_impact_components.proportional_impact
    assert asserted_integration_impact == tested_pid_impact_components.integration_impact
    assert asserted_differentiation_impact == tested_pid_impact_components.differentiation_impact
