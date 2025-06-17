from abc import ABC
import copy
from datetime import datetime
import fcntl
from pathlib import Path
from typing import Any
from pymodbus.datastore import ModbusServerContext, ModbusSequentialDataBlock
from pymodbus.device import ModbusDeviceIdentification
from pymodbus.constants import Endian

from data_access.regulator_settings_repository import RegulatorSettingsRepository
from models.regulator.regulator_settings_model import RegulatorSettingsModel
from models.regulator.shared_regulator_state_model import SharedRegulatorStateModel, get_remote_connector_default_shared_regulator_state
from models.remote_connector.remote_connectors_settings_model import RemoteConnectorsSettingsModel
from remote.models.heating_circuit_index_model import HeatingCircuitIndexModel
from remote.remote_connector_registers import RemoteConnectorRegisters
from remote.remote_connector_binary_payload_builder import RemoteConnectorBinaryPayloadBuilder
from remote.remote_connector_binary_payload_decoder import RemoteConnectorBinaryPayloadDecoder
from remote.remote_connector_slave_contect import RemoteConnectorSlaveContext


class RemoteConnectorServer(ABC):

    def __init__(self, app) -> None:
        self.app = app

        self.settings: RemoteConnectorsSettingsModel = copy.deepcopy(app.get_remote_connectors_settings())

        self.regulator_settings_repository: RegulatorSettingsRepository = app.get_regulator_settings_repository()
        self.regulator_settings: RegulatorSettingsModel = copy.deepcopy(self.regulator_settings_repository.settings)

        hr = ModbusSequentialDataBlock(0, self.__create_holding_registers())
        store = RemoteConnectorSlaveContext(
            hr=hr,
            zero_mode=True,
            set_values_callback=self.__set_values_callback,
            get_values_callback=self.__get_values_callback,
        )

        self.context = ModbusServerContext(slaves=store, single=True)

        self.identity = ModbusDeviceIdentification()
        self.identity.VendorName = 'EnergyTechAudit Ltd.'
        self.identity.ProductCode = 'HEATBOX'
        self.identity.ProductName = 'Heat Controller'
        self.identity.MajorMinorRevision = 'v.0.2.20250505-102620'

        self.server = None

    def __get_values_callback(self, fx, address) -> Any:
        values = None

        if fx == 3:
            _, param_info, heating_circuit_index = RemoteConnectorRegisters.get_param_info_by_address(address)

            if param_info.name.startswith('shared_regulator_state'):
                shared_regulator_state = self.__get_shared_regulator_state(heating_circuit_index)
                raw_value = getattr(shared_regulator_state, param_info.name.replace('shared_regulator_state.', ''))

                if isinstance(raw_value, datetime):
                    raw_value = raw_value.timestamp()

                builder = RemoteConnectorBinaryPayloadBuilder(byteorder=Endian.Big, wordorder=Endian.Big)
                builder.add_by_data_type(raw_value, param_info)
                values = builder.to_registers()

        return values

    def __set_values_callback(self, fx, address, values) -> bool:
        if fx == 16:
            return self.__update_settings(address, values)

    def __get_shared_regulator_state(self, heating_circuit_index: HeatingCircuitIndexModel):
        default_shared_regulator_state = get_remote_connector_default_shared_regulator_state()
        
        shared_regulator_state_file_path: Path = self.app.app_root_path.joinpath(
            f'data/archives/'
        )
        shared_regulator_state_file_name = next(shared_regulator_state_file_path.glob(f'*__[{heating_circuit_index}]'), None)

        if shared_regulator_state_file_name is None:
            return default_shared_regulator_state

        shared_regulator_state_file_path = shared_regulator_state_file_path.joinpath(shared_regulator_state_file_name)

        if not shared_regulator_state_file_path.exists():
            return default_shared_regulator_state
        try:
            with open(shared_regulator_state_file_path, "r", encoding="utf-8") as shared_regulator_state_file:
                try:
                    fcntl.flock(shared_regulator_state_file.fileno(), fcntl.LOCK_SH)
                    json_text = shared_regulator_state_file.read()
                finally:
                    fcntl.flock(shared_regulator_state_file.fileno(), fcntl.LOCK_UN)

            shared_regulator_state = SharedRegulatorStateModel.parse_raw(json_text)

            return shared_regulator_state
        except Exception:
            return default_shared_regulator_state

    def __create_holding_registers(self):
        """Convert all settings to MODBUS registers"""

        builder = RemoteConnectorBinaryPayloadBuilder(byteorder=Endian.Big, wordorder=Endian.Big)
        for heating_circuit_index in [
            HeatingCircuitIndexModel.FIRST,
            HeatingCircuitIndexModel.SECOND
        ]:
            regulator_heating_circuit_settings = self.regulator_settings.heating_circuits.items[heating_circuit_index]
            shared_regulator_state = self.__get_shared_regulator_state(heating_circuit_index)

            for param_info in RemoteConnectorRegisters.MAP:

                if param_info.name.startswith('shared_regulator_state'):
                    if 'datetime' in param_info.name:
                        dt: datetime = getattr(shared_regulator_state, 'datetime')
                        value = dt.timestamp()
                    else:
                        value = getattr(shared_regulator_state, param_info.name.replace('shared_regulator_state.', ''))

                elif param_info.name.startswith('control_parameters') or param_info.name.startswith('regulation_parameters'):
                    sub_obj_name, sub_obj_param_name = param_info.name.split('.')
                    value = getattr(getattr(regulator_heating_circuit_settings, sub_obj_name), sub_obj_param_name)
                else:
                    value = getattr(regulator_heating_circuit_settings, param_info.name)

                builder.add_by_data_type(value, param_info)

        return builder.to_registers()

    def __update_settings(self, address, values) -> bool:

        _, param_info, heating_circuit_index = RemoteConnectorRegisters.get_param_info_by_address(address)

        if param_info.readonly:
            return False

        decoder = RemoteConnectorBinaryPayloadDecoder.fromRegisters(values, Endian.Big, Endian.Big)
        decoded_value = decoder.decode_by_data_type(param_info.data_type)

        regulator_heating_circuit_settings = self.regulator_settings.heating_circuits.items[heating_circuit_index]
        if param_info.name.startswith('control_parameters') or param_info.name.startswith('regulation_parameters'):
            sub_obj_name, sub_obj_param_name = param_info.name.split('.')
            setattr(
                getattr(regulator_heating_circuit_settings, sub_obj_name),
                sub_obj_param_name,
                decoded_value
            )
        else:
            setattr(regulator_heating_circuit_settings, param_info.name, decoded_value)

            self.regulator_settings_repository.update(self.regulator_settings)

        return True

    def start(self):
        self.server.serve_forever()
