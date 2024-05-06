from models.abstracts.app_base_model import AppBaseModel


class CalculatedTemperaturesModel(AppBaseModel):

    supply_pipe_temperature: float

    return_pipe_temperature: float