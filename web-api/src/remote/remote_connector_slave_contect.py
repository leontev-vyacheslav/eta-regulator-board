from pymodbus.datastore import ModbusSlaveContext


class RemoteConnectorSlaveContext(ModbusSlaveContext):
    def __init__(self, *args, **kwargs):
        self.__set_values_callback = kwargs.pop('set_values_callback')
        self.__get_values_callback = kwargs.pop('get_values_callback')
        super().__init__(*args, **kwargs)

    def setValues(self, fx, address, values):
        is_updated = False

        if self.__set_values_callback is not None:
            is_updated = self.__set_values_callback(fx, address, values)

        if is_updated:
            super().setValues(fx, address, values)

    def getValues(self, fx, address, count=1):

        if self.__get_values_callback is not None:
            updated_value = self.__get_values_callback(fx, address)
            if updated_value is not None:
                super().setValues(16, address, updated_value)

        return super().getValues(fx, address, count)
