import Form, { Label, SimpleItem } from 'devextreme-react/form';
import { WorkDateWidget } from '../../components/work-date-widget/work-date-widget';
import { HeatingCircuitIndexModel } from '../../models/regulator-settings/enums/heating-circuit-type-model';
import { useRegulatorSettings } from '../../contexts/app-regulator-settings';
import { HeatingCircuitInfoItem } from './heating-circuit-info-item';

export const HeatingCircuitInfo = ({ heatingCircuitIndex }: { heatingCircuitIndex: HeatingCircuitIndexModel }) => {
    const { getControlModeName } = useRegulatorSettings();

    return (
        <Form className='heating-circuit-info-form'>
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
        </Form>
    );
}