export type ScheduleTimeModel = {
    hours: number,
    minutes: number
}

export type ScheduleWindowModel = {
    id: string,

    startTime: ScheduleTimeModel,

    endTime: ScheduleTimeModel,

    desiredTemperature: number
}

export type ScheduleModel = {
    id: string,

    day: 1 | 2 | 3 | 4 | 5 | 6 | 7,

    windows: ScheduleWindowModel[]
}

export type SchedulesModel = {
    items: ScheduleModel[]
}