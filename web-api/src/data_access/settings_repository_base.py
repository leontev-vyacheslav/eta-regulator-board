from utils.strings import pascal_to_snake

#pylint: disable=unused-import
from models.regulator.regulator_settings_model import RegulatorSettingsModel
from models.accounts_settings_model import AccountsSettingsModel


class SettingsRepositoryBase():

    def __init__(self, app=None, **kwargs):
        self._options = kwargs
        self.settings = None

        if app is not None:
            self._app = app
            self.init_app(app)

    def init_app(self, app):
        app.extensions[pascal_to_snake(self.__class__.__name__)] = self

        self.data_path = app.app_root_path.joinpath(
            f'data/settings/{pascal_to_snake(self.__class__.__name__.replace("Repository", str()))}.json'
        )

        with open(self.data_path, 'r', encoding='utf-8') as file:
            json = file.read()
            settings_model = globals().get(self.__class__.__name__.replace("Repository", 'Model'))

            self.settings = getattr(settings_model, 'parse_raw')(json)

    def _dump(self) -> bool:
        with open(self.data_path, 'w', encoding='utf-8') as file:
            json = self.settings.json(by_alias=True, indent=4, ensure_ascii=False)
            dumped_bytes = file.write(json)

        return len(json) == dumped_bytes

    def update(self, current_settings):
        self.settings = current_settings

        self._dump()
