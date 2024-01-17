import Form, { Label, SimpleItem } from 'devextreme-react/form';
import { WorkDateWidget } from '../../components/work-date-widget/work-date-widget';
import { HeatingCircuitIndexModel } from '../../models/regulator-settings/enums/heating-circuit-type-model';
import { useRegulatorSettings } from '../../contexts/app-regulator-settings';

export const HeatingCircuitInfo = ({ heatingCircuitIndex }: {heatingCircuitIndex: HeatingCircuitIndexModel}) => {
    const { getControlModeName } = useRegulatorSettings();

    return (
        <Form className='heating-circuit-info-form'>
            <SimpleItem render={ () => {
                return (
                    <div className="dx-field">
                        <div className="dx-field-item-label dx-field-item-label-location-top">
                            <WorkDateWidget />
                        </div>
                    </div>
                );
            } }>
                <Label text='Время RTC:' />
            </SimpleItem>
            <SimpleItem render={ () => {
                return (
                    <div className="dx-field">
                        <div className="dx-field-item-label dx-field-item-label-location-top">
                            {getControlModeName(heatingCircuitIndex)}
                        </div>
                    </div>
                );
            } }>
                <Label text='Режим управления:' />
            </SimpleItem>
        </Form>
    );
}