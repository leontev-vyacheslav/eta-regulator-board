import { MnemoschemaProps } from '../../../../models/mnemoschema-props'
import { useMnemoschemaWidth } from '../use-apply-width-mnemoschema';
import SvgHotWater from './svg-hot-water'

export const HotWaterMnemoschema = (props: MnemoschemaProps) => {
    const width = useMnemoschemaWidth();

    return (
        <>
            <SvgHotWater width={ width } { ...props } />
        </>
    )
}