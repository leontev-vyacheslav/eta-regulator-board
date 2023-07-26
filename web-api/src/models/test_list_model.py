from dataclasses import dataclass
from typing import List
from models.test_model import TestModel


@dataclass
class TestListModel:
    items: List[TestModel]