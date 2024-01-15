from abc import ABC
from pydantic import BaseModel

from utils.strings import snake_to_camel


class AppBaseModel(ABC, BaseModel):
    class Config:
        alias_generator = snake_to_camel
        allow_population_by_field_name = True
        ensure_ascii=False
