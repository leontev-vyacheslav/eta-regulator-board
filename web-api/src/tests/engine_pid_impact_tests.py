from datetime import datetime
import logging
from multiprocessing import Event as ProcessEvent, Lock as ProcessLock
from models.regulator.archive_model import ArchiveModel

from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.enums.regulation_engine_mode_model import RegulationEngineLoggingLevelModel
from models.regulator.heating_circuits_model import HeatingCircuitModel
from models.regulator.pid_impact_entry_model import PidImpactEntryModel
from tests.testable_engines.base_settings_testable_regulation_engine import BaseSettingsTestableRegulationEngine

logger = logging.getLogger(__name__)


def get_pid_impact_components_check():

    hardware_process_lock = ProcessLock()
    process_cancellation_event = ProcessEvent()

    engine = BaseSettingsTestableRegulationEngine(
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
        (asserted_calc_temperatures.return_pipe_temperature - asserted_archive.return_pipe_temperature) * asserted_heating_circuit_settings.control_parameters.return_pipe_temperature_influence + \
        (asserted_archive.room_temperature - 20) * asserted_heating_circuit_settings.control_parameters.room_temperature_influence

    asserted_proportional_impact = asserted_heating_circuit_settings.regulation_parameters.proportionality_factor * \
        asserted_deviation

    asserted_integration_impact = asserted_heating_circuit_settings.regulation_parameters.integration_factor * \
        (asserted_previoustotal_deviation + asserted_deviation)

    asserted_differentiation_impact = asserted_heating_circuit_settings.regulation_parameters.differentiation_factor * \
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


