from threading import Lock

from flask_ex import FlaskEx
from remote.remote_connector_server import TcpRemoteConnectorServer


def remote_connector_launcher(app: FlaskEx, interval: float, immediately: bool, lock: Lock):
    server = TcpRemoteConnectorServer(
        app=app
    )

    server.start()
