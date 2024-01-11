from typing import List, Optional
from models.abstracts.app_base_model import AppBaseModel


class GpioItemModel(AppBaseModel):
    debug_mode_description: Optional[str]

    manual_mode_description: Optional[str]

    pin: int

    state: Optional[bool] = None

class GpioSetModel(AppBaseModel):
    items: List[GpioItemModel]
