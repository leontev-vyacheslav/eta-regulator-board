from abc import ABC
from typing import Any, Dict
from datetime import datetime
from pydantic import BaseModel, root_validator

from utils.strings import snake_to_camel


class AppBaseModel(ABC, BaseModel):
    """
    The most common abstract model inherited from the pydantic base model.
    It defines custom serialization rules throughout this project
    """
    class Config:
        alias_generator = snake_to_camel
        allow_population_by_field_name = True
        ensure_ascii = False
        json_encoders = {
            datetime: lambda v: v.strftime("%Y-%m-%dT%H:%M:%SZ")  # ISO 8601 format
        }

    @root_validator(pre=True)
    def round_floats(cls, values: Dict[str, Any]) -> Dict[str, Any]:
        for field, value in values.items():
            if isinstance(value, float):
                values[field] = round(value, 2)

        return values
