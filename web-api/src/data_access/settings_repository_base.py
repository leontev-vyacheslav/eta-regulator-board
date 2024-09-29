import fcntl
import os
from typing import Any, List, Optional, Set
from pydantic import BaseModel
from models.common.change_tracker_item_model import ChangeTrackerItemModel
from utils.strings import pascal_to_snake

# pylint: disable=unused-import
from models.regulator.regulator_settings_model import RegulatorSettingsModel
from models.common.accounts_settings_model import AccountsSettingsModel


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
            try:
                fcntl.flock(file, fcntl.LOCK_SH)
                json = file.read()
            finally:
                fcntl.flock(file, fcntl.LOCK_UN)

            settings_model = globals().get(self.__class__.__name__.replace("Repository", 'Model'))

            self.settings = getattr(settings_model, 'parse_raw')(json)

    def _dump(self) -> bool:
        with open(self.data_path, 'w', encoding='utf-8') as file:
            json = self.settings.json(by_alias=True, indent=4, ensure_ascii=False)
            try:
                fcntl.flock(file, fcntl.LOCK_EX)
                dumped_bytes = file.write(json)
                file.flush()
                os.fsync(file.fileno())
            finally:
                fcntl.flock(file, fcntl.LOCK_UN)

        return len(json) == dumped_bytes

    def _find_changed_fields(self, obj1: Any, obj2: Any, path: str = '', visited: Optional[Set] = None) -> List[ChangeTrackerItemModel]:

        if visited is None:
            visited = set()

        changed_fields: List[ChangeTrackerItemModel] = []

        if id(obj1) in visited or id(obj2) in visited:
            return changed_fields

        visited.add(id(obj1))
        visited.add(id(obj2))

        for field in obj1.__annotations__:
            value1 = getattr(obj1, field)
            value2 = getattr(obj2, field)

            if isinstance(value1, (int, float, str)) and value1 != value2:
                required_access_token = None

                field_model = type(obj1).__fields__.get(field)
                if field is not None:
                    required_access_token = field_model.field_info.extra.get('required_access_token')

                changed_fields.append(
                    ChangeTrackerItemModel(
                        path=path + field,
                        values=(value1, value2),
                        required_access_token=required_access_token,
                        original_value=value1,
                        current_value=value2
                    )
                )

            elif isinstance(value1, BaseModel):
                nested_changes = self._find_changed_fields(value1, value2, f'{path}{field}.', visited)
                changed_fields = changed_fields + nested_changes
            elif isinstance(value1, list):
                for i, (item1, item2) in enumerate(zip(value1, value2)):
                    nested_changes = self._find_changed_fields(item1, item2, f'{path}{field}[{i}].', visited)
                    changed_fields = changed_fields + nested_changes

        visited.remove(id(obj1))
        visited.remove(id(obj2))

        return changed_fields

    def find_changed_fields(self, updated_settings: Any, path: str = '', visited: Optional[Set] = None) -> List[ChangeTrackerItemModel]:
        return self._find_changed_fields(self.settings, updated_settings, path, visited)

    def update(self, current_settings):

        self.settings = current_settings
        self._dump()
