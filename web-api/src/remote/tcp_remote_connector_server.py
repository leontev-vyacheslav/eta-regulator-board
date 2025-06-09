from pymodbus.server.sync import ModbusTcpServer

from remote.remote_connector_server import RemoteConnectorServer


class ReusableModbusTcpServer(ModbusTcpServer):

    def __init__(self, context, framer=None, identity=None, address=None, handler=None, allow_reuse_address=True, **kwargs):
        self.allow_reuse_address = True
        ModbusTcpServer.__init__(self, context, framer, identity, address, handler, allow_reuse_address, **kwargs)
        self.allow_reuse_address = True


class TcpRemoteConnectorServer(RemoteConnectorServer):

    def __init__(self, app) -> None:
        super().__init__(app)

        self.server = ReusableModbusTcpServer(
            context=self.context,
            identity=self.identity,
            address=('0.0.0.0', self.settings.tcp.port),
        )
