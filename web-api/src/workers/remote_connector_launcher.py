from threading import Lock

from flask_ex import FlaskEx
from remote.remote_connector_server import RemoteConnectorServer


def remote_connector_launcher(app: FlaskEx, interval: float, immediately: bool, lock: Lock):
    server = RemoteConnectorServer(
        app=app,
        host='0.0.0.0',
        port=5020,
        regulator_settings_repository=app.get_regulator_settings_repository()
    )

    server.start()
