from abc import ABC
import copy
import fcntl
from pathlib import Path
from pymodbus.datastore import ModbusServerContext, ModbusSequentialDataBlock
from pymodbus.device import ModbusDeviceIdentification
from pymodbus.constants import Endian

from data_access.regulator_settings_repository import RegulatorSettingsRepository
from models.regulator.regulator_settings_model import RegulatorSettingsModel
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
            set_values_callback=self.__set_values_callback
        )

        self.context = ModbusServerContext(slaves=store, single=True)

        self.identity = ModbusDeviceIdentification()
        self.identity.VendorName = 'EnergyTechAudit Ltd.'
        self.identity.ProductCode = 'HEATBOX'
        self.identity.ProductName = 'Heat Controller'
        self.identity.MajorMinorRevision = 'v.0.2.20250505-102620'

        self.server = None

    def __set_values_callback(self, fx, address, values) -> bool:
        if fx == 16:
            return self.__update_settings(address, values)

    def __get_shared_archive(self, heating_circuit_index):

        shared_regulator_state_file_path: Path = self.app.app_root_path.joinpath(
            f'data/archives/'
        )
        shared_regulator_state_file_name = next(shared_regulator_state_file_path.glob(f'__*__[{heating_circuit_index.value}]'), None)

        if shared_regulator_state_file_name is None:
            raise FileNotFoundError(
                f"Shared regulator state file not found for heating circuit {heating_circuit_index}"
            )
        shared_regulator_state_file_path = shared_regulator_state_file_path.joinpath(shared_regulator_state_file_name)

        if not shared_regulator_state_file_path.exists():
            raise FileNotFoundError(
                f"Shared regulator state file not found: {shared_regulator_state_file_path}"
            )
        try:
            with open(shared_regulator_state_file_path, "r", encoding="utf-8") as shared_regulator_state_file:
                try:
                    fcntl.flock(shared_regulator_state_file.fileno(), fcntl.LOCK_SH)
                    json_text = shared_regulator_state_file.read()
                finally:
                    fcntl.flock(shared_regulator_state_file.fileno(), fcntl.LOCK_UN)

            return json_text
        except Exception:
            return None

    def __create_holding_registers(self):
        """Convert all settings to MODBUS registers"""

        builder = RemoteConnectorBinaryPayloadBuilder(byteorder=Endian.Big, wordorder=Endian.Big)
        for heat_circuit_index in [
            HeatingCircuitIndexModel.FIRST,
            HeatingCircuitIndexModel.SECOND
        ]:
            obj = self.regulator_settings.heating_circuits.items[heat_circuit_index]

            for param_info in RemoteConnectorRegisters.MAP:

                if param_info.name == 'shared_archive':
                    value = self.__get_shared_archive(heat_circuit_index)
                else:
                    if "." in param_info.name:
                        sub_obj_name, sub_obj_param_name = param_info.name.split('.')
                        value = getattr(getattr(obj, sub_obj_name), sub_obj_param_name)
                    else:
                        value = getattr(obj, param_info.name)

                builder.add_by_data_type(value, param_info)

        return builder.to_registers()

    def __update_settings(self, address, values) -> bool:

        _, param_info = RemoteConnectorRegisters.get_param_info_by_address(address)

        if param_info.readonly:
            return False

        decoder = RemoteConnectorBinaryPayloadDecoder.fromRegisters(values, Endian.Big, Endian.Big)
        decoded_value = decoder.decode_by_data_type(param_info.data_type)

        heating_circuit_index = 0 if 0 <= address < RemoteConnectorRegisters.get_max_address() else 1

        obj = self.regulator_settings.heating_circuits.items[heating_circuit_index]

        if '.' in param_info.name:
            sub_obj_name, sub_obj_param_name = param_info.name.split('.')
            setattr(
                getattr(obj, sub_obj_name),
                sub_obj_param_name,
                decoded_value
            )
        else:
            setattr(obj, param_info.name, decoded_value)

        self.regulator_settings_repository.update(self.regulator_settings)

        return True

    def start(self):
        self.server.serve_forever()


