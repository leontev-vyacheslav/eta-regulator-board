from models.test_model import TestModel
from pydantic import BaseModel
from typing import List, Optional


class TestListModel(BaseModel):
    items: Optional[List[TestModel]]