import { MnemoschemaProps } from '../../../../models/mnemoschema-props'
import { useMnemoschemaWidth } from '../../../../components/mnemoschemas/use-mnemoschema-width';
import SvgHeatSystem from '../../../../components/mnemoschemas/svg-heat-sys'
import { HeatingCircuitIndexModel } from '../../../../models/regulator-settings/enums/heating-circuit-type-model';
import { HeatingCircuitInfo } from '../../heating-circuit-info';
import { HeatingCircuitDebugInfo } from '../../heating-circuit-debug-info';
import { useHomePage } from '../../home-page-context';

export const HeatSysContent = (props: MnemoschemaProps) => {
    const width = useMnemoschemaWidth({ onHomePage: true });
    const { isShowMnemoschema } = useHomePage();

    return isShowMnemoschema ?
             <>
                <HeatingCircuitInfo heatingCircuitIndex={ HeatingCircuitIndexModel.first } />
                <SvgHeatSystem width={ width } { ...props } />
            </>
            : <HeatingCircuitDebugInfo sharedRegulatorState={ props } />
}