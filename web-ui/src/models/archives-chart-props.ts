import { ArchiveModel } from './regulator-settings/archive-model'

export type ArchivesChartProps = {
    dataSource: ArchiveModel[],
    isShowTwoAxis: boolean,
    isShowLegends: boolean,
    isShowCalculatedValues: boolean
}