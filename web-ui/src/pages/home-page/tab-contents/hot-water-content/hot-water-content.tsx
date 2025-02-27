import { MnemoschemaProps } from '../../../../models/mnemoschema-props'
import { useMnemoschemaWidth } from '../../../../components/mnemoschemas/use-mnemoschema-width';
import SvgHotWater from '../../../../components/mnemoschemas/svg-hot-water'
import { HeatingCircuitIndexModel } from '../../../../models/regulator-settings/enums/heating-circuit-type-model';
import { HeatingCircuitInfo } from '../../heating-circuit-info';
import { HeatingCircuitDebugInfo } from '../../heating-circuit-debug-info';
import { useHomePage } from '../../home-page-context';

export const HotWaterContent = (props: MnemoschemaProps) => {
    const width = useMnemoschemaWidth({ onHomePage: true });
    const { isShowMnemoschema } = useHomePage();

    return isShowMnemoschema ?
        <>
            <HeatingCircuitInfo heatingCircuitIndex={ HeatingCircuitIndexModel.second } />
            <SvgHotWater width={ width } { ...props } />
        </>
        : <HeatingCircuitDebugInfo pidImpactResuilt={ props.pidImpactResult } />
}