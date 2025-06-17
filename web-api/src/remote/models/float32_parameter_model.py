from dataclasses import dataclass

from remote.models.parameter_model import ParameterModel
from remote.models.parameter_types import ParameterTypes


@dataclass
class Float32ParameterModel(ParameterModel):
    data_type: ParameterTypes = ParameterTypes.FLOAT32

    length: int = 2
