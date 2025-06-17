from remote.remote_connector_server import RemoteConnectorServer


import threading


class TestableRemoteConnectorSeverThread(threading.Thread):

    def __init__(self, host='0.0.0.0', port=5020):
        super(TestableRemoteConnectorSeverThread, self).__init__()
        self.host = host
        self.port = port
        self._running = threading.Event()
        self._running.set()

        self.server = RemoteConnectorServer(app=None, host=host, port=port)

    def run(self):
        print("Modbus server started.")
        try:
            # serve_forever blocks, so run until _running is cleared
            while self._running.is_set():
                self.server.start()
        except Exception as e:
            print("Server error:", e)
        finally:
            print("Modbus server stopped.")

    def stop(self):
        print("Stopping server...")
        self._running.clear()
        self.server.server.server_close()  # Close the socket