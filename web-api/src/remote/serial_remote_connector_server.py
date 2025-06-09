from pymodbus.server.sync import ModbusSerialServer

from remote.remote_connector_server import RemoteConnectorServer


class SerialRemoteConnectorServer(RemoteConnectorServer):

    def __init__(self, app) -> None:
        super().__init__(app)

        self.server = ModbusSerialServer(
            context=self.context,
            identity=self.identity,
            port=self.settings.serial.port,
            stopbits=self.settings.serial.stopbits.value,
            bytesize=self.settings.serial.bytesize.value,
            parity=self.settings.serial.parity.value,
            baudrate=self.settings.serial.baud.value,
            timeout=self.settings.serial.timeout,
        )
