
export type ArchiveModel = {
    datetime: Date;

    outdoorTemperature: number;

    roomTemperature: number;

    supplyPipeTemperature: number;

    returnPipeTemperature: number;

    isInitial?: boolean;
}

export type ArchiveExistsModel = {
    exists: boolean
}
