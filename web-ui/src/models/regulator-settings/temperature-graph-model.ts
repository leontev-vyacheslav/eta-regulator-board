export type TemperatureGraphItemModel = {
    id: string,
    
    outdoorTemperature: number,

    supplyPipeTemperature: number,

    returnPipeTemperature: number
}

export type TemperatureGraphModel = {
    items: TemperatureGraphItemModel[]
}
