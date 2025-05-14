from pymodbus.client.sync import ModbusTcpClient
from pymodbus.constants import Endian

from typing import Any
from remote_connector_binary_payload_builder import RemoteConnectorBinaryPayloadBuilder
from remote_connector_binary_payload_decoder import RemoteConnectorBinaryPayloadDecoder
from remote_connector_registers import RemoteConnectorRegisters

from models.heating_circuit_index_model import HeatingCircuitIndexModel


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

    def __get_max_address(self):
        last_key = list(RemoteConnectorRegisters.MAP.keys())[-1]
        last_value = RemoteConnectorRegisters.MAP[last_key]
        address, _ = last_value.values()

        return address

    def read(self, heating_circuit_index: HeatingCircuitIndexModel, param_name) -> Any:
        """
        Read a parameter by name
        """

        if param_name not in RemoteConnectorRegisters.MAP:
            raise ValueError(f"Unknown parameter: {param_name}")

        if RemoteConnectorRegisters.MAP[param_name]['data_type'] == 'string':
            address, data_type, max_length = RemoteConnectorRegisters.MAP[param_name].values()
        else:
            address, data_type = RemoteConnectorRegisters.MAP[param_name].values()

        read_words_count = 1
        if data_type == 'float32':
            read_words_count = 2
        elif data_type == 'string':
            read_words_count = max_length

        # Read registers
        address = address + heating_circuit_index * self.__get_max_address()
        response = self.__client.read_holding_registers(
            address,
            read_words_count,
            unit=1
        )

        if response.isError():
            raise IOError(f"MODBUS read error: {response}")

        decoder = RemoteConnectorBinaryPayloadDecoder.fromRegisters(
            response.registers,
            byteorder=Endian.Big,
            wordorder=Endian.Big
        )
        if data_type == 'uint16':
            return decoder.decode_16bit_uint()
        elif data_type == 'float32':
            return decoder.decode_32bit_float()
        elif data_type == 'bool':
            return bool(decoder.decode_16bit_uint())
        elif data_type == 'string':
            return decoder.decode_string_utf8()

    def write(self, heating_circuit_index: HeatingCircuitIndexModel, param_name, value):
        """
        Write a parameter by name
        """

        if param_name not in RemoteConnectorRegisters.MAP:
            raise ValueError(f"Unknown parameter: {param_name}")

        param_info = RemoteConnectorRegisters.MAP[param_name]
        if param_info['data_type'] == 'string':
            address, data_type, max_length = param_info.values()
        else:
            address, data_type = param_info.values()

        # Prepare the value for writing
        builder = RemoteConnectorBinaryPayloadBuilder(byteorder=Endian.Big, wordorder=Endian.Big)

        if data_type == 'uint16':
            if not isinstance(value, int) or value < 0 or value > 65535:
                raise ValueError("Value must be uint16 (0-65535)")
            builder.add_16bit_uint(value)
        elif data_type == 'float32':
            builder.add_32bit_float(float(value))
        elif data_type == 'bool':
            builder.add_16bit_uint(1 if value else 0)
        elif data_type == 'string':
            builder.add_string_utf8(value, max_length)

        payload = builder.to_registers()

        # Write the value
        address = address + heating_circuit_index * self.__get_max_address()
        if len(payload) == 1:
            # Single register write
            response = self.__client.write_register(address, payload[0], unit=1)
        else:
            # Multiple register write
            response = self.__client.write_registers(address, payload, unit=1)

        if response.isError():
            raise IOError(f"MODBUS write error: {response}")

        return True
