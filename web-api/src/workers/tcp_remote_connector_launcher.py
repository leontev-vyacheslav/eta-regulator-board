from threading import Lock

from flask_ex import FlaskEx
from remote.tcp_remote_connector_server import TcpRemoteConnectorServer


def tcp_remote_connector_launcher(app: FlaskEx, interval: float, immediately: bool, lock: Lock):
    server = TcpRemoteConnectorServer(
        app=app
    )

    background_thread = next((t for t in app.app_background_threads if t.name == 'tcp_remote_connector_launcher'), None)
    if background_thread is not None:
        background_thread.data = {"remote_connector_server": server}

    server.start()


