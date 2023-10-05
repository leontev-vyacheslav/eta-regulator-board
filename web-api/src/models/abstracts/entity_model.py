from abc import ABC

from pydantic import BaseModel


class EntityModel(BaseModel, ABC):
    id: int
