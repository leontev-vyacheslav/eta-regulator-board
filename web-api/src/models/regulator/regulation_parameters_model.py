from models.abstracts.app_base_model import AppBaseModel


# Регулятор
class RegulationParametersModel(AppBaseModel):
    # коэффициент пропорциональности Кр = 40
    proportionality_factor: float = 40

    # коэффициент интегрирования Кi = 3
    integration_factor: float = 3

    # коэффициент дифференцирования Кd = 2
    differentiation_factor: float = 2

    # время дискретизации Td = 10
    sampling_time: float = 10

    # коэффициент снижения ПИД Sdv = 1
    reduction_factor_pid: float = 10

    # период клапана Vp
    valve_period: float = 0

    # аналоговое управление AC=нет
    analog_control: bool = False
