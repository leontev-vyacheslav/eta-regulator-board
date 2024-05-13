from models.abstracts.app_base_model import AppBaseModel
from models.regulator.archive_model import ArchiveModel


class PidImpactEntryModel(AppBaseModel):
    archive: ArchiveModel

    previous_derivation:  float

    total_derivation: float


class PidImpactResultModel(AppBaseModel):
    impact: float

    derivation: float
