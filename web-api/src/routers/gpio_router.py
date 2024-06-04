from flask_pydantic import validate

from app import app
from data_access.regulator_settings_repository import RegulatorSettingsRepository
from models.common.enums.user_role_model import UserRoleModel
from models.regulator.gpio_set_model import GpioItemModel, GpioSetModel
from omega import gpio
from utils.auth_helper import authorize
from utils.debugging import is_debug


@app.api_route('/gpio/<pin>/<state>', methods=['PUT'])
@validate(response_by_alias=True)
@authorize(roles=[UserRoleModel.ADMIN])
def put_gpio(pin: int, state: bool):
    value = gpio.set(pin, state) if not is_debug() else state

    return GpioItemModel(
        debug_mode_description=None,
        manual_mode_description=None,
        pin=pin,
        state=value
    )


@app.api_route('/gpio/<pin>', methods=['GET'])
@validate(response_by_alias=True)
@authorize()
def get_gpio(pin: int):
    if not is_debug():
        value = gpio.get(pin)
    else:
        regulator_settings_repository: RegulatorSettingsRepository = app.extensions['regulator_settings_repository']
        regulator_settings = regulator_settings_repository.settings
        value = next(
            (gpio_set_item.state for gpio_set_item in regulator_settings.gpio_set.items if gpio_set_item.pin == pin),
            False
        )

    return GpioItemModel(
        debug_mode_description=None,
        manual_mode_description=None,
        pin=pin,
        state=value
    )


@app.api_route('/gpio/all', methods=['GET'])
@validate(response_by_alias=True)
@authorize()
def get_gpio_set():
    regulator_settings = app.get_regulator_settings()

    if not is_debug():
        gpio_set_pins = [gpio_set_item.pin for gpio_set_item in regulator_settings.gpio_set.items]
        gpio_set_states = gpio.get_all(gpio_set_pins)

        gpio_set = GpioSetModel(items=[
            GpioItemModel(
                debug_mode_description=gpio_item.debug_mode_description,
                manual_mode_description=gpio_item.manual_mode_description,
                pin=gpio_item.pin,
                state=current_state
            )
            for gpio_item, current_state in zip(regulator_settings.gpio_set.items, gpio_set_states)
        ])
    else:
        gpio_set = regulator_settings.gpio_set

    return gpio_set
