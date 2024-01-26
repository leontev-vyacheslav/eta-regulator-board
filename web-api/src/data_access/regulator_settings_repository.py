from data_access.settings_repository_base import SettingsRepositoryBase
from models.regulator.heating_circuits_model import HeatingCircuitsModel


class RegulatorSettingsRepository(SettingsRepositoryBase):

    def get_default_heating_circuits_settings(self) -> HeatingCircuitsModel:
        default_settings_data_path = self._app.app_root_path.joinpath('data/settings/default_heating_circuits_settings.json')

        with open(default_settings_data_path, 'r', encoding='utf-8') as file:
            json = file.read()

        return HeatingCircuitsModel.parse_raw(json)
