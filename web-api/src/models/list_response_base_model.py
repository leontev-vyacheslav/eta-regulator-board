from abc import ABC
from typing import List, Optional
from pydantic import BaseModel

from models.test_response_model import TestResponseModel


class ListResponseBaseModel(ABC, BaseModel):
    items: Optional[List[TestResponseModel]]
