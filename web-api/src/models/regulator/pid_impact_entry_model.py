from models.abstracts.app_base_model import AppBaseModel
from models.regulator.archive_model import ArchiveModel


class PidDeviationBase(AppBaseModel):
    deviation: float

    total_deviation: float


class PidImpactEntryModel(PidDeviationBase):
    archive: ArchiveModel


class PidImpactResultComponentsModel(PidDeviationBase):
    proportional_impact: float

    integration_impact: float

    differentiation_impact: float


class PidImpactResultModel(PidDeviationBase):
    impact: float
