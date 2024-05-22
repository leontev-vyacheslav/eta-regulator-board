from models.abstracts.app_base_model import AppBaseModel
from models.regulator.archive_model import ArchiveModel


class PidDeviationBase(AppBaseModel):
    deviation: float

    total_deviation: float


class PidImpactEntryModel(PidDeviationBase):
    archive: ArchiveModel


class PidImpactResultModel(PidDeviationBase):
    impact: float
