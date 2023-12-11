from typing import List
from models.regulator.heating_circuits_model import HeatingCircuitsModel
from models.regulator.regulator_settings_model import RegulatorSettingsModel


class RegulatorSettingsRepository():

    def __init__(self, app=None, **kwargs):
        self._options = kwargs

        if app is not None:
            self._app = app
            self.init_app(app)

    def init_app(self, app):
        self.data_path = app.app_root_path.joinpath('data/regulator_settings.json')

        with open(self.data_path, 'r', encoding='utf-8') as file:
            json = file.read()
            self.settings: RegulatorSettingsModel = RegulatorSettingsModel.parse_raw(json)

        app.extensions['regulator_settings_repository'] = self

    def get_default_heating_circuits_settings(self) -> HeatingCircuitsModel:
        default_settings_data_path = self._app.app_root_path.joinpath('data/default_heating_circuits_settings.json')

        with open(default_settings_data_path, 'r', encoding='utf-8') as file:
            json = file.read()

        return HeatingCircuitsModel.parse_raw(json)


    def _dump(self) -> bool:
        with open(self.data_path, 'w', encoding='utf-8') as file:
            json = self.settings.json(by_alias=True, indent=4, ensure_ascii=False)
            dumped_bytes = file.write(json)

        return len(json) == dumped_bytes

    def update(self, current_settings):
        self.settings = current_settings

        self._dump()
