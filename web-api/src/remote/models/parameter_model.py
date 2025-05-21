from abc import ABC
from typing import Optional
from dataclasses import dataclass

from remote.models.parameter_types import ParameterTypes


@dataclass
class ParameterModel(ABC):
    name: str

    data_type: ParameterTypes

    length: int

    readonly: Optional[bool] = None