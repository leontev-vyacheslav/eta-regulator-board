export type RegulatorOwnerModel = {
    name: string,

    phoneNumber: string
}

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
    regulatorOwner: RegulatorOwnerModel,

    softwareInfo: SoftwareInfoModel,

    hardwareInfo: HardwareInfoModel,
}