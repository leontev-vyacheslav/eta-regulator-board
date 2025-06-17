from data_access.settings_repository_base import SettingsRepositoryBase


import os
import pathlib


class TestableRemoteConnectorServerRegulatorSettingsRepository(SettingsRepositoryBase):

    def __init__(self, app=None, **kwargs):

        root = pathlib.Path(os.path.dirname(__file__)).parent.parent
        self.data_path = root.joinpath(
            f'data/settings/regulator_settings.json'
        )

        with open(self.data_path, 'r', encoding='utf-8') as file:
            json_text = file.read()
            self.settings = getattr(globals().get('RegulatorSettingsModel'), 'parse_raw')(json_text)

            pass