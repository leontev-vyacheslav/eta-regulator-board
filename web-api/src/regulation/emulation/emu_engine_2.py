from datetime import datetime
from enum import IntEnum
import logging
from time import time
from multiprocessing import Event as ProcessEvent, Lock as ProcessLock
from typing import Optional

from loggers.engine_logger_builder import build as build_logger
from models.regulator.archive_model import ArchiveModel
from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.enums.heating_circuit_type_model import HeatingCircuitTypeModel
from models.regulator.enums.regulation_engine_mode_model import RegulationEngineLoggingLevelModel
from models.regulator.pid_impact_entry_model import PidImpactEntryModel, PidImpactResultComponentsModel
from regulation.engine import RegulationEngine
from regulation.metadata.decorators import regulator_starter_metadata


class EmuRegulationEngine(RegulationEngine):
    """
        outdoor temperature step variation  (-10)(-13)(-10)
    """

    known_outdoor_temperature = -10
    temperature_step = -3
    emul_step_duration = 60

    pid_impact_parts_critical_msg = 'PROPORTIONAL=%.2f, INTEGRAL=%.2f, DIFFERENTIAL=%.2f, DEVIATION=%.2f, TOTAL_DEVIATION=%.2f'

    class State(IntEnum):
        Low = 1
        High = 2

    def __init__(self, heating_circuit_index: HeatingCircuitIndexModel, process_cancellation_event: ProcessEvent, hardwares_process_lock: ProcessLock, logging_level: RegulationEngineLoggingLevelModel) -> None:
        super().__init__(heating_circuit_index, process_cancellation_event, hardwares_process_lock, logging_level)

        self.__state: EmuRegulationEngine.State = EmuRegulationEngine.State.High
        self.__change_state_time: Optional[float] = None

        self.__temperature_graph_item = next((
            tg_item for tg_item in self._heating_circuit_settings.regulator_parameters.temperature_graph.items
            if tg_item.outdoor_temperature == EmuRegulationEngine.known_outdoor_temperature
        ), None)

        self._emul_logger_level = logging.CRITICAL + 10
        logging.addLevelName(self._emul_logger_level, "EMUL")

        self._logger = build_logger(
            name=f'emu_regulation_engine_logger',
            heating_circuit_index=heating_circuit_index,
            heating_circuit_type=self._heating_circuit_settings.type,
            default_level=self._emul_logger_level,
            # default_handler=EmuRegulationEngineLoggerHandler(sys.stdout)
        )

        self._logger.emul = self.__emul_log

    def __emul_log(self, msg, *args, **kwargs):
        if self._logger.isEnabledFor(self._emul_logger_level):
            self._logger._log(self._emul_logger_level, msg, args, **kwargs)

    def _get_archive(self) -> ArchiveModel:
        if self.__change_state_time is None:
            self.__change_state_time = time()

        if time() - self.__change_state_time > EmuRegulationEngine.emul_step_duration:
            self.__state = EmuRegulationEngine.State.High if self.__state == EmuRegulationEngine.State.Low else EmuRegulationEngine.State.Low
            self.__change_state_time = time()

        room_temperature_measured = RegulationEngine.default_room_temperature
        outdoor_temperature_measured = self.__temperature_graph_item.outdoor_temperature \
            if self.__state == EmuRegulationEngine.State.High \
            else self.__temperature_graph_item.outdoor_temperature + EmuRegulationEngine.temperature_step

        supply_pipe_temperature_measured = self.__temperature_graph_item.supply_pipe_temperature
        return_pipe_temperature_measured = self.__temperature_graph_item.return_pipe_temperature

        self._logger.emul(
            RegulationEngine.measured_temperatures_debug_msg,
            outdoor_temperature_measured,
            room_temperature_measured,
            supply_pipe_temperature_measured,
            return_pipe_temperature_measured
        )

        return ArchiveModel(
            datetime=datetime.now(),
            outdoor_temperature=outdoor_temperature_measured,
            room_temperature=room_temperature_measured,
            supply_pipe_temperature=supply_pipe_temperature_measured,
            return_pipe_temperature=return_pipe_temperature_measured
        )

    def _get_pid_imact_components(self, entry: PidImpactEntryModel) -> PidImpactResultComponentsModel:
        pid_imact_components = super()._get_pid_imact_components(entry)

        self._logger.emul(
            EmuRegulationEngine.pid_impact_parts_critical_msg,
            pid_imact_components.proportional_impact,
            pid_imact_components.integration_impact,
            pid_imact_components.differentiation_impact,
            pid_imact_components.deviation,
            pid_imact_components.total_deviation
        )

        return pid_imact_components

@regulator_starter_metadata(
    heating_circuit_types=[
        HeatingCircuitTypeModel.HEATING
    ]
)
def regulation_engine_starter(heating_circuit_index: HeatingCircuitIndexModel, process_cancellation_event: ProcessEvent, hardware_process_lock: ProcessLock):
    engine = EmuRegulationEngine(
        heating_circuit_index=heating_circuit_index,
        process_cancellation_event=process_cancellation_event,
        hardwares_process_lock=hardware_process_lock,
        logging_level=RegulationEngineLoggingLevelModel.FULL_TRACE
    )

    engine.start()
