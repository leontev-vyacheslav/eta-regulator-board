const svgSizeInitialize = {
    name: 'sizeInitializer',
    description: '',
    fn: () => {
        return {
            element: {
                enter: (node, parentNode) => {
                    if (node.name === 'svg') {
                        node.attributes.width = 'props.width';
                        delete node.attributes['height'];

                        if (node.attributes['sodipodi:docname'] === 'HeatSystem.svg') {
                            node.attributes.viewBox = '10 10 80 60'
                        }

                        if (node.attributes['sodipodi:docname'] === 'HotWater.svg') {
                            node.attributes.viewBox = '10 5 80 60'
                        }

                        if(node.attributes['xmlnsXlink']) {
                            delete node.attributes['xmlnsXlink'];
                        }
                        if(node.attributes['xmlns:svg']) {
                            delete node.attributes['xmlns:svg'];
                        }
                    }
                }
            }
        }
    }
}

const propsInject = {
    name: 'injectProps',
    description: '',
    fn: () => {
        return {
            element: {
                enter: (node, parentNode) => {
                    if (node.attributes.id === 'T1' || node.attributes.id === 'T3') {
                        node.children = [{ type: 'text', value: 'props.supplyPipeTemperature' }];
                    }

                    if (node.attributes.id === 'T2' || node.attributes.id === 'T4') {
                        node.children = [{ type: 'text', value: 'props.returnPipeTemperature' }];
                    }

                    if (node.attributes.id === 'T1calc' || node.attributes.id === 'T3calc') {
                        node.children = [{ type: 'text', value: 'props.supplyPipeTemperatureCalc' }];
                    }

                    if (node.attributes.id === 'T2calc' || node.attributes.id === 'T4calc') {
                        node.children = [{ type: 'text', value: 'props.returnPipeTemperatureCalc' }];
                    }

                    if (node.attributes.id === 'T_air') {
                        node.children = [{ type: 'text', value: 'props.outdoorTemperature' }];
                    }

                    if(node.type === 'element' && node.name === 'animateTransform' && node.attributes.id === 'pump_dynamic_animation') {
                        node.attributes.dur = "{ props.pumpOn ? '2.0s': 'indefinite' }";
                    }

                    if (parentNode && parentNode.attributes && (parentNode.attributes.id === 'valve_M1_pos_txt' || parentNode.attributes.id === 'valve_M2_pos_txt')) {
                        const tspan = node.children.find(child => child.name === 'tspan');
                        node.attributes.x = '310'
                        if (tspan) {
                            tspan.children = [{type: 'text', value: 'props.valvePosition'}];
                        }
                    }

                    if (node.attributes.id === 'valve_M1_up' || node.attributes.id === 'valve_M2_up') {
                        node.attributes.style = node.attributes.style.replace('display:inline', 'display:props.valveDirection === 1 ? \'inline\': \'none\'')
                    }

                    if (node.attributes.id === 'valve_M1_dn' || node.attributes.id === 'valve_M2_dn') {
                        node.attributes.style = node.attributes.style.replace('display:inline', 'display:props.valveDirection === 2 ? \'inline\': \'none\'')
                    }
                }
            }
        }
    }
}

const pumpAnimationInject = {
    name: 'pumpAnimation',
    description: '',
    fn: () => {
        return {
            element: {
                enter: (node, parentNode) => {
                    if (node.attributes.id == 'pump_dynamic') {
                        const circleElement = node.children.find(child => child.name == 'circle');
                        if (!circleElement) {
                            throw ReferenceError('circle element not found (pump_dynamic)')
                        }

                        node.children = [
                            {
                                type: 'element',
                                name: 'animateTransform',
                                attributes:
                                {
                                    id: 'pump_dynamic_animation',
                                    attributeName: 'transform',
                                    type: 'rotate',
                                    from: `0 ${circleElement.attributes.cx} ${circleElement.attributes.cy}`,
                                    to: `360 ${circleElement.attributes.cx} ${circleElement.attributes.cy}`,
                                    keyTimes: '0;1',
                                    dur: 'indefinite',
                                    begin: '0s',
                                    repeatCount: 'indefinite'
                                },
                                children: []
                            },
                            ...node.children
                        ]
                    }
                }
            }
        }
    }
}

const colorsAndFontsMaterialize = {
    name: 'colorsMaterialize',
    description: '',
    fn: () => {

        const colors = [
            {
                name: 'blue',
                original: '#0000ff',
                material: '#2196F3',
            },
            {
                name: 'red',
                original: '#ff0000',
                material: '#F44336',
            },
            {
                name: 'green',
                original: '#007e2b',
                material: '#4CAF50',
            },
            {
                name: 'greenish',
                original: '#d3f7d7',
                material: '#f2f2f2',
            }
        ];

        return {
            element: {
                enter: (node, parentNode) => {

                   for (const key in node.attributes) {
                    if (Object.hasOwnProperty.call(node.attributes, key)) {

                        for (const color of colors) {
                            node.attributes[key] = node.attributes[key].replaceAll(color.original, color.material);
                        }

                        node.attributes[key] = node.attributes[key].replaceAll('MyriadPro-Regular', 'Roboto,RobotoFallback,Helvetica,Arial,sans-serif')
                    }
                   }
                }
            }
        }

    }
}

const removeTitle = {
    name: 'removeTitle',
    description: '',
    fn: () => {
        return {
            element: {
                enter: (node, parentNode) => {
                    if (node.type === 'element' && node.name === 'text' && node.attributes['inkscape:label'] === 'ContourLbl') {
                        parentNode.children = parentNode.children.filter((child) => child !== node);
                    }
                }
            }
        }
    }
}

module.exports = {
    jsxRuntime: 'automatic',
    prettier: true,
    prettierConfig: {
        bracketSpacing: true,
        jsxBracketSameLine: true,
        singleQuote: true,
        trailingComma: 'all',
        endOfLine: 'auto',
        printWidth: 120,
        tabWidth: 4,
    },
    svgoConfig: {
        plugins: [
            svgSizeInitialize,
            colorsAndFontsMaterialize,
            removeTitle,
            pumpAnimationInject,
            propsInject,
            {
                name: 'removeXMLNS'
            },
            {
                name: 'removeEditorsNSData',
                params: {
                    additionalNamespaces: ['inkscape', 'sodipodi', 'xml']
                }
            },
            {
                name: 'removeElementsByAttr',
                params: {
                    id: ['namedview3691']
                }
            },
            {
                name: 'removeAttrs',
                params: {
                    attrs: ['space', 'nodetypes', 'docname', 'shapeInside']
                }
            },
            {
                name: "cleanupIds",
                params: {
                    remove: true,
                    minify: false,
                    preserve: [
                        'T_air',
                        'T1',
                        'T1calc',
                        'T2',
                        'T2calc',
                        'T3',
                        'T3calc',
                        'T4',
                        'T4calc',
                        'pump_dynamic',
                        'valve_M1_pos_txt',
                        'valve_M1_dn',
                        'valve_M1_up',
                        'valve_M2_pos_txt',
                        'valve_M2_dn',
                        'valve_M2_up',
                    ],
                    preservePrefixes: [],
                    force: true
                }
            }
        ]
    }
}