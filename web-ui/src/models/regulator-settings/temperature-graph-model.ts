export type TemperatureGraphItemModel = {
    outdoorTemperature: number,

    supplyPipeTemperature: number,

    returnPipeTemperature: number
}

export type TemperatureGraphModel = {
    items: TemperatureGraphItemModel[]
}
