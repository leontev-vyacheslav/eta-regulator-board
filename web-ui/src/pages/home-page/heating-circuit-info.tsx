import Form, { Label, SimpleItem } from 'devextreme-react/form';
import { WorkDateWidget } from '../../components/work-date-widget/work-date-widget';
import { HeatingCircuitIndexModel } from '../../models/regulator-settings/enums/heating-circuit-type-model';
import { useRegulatorSettings } from '../../contexts/app-regulator-settings';
import { HeatingCircuitInfoItem } from './heating-circuit-info-item';
import { MainMenu } from '../../components/menu/main-menu/main-menu';
import { RefreshIcon } from '../../constants/app-icons';
import { useHomePage } from './home-page-context';
import { getQuickGuid } from '../../utils/uuid';

export type HeatingCircuitInfoProps = {
     heatingCircuitIndex: HeatingCircuitIndexModel,
}

export const HeatingCircuitInfo = ({ heatingCircuitIndex }: HeatingCircuitInfoProps) => {
    const { getControlModeName } = useRegulatorSettings();
    const { setUpdateSharedRegulatorStateRefreshToken } = useHomePage();

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
                    <div style={ { display: 'flex', alignItems: 'center' } }>
                        <HeatingCircuitInfoItem>
                            {getControlModeName(heatingCircuitIndex)}
                        </HeatingCircuitInfoItem>
                        <MainMenu items={ [
                            {
                                icon: () => <RefreshIcon />,
                                onClick: () => {
                                    setUpdateSharedRegulatorStateRefreshToken(getQuickGuid())
                                }
                            }
                        ] } /></div>
                );
            } }>
                <Label text='Режим управления' showColon />
            </SimpleItem>
        </Form>
    );
}