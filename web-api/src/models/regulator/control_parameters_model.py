from models.abstracts.app_base_model import AppBaseModel

from models.regulator.control_model import ControlModel
from models.regulator.tempetrature_graph_model import TemperatureGraphModel


class ControlParametersModel(AppBaseModel):
    control: ControlModel

    temperature_graph: TemperatureGraphModel