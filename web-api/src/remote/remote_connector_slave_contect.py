from pymodbus.datastore import ModbusSlaveContext


class RemoteConnectorSlaveContext(ModbusSlaveContext):
    def __init__(self, *args, **kwargs):
        self.__set_values_callback = kwargs.pop('set_values_callback')
        super().__init__(*args, **kwargs)

    def setValues(self, fx, address, values):
        if self.__set_values_callback is not None:
            self.__set_values_callback(fx, address, values)

        super().setValues(fx, address, values)
