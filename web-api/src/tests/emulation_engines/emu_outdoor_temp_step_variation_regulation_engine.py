from datetime import datetime
from enum import IntEnum
import logging
from time import time
from multiprocessing import Event as ProcessEvent, Lock as ProcessLock
from typing import Optional

from loggers.engine_logger_builder import build as build_logger
from models.regulator.archive_model import ArchiveModel
from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.pid_impact_entry_model import PidImpactEntryModel, PidImpactResultComponentsModel
from models.regulator.temperature_graph_model import TemperatureGraphItemModel
from regulation.engine import RegulationEngine


class EmuOutdoorTempStepVariationRegulationEngine(RegulationEngine):
    """
        outdoor temperature step variation  (-10)(-13)(-10)
    """
    known_outdoor_temperature = -10
    temperature_step = -3

    pid_impact_parts_critical_msg = 'PROPORTIONAL=%.2f, INTEGRAL=%.2f, DIFFERENTIAL=%.2f, DEVIATION=%.2f, TOTAL_DEVIATION=%.2f'

    class State(IntEnum):
        LOW = 1
        HIGH = 2

    def __init__(self, heating_circuit_index: HeatingCircuitIndexModel, process_cancellation_event: ProcessEvent, hardwares_process_lock: ProcessLock, logging_level: int, step_duration: float) -> None:
        super().__init__(heating_circuit_index, process_cancellation_event, hardwares_process_lock, logging_level)

        self.step_duration = step_duration
        self.__state: EmuOutdoorTempStepVariationRegulationEngine.State = EmuOutdoorTempStepVariationRegulationEngine.State.HIGH
        self.__change_state_time: Optional[float] = None

        self.__temperature_graph_item: TemperatureGraphItemModel = self._get_calculated_temperatures(
            outdoor_temperature=EmuOutdoorTempStepVariationRegulationEngine.known_outdoor_temperature
        )

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

        if time() - self.__change_state_time > self.step_duration:
            self.__state = EmuOutdoorTempStepVariationRegulationEngine.State.HIGH if self.__state == EmuOutdoorTempStepVariationRegulationEngine.State.LOW else EmuOutdoorTempStepVariationRegulationEngine.State.LOW
            self.__change_state_time = time()

        room_temperature_measured = RegulationEngine.default_room_temperature
        outdoor_temperature_measured = self.__temperature_graph_item.outdoor_temperature \
            if self.__state == EmuOutdoorTempStepVariationRegulationEngine.State.HIGH \
            else self.__temperature_graph_item.outdoor_temperature + EmuOutdoorTempStepVariationRegulationEngine.temperature_step

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

    def _get_pid_impact_components(self, entry: PidImpactEntryModel) -> PidImpactResultComponentsModel:
        pid_impact_components = super()._get_pid_impact_components(entry)

        self._logger.emul(
            EmuOutdoorTempStepVariationRegulationEngine.pid_impact_parts_critical_msg,
            pid_impact_components.proportional_impact,
            pid_impact_components.integration_impact,
            pid_impact_components.differentiation_impact,
            pid_impact_components.deviation,
            pid_impact_components.total_deviation
        )

        return pid_impact_components
