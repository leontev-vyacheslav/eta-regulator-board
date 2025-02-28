import Form, { ColCountByScreen, Label, SimpleItem } from 'devextreme-react/form';
import { SharedRegulatorStateModel } from '../../models/regulator-settings/shared-regulator-state-model';

export const HeatingCircuitDebugInfo = ({ sharedRegulatorState }: { sharedRegulatorState: SharedRegulatorStateModel }) => {

    return (
        <Form className='heating-circuit-info-form' width={ 640 }>
            <ColCountByScreen xs={ 1 } sm={ 1 } md={ 2 } lg={ 2 } />
            <SimpleItem render={ () => {
                return (
                    <div className="dx-field">
                        <div className="dx-field-item-label dx-field-item-label-location-top" style={ { fontSize: 16, color: 'rdba(0, 0, 0, 0.87)' } }>
                            {`Dev = ${sharedRegulatorState.deviation.toLocaleString(undefined, { minimumFractionDigits: 1 })}`}
                        </div>
                    </div>
                );
            } }>
                <Label text='Отклонение' showColon />
            </SimpleItem>

            <SimpleItem render={ () => {
                return (
                    <div className="dx-field">
                        <div className="dx-field-item-label dx-field-item-label-location-top" style={ { fontSize: 16, color: 'rdba(0, 0, 0, 0.87)' } }>
                            {`P = ${sharedRegulatorState.proportionalImpact.toLocaleString(undefined, { minimumFractionDigits: 1 })}`}
                        </div>
                    </div>
                );
            } }>
                <Label text='Пропорциональная составляющая' showColon />
            </SimpleItem>

            <SimpleItem render={ () => {
                return (
                    <div className="dx-field">
                        <div className="dx-field-item-label dx-field-item-label-location-top" style={ { fontSize: 16, color: 'rdba(0, 0, 0, 0.87)' } }>
                            {`Total = ${sharedRegulatorState.totalDeviation.toLocaleString(undefined, { minimumFractionDigits: 1 })}`}
                        </div>
                    </div>
                );
            } }>
                <Label text='Суммарное отклонение' showColon />
            </SimpleItem>

            <SimpleItem render={ () => {
                return (
                    <div className="dx-field">
                        <div className="dx-field-item-label dx-field-item-label-location-top" style={ { fontSize: 16, color: 'rdba(0, 0, 0, 0.87)' } }>
                            {`P = ${sharedRegulatorState.integrationImpact.toLocaleString(undefined, { minimumFractionDigits: 1 })}`}
                        </div>
                    </div>
                );
            } }>
                <Label text='Интегральная составляющая' showColon />
            </SimpleItem>

            <SimpleItem render={ () => {
                return (
                    <div className="dx-field">
                        <div className="dx-field-item-label dx-field-item-label-location-top" style={ { fontSize: 16, color: 'rdba(0, 0, 0, 0.87)' } }>
                            {`DDev = ${sharedRegulatorState.deltaDeviation.toLocaleString(undefined, { minimumFractionDigits: 1 })}`}
                        </div>
                    </div>
                );
            } }>
                <Label text='Разница отклонений' showColon />
            </SimpleItem>

            <SimpleItem render={ () => {
                return (
                    <div className="dx-field">
                        <div className="dx-field-item-label dx-field-item-label-location-top" style={ { fontSize: 16, color: 'rdba(0, 0, 0, 0.87)' } }>
                            {`D = ${sharedRegulatorState.differentiationImpact.toLocaleString(undefined, { minimumFractionDigits: 1 })}`}
                        </div>
                    </div>
                );
            } }>
                <Label text='Дифференциальная составляющая' showColon />
            </SimpleItem>

            <SimpleItem render={ () => {
                return (
                    <div className="dx-field">
                        <div className="dx-field-item-label dx-field-item-label-location-top" style={ { fontSize: 16, color: 'rdba(0, 0, 0, 0.87)' } }>
                            {`Sum = ${(sharedRegulatorState.proportionalImpact + sharedRegulatorState.integrationImpact + sharedRegulatorState.differentiationImpact).toLocaleString(undefined, { minimumFractionDigits: 1 })} %`}
                        </div>
                    </div>
                );
            } }>
                <Label text='Сумма' showColon />
            </SimpleItem>

            <SimpleItem render={ () => {
                return (
                    <div className="dx-field">
                        <div className="dx-field-item-label dx-field-item-label-location-top" style={ { fontSize: 16, color: 'rdba(0, 0, 0, 0.87)' } }>
                            {`Impact = ${sharedRegulatorState.impact.toLocaleString(undefined, { minimumFractionDigits: 1 })} %`}
                        </div>
                    </div>
                );
            } }>
                <Label text='Воздействие' showColon />
            </SimpleItem>
        </Form>
    );
}