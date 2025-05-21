from pymodbus.datastore import ModbusSlaveContext


class RemoteConnectorSlaveContext(ModbusSlaveContext):
    def __init__(self, *args, **kwargs):
        self.__set_values_callback = kwargs.pop('set_values_callback')
        super().__init__(*args, **kwargs)

    def setValues(self, fx, address, values):
        is_success_updating = False

        if self.__set_values_callback is not None:
             is_success_updating = self.__set_values_callback(fx, address, values)

        if  is_success_updating:
            super().setValues(fx, address, values)

    def getValues(self, fx, address, count=1):
        return super().getValues(fx, address, count)
