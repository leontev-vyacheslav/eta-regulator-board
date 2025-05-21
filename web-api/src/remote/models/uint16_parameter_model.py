from dataclasses import dataclass

from remote.models.parameter_model import ParameterModel
from remote.models.parameter_types import ParameterTypes


@dataclass
class Uint16ParameterModel(ParameterModel):
    data_type: ParameterTypes = ParameterTypes.UINT16

    length: int = 1