from abc import ABC
from typing import Any, Dict
from pydantic import BaseModel, root_validator

from utils.strings import snake_to_camel


class AppBaseModel(ABC, BaseModel):
    class Config:
        alias_generator = snake_to_camel
        allow_population_by_field_name = True
        ensure_ascii = False

    @root_validator(pre=True)
    def round_floats(cls, values: Dict[str, Any]) -> Dict[str, Any]:
        for field, value in values.items():
            if isinstance(value, float):
                values[field] = round(value, 2)

        return values