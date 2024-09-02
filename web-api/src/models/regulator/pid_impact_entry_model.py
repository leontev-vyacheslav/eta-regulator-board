from models.abstracts.app_base_model import AppBaseModel
from models.regulator.archive_model import ArchiveModel
from models.regulator.enums.valve_direction_model import ValveDirectionModel
from models.regulator.enums.failure_action_type_model import FailureActionTypeModel


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


class SharedRegulatorStateModel(ArchiveModel):
    failure_action_state: FailureActionTypeModel

    supply_pipe_temperature_calculated: float

    return_pipe_temperature_calculated: float

    valve_direction: ValveDirectionModel

    valve_position: float

