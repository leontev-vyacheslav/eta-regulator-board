export enum ControlModeModel {
    auto = 1,
    comfort = 2,
    economy = 3,
    protect = 4,
    manual = 5,
    off = 6,
}

export const ControlModes = [
    { id: ControlModeModel.auto, description: 'Автоматический по расписанию' },
    { id: ControlModeModel.comfort, description: 'Комфортный режим' },
    { id: ControlModeModel.economy, description: 'Экономный режим' },
    { id: ControlModeModel.protect, description: 'Защита от замерзания' },
    { id: ControlModeModel.manual, description: 'Ручной режим' },
    { id: ControlModeModel.off, description: 'Выключен' },
]