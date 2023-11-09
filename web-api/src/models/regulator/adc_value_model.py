from models.abstracts.app_base_model import AppBaseModel


class AdcValueModel(AppBaseModel):
    channel: int

    value: float


class TemperatureValueModel(AppBaseModel):
    channel: int

    value: float
