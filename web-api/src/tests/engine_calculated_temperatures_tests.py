import pytest
import logging
import bisect

from multiprocessing import Event as ProcessEvent, Lock as ProcessLock

from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.enums.heating_circuit_type_model import HeatingCircuitTypeModel
from models.regulator.enums.regulation_engine_mode_model import RegulationEngineLoggingLevelModel
from models.regulator.heating_circuits_model import HeatingCircuitModel
from models.regulator.temperature_graph_model import TemperatureGraphItemModel
from regulation.engine import RegulationEngine


logger = logging.getLogger(__name__)


@pytest.fixture(scope='module')
def get_regulation_engine() -> RegulationEngine:
    logger.setLevel(logging.DEBUG)

    hardware_process_lock = ProcessLock()
    process_cancellation_event = ProcessEvent()
    return RegulationEngine(
        heating_circuit_index=HeatingCircuitIndexModel.FIRST,
        process_cancellation_event=process_cancellation_event,
        hardwares_process_lock=hardware_process_lock,
        logging_level=RegulationEngineLoggingLevelModel.FULL_TRACE
    )


def get_calculated_temperatures_precise_match_check(get_regulation_engine: RegulationEngine):
    engine = get_regulation_engine
    heating_circuit: HeatingCircuitModel = engine._get_settings()

    assert heating_circuit.type == HeatingCircuitTypeModel.HEATING

    for temperature_graph_item in heating_circuit.regulator_parameters.temperature_graph.items:
        calc_temperature_graph_item: TemperatureGraphItemModel = engine._get_calculated_temperatures(
            outdoor_temperature=temperature_graph_item.outdoor_temperature
        )

        assert calc_temperature_graph_item.supply_pipe_temperature == temperature_graph_item.supply_pipe_temperature
        assert calc_temperature_graph_item.return_pipe_temperature == temperature_graph_item.return_pipe_temperature

        logger.debug(
            'CALC_SUPPLY=%.2f, CALC_RETURN=%.2f, SUPPLY=%.2f, RETURN=%.2f, OUTDOOR=%.2f',
            calc_temperature_graph_item.supply_pipe_temperature,
            calc_temperature_graph_item.return_pipe_temperature,

            temperature_graph_item.supply_pipe_temperature,
            temperature_graph_item.return_pipe_temperature,

            temperature_graph_item.outdoor_temperature
        )


@pytest.mark.parametrize("temp", [10.0, 0.0, -12.0, 5.0, -33.0])
def get_calculated_temperatures_interpolation_check(get_regulation_engine: RegulationEngine, temp: float):
    def find_y_point(xa, xb, ya, yb, xc):
        m = (ya - yb) / (xa - xb)
        return (xc - xb) * m + yb

    engine = get_regulation_engine
    heating_circuit_settings: HeatingCircuitModel = engine._get_settings()

    assert heating_circuit_settings.type == HeatingCircuitTypeModel.HEATING

    temperature_graph = sorted(
        heating_circuit_settings.regulator_parameters.temperature_graph.items,
        key=lambda i: i.outdoor_temperature
    )

    outdoor_temperatures = sorted([
        item.outdoor_temperature
        for item in temperature_graph
    ])

    calc_temperature_graph_item: TemperatureGraphItemModel = engine._get_calculated_temperatures(
        outdoor_temperature=temp
    )

    pos = bisect.bisect_left(outdoor_temperatures, temp)

    assert pos > 0 and pos <= len(temperature_graph)

    calc_supply_pipe_temperature = find_y_point(
        temperature_graph[pos - 1].outdoor_temperature,
        temperature_graph[pos].outdoor_temperature,
        temperature_graph[pos - 1].supply_pipe_temperature,
        temperature_graph[pos].supply_pipe_temperature,
        temp
    )

    calc_return_pipe_temperature = find_y_point(
        temperature_graph[pos - 1].outdoor_temperature,
        temperature_graph[pos].outdoor_temperature,
        temperature_graph[pos - 1].return_pipe_temperature,
        temperature_graph[pos].return_pipe_temperature,
        temp
    )

    assert calc_temperature_graph_item.supply_pipe_temperature == pytest.approx(calc_supply_pipe_temperature, 0.001)
    assert calc_temperature_graph_item.return_pipe_temperature == pytest.approx(calc_return_pipe_temperature, 0.001)

    logger.debug(
        "CALC_SUPPLY=%.2f, CALC_RETURN=%.2f",
        calc_temperature_graph_item.supply_pipe_temperature,
        calc_temperature_graph_item.return_pipe_temperature
    )