import os
import pathlib
import shutil


root = pathlib.Path(os.path.dirname(__file__))
workspace_root = root.parent.parent

new_file_names = [
    'hot-water-content/svg-hot-water',
    'heat-sys-content/svg-heat-sys'
]
file_names = [
    'HotWater',
    'HeatSystem'
]

for file_name, new_file_name in zip(file_names, new_file_names):

    os.system(
        f'npx @svgr/cli --config-file {root}/svgr.config.js -- {root}/original/{file_name}.svg > {root}/processed/{file_name}.tsx'
    )

    with open(f'{root}/processed/{file_name}.tsx', mode='r') as f:
        svg = f.read()

    with open(f'{root}/processed/{file_name}.tsx', mode='w') as f:
        for t in ['supplyPipeTemperature', 'returnPipeTemperature', 'outdoorTemperature']:
            svg = svg.replace(f'{{\'props.{t}\'}}', f'{{props.{t}}}, °C')

        svg = svg.replace('"{ props.pumpOn ? \'2.0s\': \'indefinite\' }"', '{ props.pumpOn ? \'2.0s\': \'indefinite\' }')
        
        f.write(svg)

    shutil.copy(
        f'{root}/processed/{file_name}.tsx',
        f'{workspace_root}/web-ui/src/pages/home-page/tab-contents/{new_file_name}.tsx'
    )
