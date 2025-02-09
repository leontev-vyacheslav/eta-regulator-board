import logging
from datetime import datetime
from enum import IntEnum
from multiprocessing import Event as ProcessEvent, Lock as ProcessLock
from time import time
from typing import Optional

from loggers.engine_logger_builder import build as build_logger
from models.regulator.archive_model import ArchiveModel
from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.enums.regulation_engine_mode_model import RegulationEngineLoggingLevelModel
from models.regulator.pid_impact_entry_model import PidImpactEntryModel, PidImpactResultComponentsModel
from models.regulator.temperature_graph_model import TemperatureGraphItemModel
from regulation.engine import RegulationEngine


class EmuSupplyPipeTempStepVariationRegulationEngine(RegulationEngine):
    """
        supply pipe temperature step variation (55.6)(50.6)(55.6)
    """
    known_outdoor_temperature = -2
    temperature_step = 5

    pid_impact_parts_critical_msg = 'P=%.2f, I=%.2f, D=%.2f, DEV=%.2f, TOTAL=%.2f (OUT=%.2f, ROOM=%.2f, SUPL=%.2f, RET=%.2f)'

    class State(IntEnum):
        LOW = 1
        HIGH = 2

    def __init__(self, heating_circuit_index: HeatingCircuitIndexModel, process_cancellation_event: ProcessEvent, hardwares_process_lock: ProcessLock, logging_level: RegulationEngineLoggingLevelModel, step_duration: float) -> None:
        super().__init__(heating_circuit_index, process_cancellation_event, hardwares_process_lock, logging_level)

        self.step_duration = step_duration
        self.__state: EmuSupplyPipeTempStepVariationRegulationEngine.State = EmuSupplyPipeTempStepVariationRegulationEngine.State.HIGH
        self.__change_state_time: Optional[float] = None

        self.__temperature_graph_item: TemperatureGraphItemModel = self._get_calculated_temperatures(
            outdoor_temperature=EmuSupplyPipeTempStepVariationRegulationEngine.known_outdoor_temperature
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
            self.__state = EmuSupplyPipeTempStepVariationRegulationEngine.State.HIGH if self.__state == EmuSupplyPipeTempStepVariationRegulationEngine.State.LOW else EmuSupplyPipeTempStepVariationRegulationEngine.State.LOW
            self.__change_state_time = time()

        outdoor_temperature_measured = EmuSupplyPipeTempStepVariationRegulationEngine.known_outdoor_temperature
        room_temperature_measured = RegulationEngine.default_room_temperature

        supply_pipe_temperature_measured = self.__temperature_graph_item.supply_pipe_temperature + \
            EmuSupplyPipeTempStepVariationRegulationEngine.temperature_step if self.__state == EmuSupplyPipeTempStepVariationRegulationEngine.State.HIGH else self.__temperature_graph_item.supply_pipe_temperature
        return_pipe_temperature_measured = self.__temperature_graph_item.return_pipe_temperature

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
            EmuSupplyPipeTempStepVariationRegulationEngine.pid_impact_parts_critical_msg,
            pid_impact_components.proportional_impact,
            pid_impact_components.integration_impact,
            pid_impact_components.differentiation_impact,
            pid_impact_components.deviation,
            pid_impact_components.total_deviation,

            entry.archive.outdoor_temperature,
            entry.archive.room_temperature,
            entry.archive.supply_pipe_temperature,
            entry.archive.return_pipe_temperature,
        )

        return pid_impact_components
