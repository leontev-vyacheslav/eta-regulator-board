from logging import Logger
import logging
import os
import pathlib
from typing import Callable, List, Optional, Any, Union

from flask import Flask
from data_access.regulator_settings_repository import RegulatorSettingsRepository
from models.accounts_settings_model import AccountsSettingsModel

from models.internal_settings_model import InternalSettingsModel
from models.app_background_process_model import AppBackgroundProcessModel
from models.regulator.regulator_settings_model import RegulatorSettingsModel


class FlaskEx(Flask):

    def __init__(
        self,
        import_name: str,
        static_url_path: Optional[str] = None,
        static_folder: Optional[Union[str, os.PathLike]] = "static",
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

        self.worker_logger: Logger = self._init_worker_logger()
        self.internal_settings = self._init_internal_settings()
        self.app_background_processes: List[AppBackgroundProcessModel] = []

        # self.regulator_settings_repository = RegulatorSettingsRepository()

    def api_route(self, rule: str, **options: Any) -> Callable:
        return self.route(f'/api{rule}', **options)

    def _init_worker_logger(self) -> Logger:
        logger = logging.getLogger('worker_logger')
        logger.setLevel(logging.INFO)
        log_path = self.app_root_path.joinpath('log', 'worker.log')
        file_handler = logging.FileHandler(f'{log_path}', mode='w')
        formatter = logging.Formatter(
            fmt='%(asctime)s [%(levelname)s] %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

        return logger

    def _init_internal_settings(self) -> InternalSettingsModel:
        config_path = self.app_root_path.joinpath('data', 'internal_settings.json')

        with open(config_path, mode='r', encoding='utf-8') as f:
            json_config = f.read()

        return InternalSettingsModel.parse_raw(json_config)

    def get_regulator_settings_repository(self) -> RegulatorSettingsRepository:
        regulator_settings_repository: RegulatorSettingsRepository = self.extensions['regulator_settings_repository']

        return regulator_settings_repository

    def get_regulator_settings(self) -> RegulatorSettingsModel:
        regulator_settings_repository: RegulatorSettingsRepository = self.extensions['regulator_settings_repository']

        return regulator_settings_repository.settings

    def get_accounts_settings(self) -> AccountsSettingsModel:
        accounts_settings_repository: AccountsSettingsModel = self.extensions['accounts_settings_repository']

        return accounts_settings_repository.settings
