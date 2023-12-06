import './mnemoschema.scss';

export const Mnemoschema = ({ width }: { width: number | string }) => {
    return (
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 342.6 304.7" width={ width }>
            <g id="block-2">
                <g id="heating-system-2">
                    <line className="mnemochema-base" x1="240.4" y1="173.7" x2="101.9" y2="285.3" />
                    <rect x="101.9" y="173.7" className="mnemochema-base" width="138.5" height="111.6" />
                </g>
                <line className="mnemochema-base" x1="11.3" y1="262.4" x2="101.9" y2="262.4" />
                <line className="mnemochema-base" x1="240.4" y1="196.6" x2="331" y2="196.6" />
                <g id="output-valve-2">
                    <line className="mnemochema-base" x1="75.2" y1="196.6" x2="101.9" y2="196.6" />
                    <g>
                        <line className="mnemochema-base" x1="41.6" y1="206.3" x2="59.3" y2="196.1" />
                        <line className="mnemochema-base" x1="41.6" y1="186.7" x2="59.3" y2="197" />
                        <line className="mnemochema-base" x1="42.2" y1="206.8" x2="42.2" y2="186.4" />
                    </g>
                    <g>
                        <line className="mnemochema-base" x1="75.8" y1="206.3" x2="58.1" y2="196.1" />
                        <line className="mnemochema-base" x1="75.8" y1="186.7" x2="58.1" y2="197" />
                        <line className="mnemochema-base" x1="75.2" y1="206.8" x2="75.2" y2="186.4" />
                    </g>
                    <line className="mnemochema-base" x1="11.3" y1="196.6" x2="42.2" y2="196.6" />
                </g>
                <g id="manometer-2">
                    <line className="mnemochema-base" x1="58.7" y1="197.5" x2="58.7" y2="170.8" />
                    <circle className="mnemochema-base" cx="58.7" cy="160.5" r="10.2" />
                </g>
                <g id="pump-2">
                    <line className="mnemochema-base" x1="240.4" y1="262.4" x2="267.8" y2="262.4" />
                    <line className="mnemochema-base" x1="303.9" y1="262.4" x2="331.3" y2="262.4" />
                    <g>
                        <g>
                            <line className="mnemochema-base" x1="292.7" y1="272.1" x2="275" y2="261.9" />
                            <line className="mnemochema-base" x1="292.7" y1="252.5" x2="275" y2="262.7" />
                            <line className="mnemochema-base" x1="292.1" y1="272.6" x2="292.1" y2="252.2" />
                        </g>
                        <circle className="mnemochema-base" cx="285.7" cy="262.4" r="18.2" />
                    </g>
                </g>
            </g>
            <g id="block-1">
                <g id="heating-system-1">
                    <line className="mnemochema-base" x1="237.9" y1="31.4" x2="99.4" y2="143" />
                    <rect x="99.4" y="31.4" className="mnemochema-base" width="138.5" height="111.6" />
                </g>
                <line className="mnemochema-base" x1="8.8" y1="120.1" x2="99.4" y2="120.1" />
                <line className="mnemochema-base" x1="237.9" y1="54.3" x2="328.5" y2="54.3" />
                <g id="output-valve-1">
                    <line className="mnemochema-base" x1="72.7" y1="54.3" x2="99.4" y2="54.3" />
                    <g>
                        <line className="mnemochema-base" x1="39.1" y1="64" x2="56.8" y2="53.8" />
                        <line className="mnemochema-base" x1="39.1" y1="44.4" x2="56.8" y2="54.7" />
                        <line className="mnemochema-base" x1="39.7" y1="64.5" x2="39.7" y2="44.1" />
                    </g>
                    <g>
                        <line className="mnemochema-base" x1="73.3" y1="64" x2="55.6" y2="53.8" />
                        <line className="mnemochema-base" x1="73.3" y1="44.4" x2="55.6" y2="54.7" />
                        <line className="mnemochema-base" x1="72.7" y1="64.5" x2="72.7" y2="44.1" />
                    </g>
                    <line className="mnemochema-base" x1="8.8" y1="54.3" x2="39.7" y2="54.3" />
                </g>
                <g id="manometer-1">
                    <line className="mnemochema-base" x1="56.2" y1="55.2" x2="56.2" y2="28.5" />
                    <circle className="mnemochema-base" cx="56.2" cy="18.2" r="10.2" />
                </g>
                <g id="pump-1">
                    <line className="mnemochema-base" x1="237.9" y1="120.1" x2="265.3" y2="120.1" />
                    <line className="mnemochema-base" x1="301.4" y1="120.1" x2="328.8" y2="120.1" />
                    <g id="pump">
                        <g>
                            <line className="mnemochema-base" x1="290.2" y1="129.8" x2="272.5" y2="119.6" />
                            <line className="mnemochema-base" x1="290.2" y1="110.2" x2="272.5" y2="120.4" />
                            <line className="mnemochema-base" x1="289.6" y1="130.3" x2="289.6" y2="109.9" />
                        </g>
                        <circle className="mnemochema-base" cx="283.2" cy="120.1" r="18.2" />
                    </g>
                </g>
            </g>
        </svg>
    );
}