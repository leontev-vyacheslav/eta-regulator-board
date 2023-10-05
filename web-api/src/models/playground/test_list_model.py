from typing import Optional, List

from models.abstracts.app_base_model import AppBaseModel
from models.playground.test_model import TestModel


class TestListModel(AppBaseModel):
    items: Optional[List[TestModel]]
