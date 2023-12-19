import { MnemoschemaProps } from '../../../../models/mnemoschema-props'
import { useMnemoschemaWidth } from '../use-apply-width-mnemoschema';
import SvgHeatSystem from './svg-heat-sys'

export const HeatSysMnemoschema = (props: MnemoschemaProps) => {
    const width = useMnemoschemaWidth();

    return (
        <>
            <SvgHeatSystem width={ width } { ...props } />
        </>
    )
}