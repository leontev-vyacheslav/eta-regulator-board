import { MnemoschemaProps } from '../../../../models/mnemoschema-props'
import { useMnemoschemaWidth } from '../../../../components/mnemoschemas/use-mnemoschema-width';
import SvgHotWater from '../../../../components/mnemoschemas/svg-hot-water'
import { HeatingCircuitIndexModel } from '../../../../models/regulator-settings/enums/heating-circuit-type-model';
import { HeatingCircuitInfo } from '../../heating-circuit-info';

export const HotWaterContent = (props: MnemoschemaProps) => {
    const width = useMnemoschemaWidth({ onHomePage: true });

    return (
        <>
            <HeatingCircuitInfo heatingCircuitIndex={ HeatingCircuitIndexModel.second } />
            <SvgHotWater width={ width } { ...props } />
        </>
    )
}