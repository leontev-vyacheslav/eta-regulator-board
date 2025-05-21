from typing import Any

from pymodbus.client.sync import ModbusTcpClient
from pymodbus.constants import Endian
from remote.models.heating_circuit_index_model import HeatingCircuitIndexModel
from remote.remote_connector_binary_payload_builder import RemoteConnectorBinaryPayloadBuilder
from remote.remote_connector_binary_payload_decoder import RemoteConnectorBinaryPayloadDecoder

from remote.remote_connector_registers import RemoteConnectorRegisters


class RemoteConnectorClient:

    def __init__(self, host: str, port: int = 5020):
        self.__host = host
        self.__port = port

    def __enter__(self):
        self.__client = ModbusTcpClient(self.__host, port=self.__port, timeout=60)

        if not self.__client.connect():
            raise ConnectionError("Failed to connect to MODBUS server")

        return self

    def __exit__(self, type, value, traceback):
        self.__client.close()
        self.__client = None

        return False

    def read(self, heating_circuit_index: HeatingCircuitIndexModel, param_name) -> Any:
        """
        Read a parameter by name
        """
        address, param_info = RemoteConnectorRegisters.get_param_info_by_name(param_name)

        address = address + heating_circuit_index * (RemoteConnectorRegisters.get_max_address())
        response = self.__client.read_holding_registers(
            address,
            param_info.length,
            unit=1
        )

        if response.isError():
            raise IOError(f"MODBUS read error: {response}")

        decoder = RemoteConnectorBinaryPayloadDecoder.fromRegisters(
            response.registers,
            byteorder=Endian.Big,
            wordorder=Endian.Big
        )

        return decoder.decode_by_data_type(param_info.data_type)

    def write(self, heating_circuit_index: HeatingCircuitIndexModel, param_name, value):
        """
        Write a parameter by name
        """
        address, param_info = RemoteConnectorRegisters.get_param_info_by_name(param_name)

        builder = RemoteConnectorBinaryPayloadBuilder(byteorder=Endian.Big, wordorder=Endian.Big)
        builder.add_by_data_type(value, param_info.data_type, param_info.length)
        payload = builder.to_registers()

        address = address + heating_circuit_index * (RemoteConnectorRegisters.get_max_address())

        response = self.__client.write_register(address, payload[0], unit=1) if len(payload) == 1 else self.__client.write_registers(address, payload, unit=1)

        if response.isError():
            raise IOError(f"MODBUS write error: {response}")

        return True
