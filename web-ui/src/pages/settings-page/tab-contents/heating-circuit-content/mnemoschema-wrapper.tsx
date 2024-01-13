import './heating-circuit-mnemoschema.scss';
import { useSettingPageContext } from '../../settings-page-context';
import { HeatingCircuitTypeModel } from '../../../../models/regulator-settings/enums/heating-circuit-type-model';
import SvgHeatSystem from '../../../../components/mnemoschemas/svg-heat-sys';
import SvgHotWater from '../../../../components/mnemoschemas/svg-hot-water';
import { useMnemoschemaWidth } from '../../../../components/mnemoschemas/use-mnemoschema-width';
import { useMnemoschemaDefaultProps } from '../../../../components/mnemoschemas/use-mnemoschema-defaults-props';
import { formatMessage } from 'devextreme/localization';


export const MnemoschemaWrapper = () => {
    const { currentHeatingCircuitType } = useSettingPageContext();
    const width = useMnemoschemaWidth({ onHomePage: false });
    const defaultMnemoschemaProps = useMnemoschemaDefaultProps();

    return (
        currentHeatingCircuitType
            ? currentHeatingCircuitType.type === HeatingCircuitTypeModel.heating || currentHeatingCircuitType.type === HeatingCircuitTypeModel.ventilation
                ? <SvgHeatSystem  { ...defaultMnemoschemaProps } width={ width } viewBox={ '10 10 80 60' } />
                : <SvgHotWater { ...defaultMnemoschemaProps } width={ width } viewBox={ '10 5 80 60' }/>
            : <div style={ { height: 250 } } className='dx-empty-message'>{formatMessage('dxCollectionWidget-noDataText')}</div>
    );
}