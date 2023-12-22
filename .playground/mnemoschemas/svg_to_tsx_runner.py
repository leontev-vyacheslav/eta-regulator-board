import os
import pathlib
import shutil


root = pathlib.Path(os.path.dirname(__file__))
workspace_root = root.parent.parent

new_file_names = [
    'svg-hot-water',
    'svg-heat-sys'
]
file_names = [
    'HotWater',
    'HeatSystem'
]

props = [
    {'name': 'supplyPipeTemperature', 'prefix': ', °C'},
    {'name': 'returnPipeTemperature', 'prefix': ', °C'},
    {'name': 'outdoorTemperature', 'prefix': ', °C'},
    {'name': 'valvePosition', 'prefix': '%'}
]

for file_name, new_file_name in zip(file_names, new_file_names):

    os.system(
        f'npx @svgr/cli --config-file {root}/svgr.config.js -- {root}/original/{file_name}.svg > {root}/processed/{file_name}.tsx'
    )

    with open(f'{root}/processed/{file_name}.tsx', mode='r') as f:
        svg = f.read()

    with open(f'{root}/processed/{file_name}.tsx', mode='w') as f:
        for t in props:
            svg = svg.replace(f'{{\'props.{t["name"]}\'}}', f'{{props.{t["name"]}.toLocaleString(undefined, {{ minimumFractionDigits: 1 }})}}{t["prefix"]}')

        svg = svg.replace('"{ props.pumpOn ? \'2.0s\': \'indefinite\' }"', '{ props.pumpOn ? \'2.0s\': \'indefinite\' }')

        svg = svg.replace(
            '"props.valveDirection === 1 ? \'inline\': \'none\'"',
            'props.valveDirection === 1 ? \'inline\': \'none\''
        )
        svg = svg.replace(
            '"props.valveDirection === 2 ? \'inline\': \'none\'"',
            'props.valveDirection === 2 ? \'inline\': \'none\''
        )

        # unknown props
        svg = svg.replace('shapeInside: \'url(#rect23643)\',', '')

        f.write(svg)

    shutil.copy(
        f'{root}/processed/{file_name}.tsx',
        f'{workspace_root}/web-ui/src/components/mnemoschemas/{new_file_name}.tsx'
    )


for new_file_name in new_file_names:
    os.system(
        f'cd {workspace_root}/web-ui && npx eslint --rule \'react/jsx-curly-spacing: ["error", "always"]\' --fix {workspace_root}/web-ui/src/components/mnemoschemas/{new_file_name}.tsx'
    )