from models.abstracts.app_base_model import AppBaseModel
from models.regulator.archive_model import ArchiveModel
from models.regulator.enums.failure_action_type_model import FailureActionTypeModel


class PidDeviationBase(AppBaseModel):
    deviation: float

    total_deviation: float


class PidImpactEntryModel(PidDeviationBase):
    failure_action_state: FailureActionTypeModel

    archive: ArchiveModel


class PidImpactResultComponentsModel(PidDeviationBase):
    proportional_impact: float

    integration_impact: float

    differentiation_impact: float


class PidImpactResultModel(PidDeviationBase):
    impact: float



