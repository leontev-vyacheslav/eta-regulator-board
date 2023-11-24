from logging import Logger
import logging
import os
import pathlib
from typing import Callable, List, Optional, Any, Union

from flask import Flask
from data_access.requlator_settings_repository import RegulatorSettingsRepository

from models.app_config_model import AppConfigModel
from models.app_background_process_model import AppBackgroundProcessModel


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
        self.app_config = self._init_app_config()
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

    def _init_app_config(self) -> AppConfigModel:
        config_path = self.app_root_path.joinpath('data', 'config.json')

        with open(config_path, mode='r', encoding='utf-8') as f:
            json_config = f.read()

        return AppConfigModel.parse_raw(json_config)

    def get_regulator_settings_repository(self):
        regulator_settings_repository: RegulatorSettingsRepository = self.extensions['regulator_settings_repository']

        return regulator_settings_repository

    def get_regulator_settings(self):
        regulator_settings_repository: RegulatorSettingsRepository = self.extensions['regulator_settings_repository']

        return regulator_settings_repository.settings
