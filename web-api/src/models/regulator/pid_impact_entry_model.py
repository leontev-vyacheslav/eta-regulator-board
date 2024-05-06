from models.abstracts.app_base_model import AppBaseModel
from models.regulator.archive_model import ArchiveModel
from models.regulator.calculated_temperatures_model import CalculatedTemperaturesModel


class PidImpactEntryModel(AppBaseModel):
    archive: ArchiveModel

    previous_derivation:  float

    total_derivation: float


class PipImpactResultModel(AppBaseModel):
    impact: float

    derivarion: float
