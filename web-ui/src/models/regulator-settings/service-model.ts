export type SoftwareInfoModel = {
    webApiVersion: string,

    webUiVersion: string
}


export type HardwareInfoModel = {
    onionMacAddress: string
}


export type RtcDateTimeModel = {
    datetime: Date
}

export type ServiceModel = {
    softwareInfo: SoftwareInfoModel,

    hardwareInfo: HardwareInfoModel,

    rtcDatetime: RtcDateTimeModel
}