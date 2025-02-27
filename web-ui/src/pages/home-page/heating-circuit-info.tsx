import Form, { Label, SimpleItem } from 'devextreme-react/form';
import { WorkDateWidget } from '../../components/work-date-widget/work-date-widget';
import { HeatingCircuitIndexModel } from '../../models/regulator-settings/enums/heating-circuit-type-model';
import { useRegulatorSettings } from '../../contexts/app-regulator-settings';


export const HeatingCircuitInfo = ({ heatingCircuitIndex }: { heatingCircuitIndex: HeatingCircuitIndexModel }) => {
    const { getControlModeName } = useRegulatorSettings();

    return (
        <Form className='heating-circuit-info-form'>
            <SimpleItem render={ () => {
                return (
                    <div className="dx-field">
                        <div className="dx-field-item-label dx-field-item-label-location-top">
                            <WorkDateWidget style={ { fontSize: 16, color: 'rgba(0, 0, 0, 0.87)' } } />
                        </div>
                    </div>
                );
            } }>
                <Label text='Время RTC' showColon />
            </SimpleItem>
            <SimpleItem render={ () => {
                return (
                    <div className="dx-field" >
                        <div className="dx-field-item-label dx-field-item-label-location-top" style={ { fontSize: 16, color: 'rdba(0, 0, 0, 0.87)' } }>
                            {getControlModeName(heatingCircuitIndex)}
                        </div>
                    </div>
                );
            } }>
                <Label text='Режим управления' showColon />
            </SimpleItem>
        </Form>
    );
}