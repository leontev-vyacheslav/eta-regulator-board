export enum HeatingCircuitTypeModel {
    heating = 1,
    hotWater = 2,
    ventilation = 3
}

export const HeatingCircuitTypes = [
    {
        id: HeatingCircuitTypeModel.heating,
        description: 'Отопление',
        shotDescription: 'ЦО',
        settings: {
            comfortTemperatureMin: 15,
            comfortTemperatureMax: 30,
            economicalTemperatureMin: 15,
            economicalTemperatureMax: 30
        }
    },
    {
        id: HeatingCircuitTypeModel.hotWater,
        description: 'Горячее водоснабжение',
        shotDescription: 'ГВС',
        settings: {
            comfortTemperatureMin: 30,
            comfortTemperatureMax: 80,
            economicalTemperatureMin: 30,
            economicalTemperatureMax: 80
        }
    },
    {
        id: HeatingCircuitTypeModel.ventilation,
        description: 'Вентиляция',
        shotDescription: 'ВЕНТ',
        settings: {
            comfortTemperatureMin: 30,
            comfortTemperatureMax: 150,
            economicalTemperatureMin: 30,
            economicalTemperatureMax: 150
        }
    }
]