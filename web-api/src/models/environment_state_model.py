from pydantic import BaseModel


class EnvironmentState(BaseModel):
    state_value_1: int = 0
    state_value_2: int = 0
