import AppConstants from '../../constants/app-constants';
import { OutdoorChartSingIcon, ReturnPipeChartSingIcon, SupplyPipeChartSingIcon, TimeChartSingIcon } from '../../constants/app-icons';
import { getUuidV4 } from '../../utils/uuid';


export const ArchiveChartTooltip = (info: any) => {
    return (
        <div className='temperature-graph-tooltip' data-guid={ getUuidV4() } style={ {} }>
            {
                info.point.data.datetime != null  ?
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
                info.point.data.supplyPipeTemperature  != null ?
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
        </div>
    );
}