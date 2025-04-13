import bisect
import math
import uuid
from models.regulator.temperature_graph_model import TemperatureGraphItemModel, TemperatureGraphModel


def get_calculated_temperatures(outdoor_temperature: float, temperature_graph: TemperatureGraphModel) -> TemperatureGraphItemModel:
    """
    It allows to get the calculated temperatures according to the temperature graph
    """
    # nothing to calculate
    if math.isinf(outdoor_temperature) or not temperature_graph.items or len(temperature_graph.items) == 0:
        return TemperatureGraphItemModel(
            id=uuid.UUID(int=0).__str__(),
            outdoor_temperature=float("inf"),
            supply_pipe_temperature=float("inf"),
            return_pipe_temperature=float("inf")
        )

    # trying to get the exact match on the temperature graph
    exact_match_tg_item = next(
        (
            item
            for item in temperature_graph.items
            if item.outdoor_temperature == outdoor_temperature
        ),
        None
    )

    if exact_match_tg_item is not None:
        return exact_match_tg_item

    temperature_graph_items = sorted(
        temperature_graph.items,
        key=lambda i: i.outdoor_temperature
    )
    outdoor_temperature_measured = outdoor_temperature
    outdoor_temperatures = [item.outdoor_temperature for item in temperature_graph_items]

    pos = bisect.bisect_left(outdoor_temperatures, outdoor_temperature_measured)

    if pos == 0:
        supply_pipe_temperature_calculated = temperature_graph_items[0].supply_pipe_temperature
        return_pipe_temperature_calculated = temperature_graph_items[0].return_pipe_temperature
    elif pos == len(outdoor_temperatures):
        supply_pipe_temperature_calculated = temperature_graph_items[-1].supply_pipe_temperature
        return_pipe_temperature_calculated = temperature_graph_items[-1].return_pipe_temperature
    else:
        tg_left = temperature_graph_items[pos - 1]
        tg_right = temperature_graph_items[pos]
        # interpolating
        k = (tg_right.supply_pipe_temperature - tg_left.supply_pipe_temperature) / \
            (tg_right.outdoor_temperature - tg_left.outdoor_temperature)
        b = tg_left.supply_pipe_temperature - tg_left.outdoor_temperature * k
        supply_pipe_temperature_calculated = k * outdoor_temperature_measured + b

        k = (tg_right.return_pipe_temperature - tg_left.return_pipe_temperature) / \
            (tg_right.outdoor_temperature - tg_left.outdoor_temperature)
        b = tg_left.return_pipe_temperature - tg_left.outdoor_temperature * k
        return_pipe_temperature_calculated = k * outdoor_temperature_measured + b

    return TemperatureGraphItemModel(
        id=uuid.UUID(int=0).__str__(),
        outdoor_temperature=outdoor_temperature_measured,
        supply_pipe_temperature=supply_pipe_temperature_calculated,
        return_pipe_temperature=return_pipe_temperature_calculated
    )
