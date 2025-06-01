from models.abstracts.app_base_model import AppBaseModel
from models.remote_connector.serial_remote_connector_bauds_models import SerialRemoteConnectorBaudsModel
from models.remote_connector.serial_remote_connector_bytesize_models import SerialRemoteConnectorBytesizeModel
from models.remote_connector.serial_remote_connector_stopbits_model import SerialRemoteConnectorStopbitsModel


class SerialRemoteConnectorSettingsModel(AppBaseModel):

    baud: SerialRemoteConnectorBaudsModel

    timeout: int

    parity: bool

    stopbits: SerialRemoteConnectorStopbitsModel

    bytesize: SerialRemoteConnectorBytesizeModel