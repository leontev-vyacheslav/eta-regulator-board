from remote.models.parameter_model import ParameterModel
from remote.models.parameter_types import ParameterTypes


from dataclasses import dataclass


@dataclass
class Float64ParameterModel(ParameterModel):
    data_type: ParameterTypes = ParameterTypes.FLOAT64

    length: int = 4
