import Form, { Label, SimpleItem } from 'devextreme-react/form';
import { PidImpactResultModel } from '../../models/regulator-settings/archive-model';

export const HeatingCircuitDebugInfo = ({ pidImpactResuilt }: { pidImpactResuilt?: PidImpactResultModel }) => {

    return (
        <Form className='heating-circuit-info-form'>
            <SimpleItem render={ () => {
                return (
                    <div className="dx-field">
                        <div className="dx-field-item-label dx-field-item-label-location-top" style={ { fontSize: 16, color: 'rdba(0, 0, 0, 0.87)' } }>
                            {pidImpactResuilt ? pidImpactResuilt.deviation : '-'}
                        </div>
                    </div>
                );
            } }>
                <Label text='Deviation' showColon />
            </SimpleItem>
        </Form>
    );
}