from models.heating_circuit_index_model import HeatingCircuitIndexModel
from remote_connector_client import RemoteConnectorClient


if __name__ == "__main__":
    with RemoteConnectorClient(host='0.0.0.0', port=5020) as connector:

        name = connector.read(HeatingCircuitIndexModel.FIRST.value, 'name')
        print(f"Current heat circuit name: {name}")

        new_name = f'{name}' + str(1)
        connector.write(HeatingCircuitIndexModel.FIRST.value, 'name', new_name)
        print(f"Setting heat circuit name: {new_name}")

        comfort_temp = connector.read(HeatingCircuitIndexModel.FIRST.value, 'control_parameters.comfort_temperature')
        print(f"Current comfort temperature: {comfort_temp}°C")

        new_temp = comfort_temp + 1.5
        print(f"Setting comfort temperature to {new_temp}°C")
        connector.write(HeatingCircuitIndexModel.FIRST.value, 'control_parameters.comfort_temperature', new_temp)

        proportionality_factor = connector.read(HeatingCircuitIndexModel.FIRST.value, 'regulation_parameters.proportionality_factor')
        print(f"Current proportionality factor: {proportionality_factor}")

