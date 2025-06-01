import AppConstants from '../../constants/app-constants';
import { CalculatedSupplyPipeChartSingIcon, OutdoorChartSingIcon, ReturnPipeChartSingIcon, SupplyPipeChartSingIcon, TimeChartSingIcon } from '../../constants/app-icons';


export const ArchiveChartTooltip = ({ info, isShowCalculatedValues }: { info: any, isShowCalculatedValues: boolean }) => {
    return (
        <div className='temperature-graph-tooltip' >
            {
                info.point.data.datetime != null ?
                    <div>
                        <TimeChartSingIcon size={ 18 } />
                        <div>Время:</div>
                        <div>{(info.point.data.datetime as Date).toLocaleString('ru-RU')}</div>
                    </div>
                    : null
            }
            {
                info.point.data.outdoorTemperature != null ?
                    <div>
                        <OutdoorChartSingIcon size={ 18 } color={ AppConstants.colors.outdoorColor } />
                        <div>Наружный воздух:</div>
                        <div>{info.point.data.outdoorTemperature.toLocaleString(undefined, { minimumFractionDigits: 1 })} °C</div>
                    </div>
                    : null
            }
            {
                info.point.data.supplyPipeTemperature != null ?
                    <div>
                        <SupplyPipeChartSingIcon size={ 18 } color={ AppConstants.colors.supplyPipeColor } />
                        <div>Подача:</div>
                        <div>{info.point.data.supplyPipeTemperature.toLocaleString(undefined, { minimumFractionDigits: 1 })} °C</div>
                    </div>
                    : null
            }
            {
                info.point.data.returnPipeTemperature != null ?
                    <div>
                        <ReturnPipeChartSingIcon size={ 18 } color={ AppConstants.colors.returnPipeColor } />
                        <div>Обратка:</div>
                        <div>{info.point.data.returnPipeTemperature.toLocaleString(undefined, { minimumFractionDigits: 1 })} °C</div>
                    </div>
                    : null
            }
            {
                isShowCalculatedValues && info.point.data.calculatedSupplyPipeTemperature != null ?
                    <div>
                        <CalculatedSupplyPipeChartSingIcon size={ 18 } color={ AppConstants.colors.supplyPipeColor } />
                        <div>Подача (темп. гр.):</div>
                        <div>{info.point.data.calculatedSupplyPipeTemperature.toLocaleString(undefined, { minimumFractionDigits: 1 })} °C</div>
                    </div>
                    : null
            }
            {
                isShowCalculatedValues && info.point.data.calculatedReturnPipeTemperature != null ?
                    <div>
                        <svg width={ 20 } height={ 20 } viewBox="0 0 12 12">
                            <polygon points="5,0 10,5 5,10 0,5" fill={ AppConstants.colors.returnPipeColor } />
                        </svg>
                        <div>Обратка (темп. гр.):</div>
                        <div>{info.point.data.calculatedReturnPipeTemperature.toLocaleString(undefined, { minimumFractionDigits: 1 })} °C</div>
                    </div>
                    : null
            }
        </div>
    );
}