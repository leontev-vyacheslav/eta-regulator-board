import os
import pathlib
from typing import Callable, List, Optional, Any, Union

from flask import Flask
from data_access.accounts_settings_repository import AccountsSettingsRepository
from models.common.accounts_settings_model import AccountsSettingsModel
from data_access.regulator_settings_repository import RegulatorSettingsRepository
from models.regulator.regulator_settings_model import RegulatorSettingsModel
from data_access.remote_connectors_repository import RemoteConnectorsSettingsRepository
from models.remote_connector.remote_connectors_settings_model import RemoteConnectorsSettingsModel

from models.common.internal_settings_model import InternalSettingsModel
from models.common.app_background_process_model import AppBackgroundProcessModel
from models.regulator.enums.heating_circuit_type_model import HeatingCircuitTypeModel

from loggers.app_logger_builder import build as build_logger


class FlaskEx(Flask):

    def __init__(
        self,
        import_name: str,
        static_url_path: Optional[str] = None,
        static_folder: Optional[Union[str, os.PathLike]] = "../data",
        static_host: Optional[str] = None,
        host_matching: bool = False,
        subdomain_matching: bool = False,
        template_folder: Optional[str] = "templates",
        instance_path: Optional[str] = None,
        instance_relative_config: bool = False,
        root_path: Optional[str] = None
    ):

        super().__init__(
            import_name,
            static_url_path,
            static_folder,
            static_host,
            host_matching,
            subdomain_matching,
            template_folder,
            instance_path,
            instance_relative_config,
            root_path
        )

        self.app_root_path = pathlib.Path(os.path.dirname(__file__)).parent

        log_path = self.app_root_path.joinpath('log')
        if not log_path.exists():
            log_path.mkdir()

        archives_path = self.app_root_path.joinpath('data/archives/')
        if not archives_path.exists():
            archives_path.mkdir()
        else:
            shared_archive_prefixes = [f'{heating_circuit_type.name}__*' for heating_circuit_type in HeatingCircuitTypeModel]
            for prefix in shared_archive_prefixes:
                for shared_archive in archives_path.glob(prefix):
                    if shared_archive.is_file():
                        shared_archive.unlink()


        self.internal_settings = self._init_internal_settings()
        self.app_background_processes: List[AppBackgroundProcessModel] = []
        self.app_logger = build_logger('default_app_logger')

    def api_route(self, rule: str, **options: Any) -> Callable:
        return self.route(f'/api{rule}', **options)


    def _init_internal_settings(self) -> InternalSettingsModel:
        config_path = self.app_root_path.joinpath('data/settings', 'internal_settings.json')

        with open(config_path, mode='r', encoding='utf-8') as f:
            json_config = f.read()

        return InternalSettingsModel.parse_raw(json_config)

    def get_regulator_settings_repository(self) -> RegulatorSettingsRepository:
        regulator_settings_repository: RegulatorSettingsRepository = self.extensions['regulator_settings_repository']

        return regulator_settings_repository

    def get_regulator_settings(self) -> RegulatorSettingsModel:
        regulator_settings_repository: RegulatorSettingsRepository = self.extensions['regulator_settings_repository']

        return regulator_settings_repository.settings

    def get_accounts_settings_repository(self) -> AccountsSettingsRepository:
        accounts_settings_repository: AccountsSettingsRepository = self.extensions['accounts_settings_repository']

        return accounts_settings_repository

    def get_accounts_settings(self) -> AccountsSettingsModel:
        accounts_settings_repository: AccountsSettingsRepository = self.extensions['accounts_settings_repository']

        return accounts_settings_repository.settings

    def get_remote_connectors_settings_repository(self) -> RemoteConnectorsSettingsRepository:
        remote_connectors_settings_repository: RemoteConnectorsSettingsRepository = self.extensions['remote_connectors_settings_repository']

        return remote_connectors_settings_repository

    def get_remote_connectors_settings(self) -> RemoteConnectorsSettingsModel:
        remote_connectors_settings_repository: RemoteConnectorsSettingsRepository = self.extensions['remote_connectors_settings_repository']

        return remote_connectors_settings_repository.settings
