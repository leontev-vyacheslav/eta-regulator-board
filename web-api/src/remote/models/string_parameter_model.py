from dataclasses import dataclass

from remote.models.parameter_model import ParameterModel
from remote.models.parameter_types import ParameterTypes


@dataclass
class StringParameterModel(ParameterModel):
    data_type: ParameterTypes = ParameterTypes.STRING
    
    length: int = 0