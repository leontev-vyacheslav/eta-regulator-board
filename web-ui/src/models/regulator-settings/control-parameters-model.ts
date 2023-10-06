import { ControlModel } from './control-model'
import { TemperatureGraphModel } from './temperature-graph-model'

export type ControlParametersModel = {
    control: ControlModel,

    temperatureGraph: TemperatureGraphModel
}