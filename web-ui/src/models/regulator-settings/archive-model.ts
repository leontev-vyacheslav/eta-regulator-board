export type ArchiveModel = {
    datetime: Date;

    outdoorTemperature: number;

    supplyPipeTemperature: number;

    returnPipeTemperature: number;
}

export type ArchiveExistsModel = {
    exists: boolean
}