from abc import ABC
from typing import List, Optional

from pydantic import BaseModel

from models.abstracts.entity_model import EntityModel



class ListBaseModel(ABC, BaseModel):
    items: Optional[List[EntityModel]]
