from typing import Optional
from models.regulator.archive_model import ArchiveModel
from models.regulator.enums.failure_action_type_model import FailureActionTypeModel
from models.regulator.enums.valve_direction_model import ValveDirectionModel
from models.regulator.pid_impact_entry_model import PidImpactResultModel

class SharedRegulatorStateModel(ArchiveModel):
    pid_impact_result: Optional[PidImpactResultModel]

    failure_action_state: FailureActionTypeModel

    supply_pipe_temperature_calculated: float

    return_pipe_temperature_calculated: float

    valve_direction: ValveDirectionModel

    valve_position: float
