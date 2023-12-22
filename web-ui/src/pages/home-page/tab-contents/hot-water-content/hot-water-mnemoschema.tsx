import { MnemoschemaProps } from '../../../../models/mnemoschema-props'
import { useMnemoschemaWidth } from '../../../../components/mnemoschemas/use-mnemoschema-width';
import SvgHotWater from '../../../../components/mnemoschemas/svg-hot-water'

export const HotWaterMnemoschema = (props: MnemoschemaProps) => {
    const width = useMnemoschemaWidth({ onHomePage: true });

    return (
        <>
            <SvgHotWater width={ width } { ...props } />
        </>
    )
}