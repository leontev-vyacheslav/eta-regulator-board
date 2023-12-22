import { MnemoschemaProps } from '../../../../models/mnemoschema-props'
import { useMnemoschemaWidth } from '../../../../components/mnemoschemas/use-mnemoschema-width';
import SvgHeatSystem from '../../../../components/mnemoschemas/svg-heat-sys'

export const HeatSysMnemoschema = (props: MnemoschemaProps) => {
    const width = useMnemoschemaWidth({ onHomePage: true });

    return (
        <>
            <SvgHeatSystem width={ width } { ...props } />
        </>
    );
}