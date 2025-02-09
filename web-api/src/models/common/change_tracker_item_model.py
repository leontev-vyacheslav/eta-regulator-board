
from typing import Any, Optional, Set
from models.abstracts.app_base_model import AppBaseModel


class ChangeTrackerItemModel(AppBaseModel):
    path: str

    values: Set[Any]

    required_access_token: Optional[bool] = None

    original_value: Any

    current_value: Any
