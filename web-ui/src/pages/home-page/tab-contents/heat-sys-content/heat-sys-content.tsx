import { MnemoschemaProps } from '../../../../models/mnemoschema-props'
import { useMnemoschemaWidth } from '../../../../components/mnemoschemas/use-mnemoschema-width';
import SvgHeatSystem from '../../../../components/mnemoschemas/svg-heat-sys'
import { HeatingCircuitIndexModel } from '../../../../models/regulator-settings/enums/heating-circuit-type-model';
import { HeatingCircuitInfo } from '../../heating-circuit-info';

export const HeatSysContent = (props: MnemoschemaProps) => {
    const width = useMnemoschemaWidth({ onHomePage: true });

    return (
        <>
            <HeatingCircuitInfo heatingCircuitIndex={ HeatingCircuitIndexModel.first } />
            <SvgHeatSystem width={ width } { ...props } />
        </>
    );
}