from datetime import datetime
from models.regulator.archive_model import ArchiveModel
from models.regulator.enums.failure_action_type_model import FailureActionTypeModel
from models.regulator.pid_impact_entry_model import PidImpactResultModel


class SharedRegulatorStateModel(ArchiveModel, PidImpactResultModel):
    delta_deviation: float

    failure_action_state: FailureActionTypeModel

    supply_pipe_temperature_calculated: float

    return_pipe_temperature_calculated: float


def get_default_shared_regulator_state(archive_datetime: datetime, failure_action_state) -> SharedRegulatorStateModel:
    return SharedRegulatorStateModel(
        delta_deviation=float("inf"),
        deviation=float("inf"),
        total_deviation=float("inf"),
        proportional_impact=float("inf"),
        integration_impact=float("inf"),
        differentiation_impact=float("inf"),
        impact=float("inf"),

        failure_action_state=failure_action_state,

        datetime=archive_datetime,
        outdoor_temperature=float("inf"),
        room_temperature=float("inf"),
        supply_pipe_temperature=float("inf"),
        return_pipe_temperature=float("inf"),

        supply_pipe_temperature_calculated=float("inf"),
        return_pipe_temperature_calculated=float("inf"),
    )
