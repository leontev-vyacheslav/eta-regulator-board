export type ScheduleTimeModel = {
    hours: number,
    minutes: number
}

export type ScheduleWindowModel = {
    startTime: ScheduleTimeModel,

    endTime: ScheduleTimeModel
}

export type ScheduleModel = {
    day: 1 | 2 | 3 | 4 | 5 | 6 | 7,

    windows: ScheduleWindowModel[]
}

export type SchedulesModel = {
    items: ScheduleModel[]
}