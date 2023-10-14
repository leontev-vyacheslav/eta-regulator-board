from typing import List

from models.abstracts.app_base_model import AppBaseModel


class RegulatorProgrammModel(AppBaseModel):
    pass

# Программы
class RegulatorProgrammsModel(AppBaseModel):
    items: List[RegulatorProgrammModel]
