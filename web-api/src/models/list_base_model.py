from abc import ABC
from typing import List, Optional

from pydantic import BaseModel

from models.test_model import TestModel


class ListBaseModel(ABC, BaseModel):
    items: Optional[List[TestModel]]
