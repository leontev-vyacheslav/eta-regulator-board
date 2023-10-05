from pydantic import BaseModel

from models.regulator.control_model import ControlModel
from models.regulator.tempetrature_graph_model import TemperatureGraphModel


class ControlParametersModel(BaseModel):
    control: ControlModel

    temperature_graph: TemperatureGraphModel