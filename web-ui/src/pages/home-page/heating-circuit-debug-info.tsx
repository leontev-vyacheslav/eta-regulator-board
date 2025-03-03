import Form, { ColCountByScreen, GroupItem, Label, SimpleItem } from 'devextreme-react/form';
import { SharedRegulatorStateModel } from '../../models/regulator-settings/shared-regulator-state-model';
import { WorkDateWidget } from '../../components/work-date-widget/work-date-widget';
import { useRegulatorSettings } from '../../contexts/app-regulator-settings';
import { HeatingCircuitIndexModel } from '../../models/regulator-settings/enums/heating-circuit-type-model';
import { HeatingCircuitInfoItem } from './heating-circuit-info-item';

export const HeatingCircuitDebugInfo = ({ heatingCircuitIndex, sharedRegulatorState }: { heatingCircuitIndex: HeatingCircuitIndexModel, sharedRegulatorState: SharedRegulatorStateModel }) => {
    const { getControlModeName } = useRegulatorSettings();

    return (
        <Form className='heating-circuit-info-form' width={ 640 } scrollingEnabled>
            <ColCountByScreen xs={ 1 } sm={ 1 } md={ 2 } lg={ 2 } />

            <GroupItem caption='Общие' colSpan={ 2 }>
                <ColCountByScreen xs={ 1 } sm={ 1 } md={ 2 } lg={ 2 } />
                <SimpleItem render={ () => {
                    return (
                        <HeatingCircuitInfoItem>
                            <WorkDateWidget style={ { fontSize: 16, color: 'rgba(0, 0, 0, 0.87)' } } />
                        </HeatingCircuitInfoItem>
                    );
                } }>
                    <Label text='Время RTC' showColon />
                </SimpleItem>
                <SimpleItem render={ () => {
                    return (
                        <HeatingCircuitInfoItem>
                            {getControlModeName(heatingCircuitIndex)}
                        </HeatingCircuitInfoItem>
                    );
                } }>
                    <Label text='Режим управления' showColon />
                </SimpleItem>
            </GroupItem>

            <GroupItem caption='Температуры' colSpan={ 2 }>
                <ColCountByScreen xs={ 1 } sm={ 1 } md={ 2 } lg={ 2 } />
                <SimpleItem render={ () => {
                    return (
                        <HeatingCircuitInfoItem>
                            {`Outdoor = ${sharedRegulatorState.outdoorTemperature.toLocaleString(undefined, { minimumFractionDigits: 1 })} °C`}
                        </HeatingCircuitInfoItem>
                    )
                } }>
                    <Label text='Наружняя температура' showColon />
                </SimpleItem>
                <SimpleItem render={ () => {
                    return (
                        <HeatingCircuitInfoItem>
                            {`Room = ${sharedRegulatorState.roomTemperature.toLocaleString(undefined, { minimumFractionDigits: 1 })} °C` }
                        </HeatingCircuitInfoItem>
                    );
                } }>
                    <Label text='Температура в помещении' showColon />
                </SimpleItem>

                <SimpleItem render={ () => {
                    return (
                        <HeatingCircuitInfoItem>
                            {`Supply calc. = ${sharedRegulatorState.supplyPipeTemperatureCalculated.toLocaleString(undefined, { minimumFractionDigits: 1 })} °C`}
                        </HeatingCircuitInfoItem>
                    );
                } }>
                    <Label text='Расчетная температура подачи' showColon />
                </SimpleItem>
                <SimpleItem render={ () => {
                    return (
                        <HeatingCircuitInfoItem>
                            {`Supply = ${sharedRegulatorState.supplyPipeTemperature.toLocaleString(undefined, { minimumFractionDigits: 1 })} °C`}
                        </HeatingCircuitInfoItem>
                    );
                } }>
                    <Label text='Температура подачи' showColon />
                </SimpleItem>

                <SimpleItem render={ () => {
                    return (
                        <HeatingCircuitInfoItem>
                            {`Return calc. = ${sharedRegulatorState.returnPipeTemperatureCalculated.toLocaleString(undefined, { minimumFractionDigits: 1 })} °C `}
                        </HeatingCircuitInfoItem>
                    );
                } }>
                    <Label text='Расчетная температура обратки' showColon />
                </SimpleItem>
                <SimpleItem render={ () => {
                    return (
                        <div className="dx-field">
                            <div className="dx-field-item-label dx-field-item-label-location-top" style={ { fontSize: 16, color: 'rdba(0, 0, 0, 0.87)' } }>
                                {`Return = ${sharedRegulatorState.returnPipeTemperature.toLocaleString(undefined, { minimumFractionDigits: 1 })} °C`}
                            </div>
                        </div>
                    );
                } }>
                    <Label text='Температура обратки' showColon />
                </SimpleItem>
            </GroupItem>

            <GroupItem caption='Параметры регулирования' colSpan={ 2 }>
                <ColCountByScreen xs={ 1 } sm={ 1 } md={ 2 } lg={ 2 } />
                <SimpleItem render={ () => {
                    return (
                        <HeatingCircuitInfoItem>
                            {`Dev = ${sharedRegulatorState.deviation.toLocaleString(undefined, { minimumFractionDigits: 1 })}`}
                        </HeatingCircuitInfoItem>
                    );
                } }>
                    <Label text='Отклонение' showColon />
                </SimpleItem>

                <SimpleItem render={ () => {
                    return (
                        <HeatingCircuitInfoItem>
                            {`P = ${sharedRegulatorState.proportionalImpact.toLocaleString(undefined, { minimumFractionDigits: 1 })}`}
                        </HeatingCircuitInfoItem>
                    );
                } }>
                    <Label text='Пропорциональная составляющая' showColon />
                </SimpleItem>

                <SimpleItem render={ () => {
                    return (
                        <HeatingCircuitInfoItem>
                            {`Total = ${sharedRegulatorState.totalDeviation.toLocaleString(undefined, { minimumFractionDigits: 1 })}`}
                        </HeatingCircuitInfoItem>
                    );
                } }>
                    <Label text='Суммарное отклонение' showColon />
                </SimpleItem>

                <SimpleItem render={ () => {
                    return (
                        <div className="dx-field">
                            <div className="dx-field-item-label dx-field-item-label-location-top" style={ { fontSize: 16, color: 'rdba(0, 0, 0, 0.87)' } }>
                                {`I = ${sharedRegulatorState.integrationImpact.toLocaleString(undefined, { minimumFractionDigits: 1 })}`}
                            </div>
                        </div>
                    );
                } }>
                    <Label text='Интегральная составляющая' showColon />
                </SimpleItem>

                <SimpleItem render={ () => {
                    return (
                        <HeatingCircuitInfoItem>
                            {`DDev = ${sharedRegulatorState.deltaDeviation.toLocaleString(undefined, { minimumFractionDigits: 1 })}`}
                        </HeatingCircuitInfoItem>
                    );
                } }>
                    <Label text='Разница отклонений' showColon />
                </SimpleItem>

                <SimpleItem render={ () => {
                    return (
                        <HeatingCircuitInfoItem>
                            {`D = ${sharedRegulatorState.differentiationImpact.toLocaleString(undefined, { minimumFractionDigits: 1 })}`}
                        </HeatingCircuitInfoItem>
                    );
                } }>
                    <Label text='Дифференциальная составляющая' showColon />
                </SimpleItem>

                <SimpleItem render={ () => {
                    return (
                        <HeatingCircuitInfoItem>
                            {`Sum = ${(sharedRegulatorState.proportionalImpact + sharedRegulatorState.integrationImpact + sharedRegulatorState.differentiationImpact).toLocaleString(undefined, { minimumFractionDigits: 1 })}`}
                        </HeatingCircuitInfoItem>
                    );
                } }>
                    <Label text='Сумма' showColon />
                </SimpleItem>

                <SimpleItem render={ () => {
                    return (
                        <HeatingCircuitInfoItem>
                            {`Impact = ${sharedRegulatorState.impact.toLocaleString(undefined, { minimumFractionDigits: 1 })} %`}
                        </HeatingCircuitInfoItem>
                    );
                } }>
                    <Label text='Воздействие' showColon />
                </SimpleItem>
            </GroupItem>
        </Form>
    );
}