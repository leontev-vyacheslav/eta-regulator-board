import copy
from pymodbus.server.sync import StartTcpServer
from pymodbus.datastore import ModbusServerContext, ModbusSequentialDataBlock
from pymodbus.device import ModbusDeviceIdentification
from pymodbus.constants import Endian


from data_access.regulator_settings_repository import RegulatorSettingsRepository
from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.regulator_settings_model import RegulatorSettingsModel
from remote.remote_connector_registers import RemoteConnectorRegisters
from remote.remote_connector_binary_payload_builder import RemoteConnectorBinaryPayloadBuilder
from remote.remote_connector_binary_payload_decoder import RemoteConnectorBinaryPayloadDecoder
from remote.remote_connector_slave_contect import RemoteConnectorSlaveContext
from utils.numbers import NULL_FLOAT, NULL_UINT16


class RemoteConnectorServer:

    def __init__(self, host: str, port: int, regulator_settings_repository: RegulatorSettingsRepository) -> None:
        self.host = host
        self.port = port
        self.regulator_settings_repository = regulator_settings_repository
        self.regulator_settings: RegulatorSettingsModel = copy.deepcopy(regulator_settings_repository.settings)
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
        self.identity.ProductName = 'Heating Controller'
        self.identity.MajorMinorRevision = 'v.0.2.20250505-102620'

    def __set_values_callback(self, fx, address, values):
        if fx == 16:
            self.__update_settings(address, values)


    def __get_max_address(self):
        last_key = list(RemoteConnectorRegisters.MAP.keys())[-1]
        last_value = RemoteConnectorRegisters.MAP[last_key]
        address, _ = last_value.values()

        return address

    def __create_holding_registers(self):
        """Convert all settings to MODBUS registers"""

        builder = RemoteConnectorBinaryPayloadBuilder(byteorder=Endian.Big, wordorder=Endian.Big)
        for heat_circuit_index in [
            HeatingCircuitIndexModel.FIRST,
            HeatingCircuitIndexModel.SECOND
        ]:

            cp = self.regulator_settings.heating_circuits.items[heat_circuit_index].control_parameters
            rp = self.regulator_settings.heating_circuits.items[heat_circuit_index].regulation_parameters

            # Control Parameters (registers 0-23)
            name = self.regulator_settings.heating_circuits.items[heat_circuit_index].name
            builder.add_string_utf8(name, 16)

            builder.add_16bit_uint(cp.control_mode)
            builder.add_16bit_uint(
                NULL_UINT16 if cp.manual_control_mode is None
                else cp.manual_control_mode
            )
            builder.add_16bit_uint(
                NULL_UINT16 if cp.outdoor_temperature_sensor_failure_action is None
                else cp.outdoor_temperature_sensor_failure_action
            )
            builder.add_16bit_uint(
                NULL_UINT16 if cp.supply_pipe_temperature_sensor_failure_action is None
                else cp.supply_pipe_temperature_sensor_failure_action
            )
            builder.add_32bit_float(
                NULL_FLOAT if cp.manual_control_mode_temperature_setpoint is None
                else cp.manual_control_mode_temperature_setpoint
            )
            builder.add_32bit_float(cp.analog_valve_error_setpoint)
            builder.add_32bit_float(
                NULL_FLOAT if cp.summer_mode_transition_temperature is None
                else cp.summer_mode_transition_temperature
            )
            builder.add_32bit_float(cp.comfort_temperature)
            builder.add_32bit_float(cp.economical_temperature)
            builder.add_32bit_float(
                NULL_FLOAT if cp.frost_protection_temperature is None
                else cp.frost_protection_temperature
            )
            builder.add_32bit_float(
                NULL_FLOAT if cp.room_temperature_influence is None
                else cp.room_temperature_influence
            )
            builder.add_32bit_float(cp.return_pipe_temperature_influence)
            builder.add_32bit_float(cp.supply_pipe_min_temperature)
            builder.add_32bit_float(cp.supply_pipe_max_temperature)

            # Regulation Parameters (registers 24-43)
            builder.add_16bit_uint(1 if cp.control_circulation_pump else 0)

            builder.add_32bit_float(rp.proportionality_factor)
            builder.add_32bit_float(rp.integration_factor)
            builder.add_32bit_float(rp.differentiation_factor)
            builder.add_32bit_float(rp.calculation_period)
            builder.add_32bit_float(rp.pulse_duration_valve)
            builder.add_16bit_uint(1 if rp.drive_unit_analog_control else 0)
            builder.add_32bit_float(rp.insensitivity_threshold)
            builder.add_32bit_float(rp.full_pid_impact_range)
            builder.add_32bit_float(rp.proportionality_factor_denominator)
            builder.add_32bit_float(rp.integration_factor_denominator)

        return builder.to_registers()

    def __update_settings(self, address, values):
        param_name, param_info = next(((k, v) for k, v in RemoteConnectorRegisters.MAP.items() if v['index'] == address), None)

        if param_name is None:
            return

        if param_info['data_type'] == 'string':
            address, data_type, max_length = param_info.values()
        else:
            address, data_type = param_info.values()

        decoder = RemoteConnectorBinaryPayloadDecoder.fromRegisters(values, Endian.Big, Endian.Big)

        if data_type == 'uint16':
            decoded_value = decoder.decode_16bit_uint()
        elif data_type == 'float32':
            decoded_value = decoder.decode_32bit_float()
        elif data_type == 'bool':
            decoded_value = bool(decoder.decode_16bit_uint())
        elif data_type == 'string':
            decoded_value = decoder.decode_string_utf8()

        heating_circuit_index = 0 if 0 <= address <= self.__get_max_address() else 1

        obj = self.regulator_settings.heating_circuits.items[heating_circuit_index]

        if '.' in param_name:
            sub_obj_name, sub_obj_param_name  = param_name.split('.')
            setattr(
                getattr(obj, sub_obj_name),
                sub_obj_param_name,
                decoded_value
            )
        else:
            setattr(obj, param_name, decoded_value)

        self.regulator_settings_repository.update(self.regulator_settings)

    def start(self):
        StartTcpServer(self.context, identity=self.identity, address=(self.host, self.port))
