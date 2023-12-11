import { ReactComponent as ProgressGear } from '../../assets/progress-gears.svg';
import LoadPanel from 'devextreme-react/load-panel';
import './loader.scss';

const Loader = () => {
    return (
        <LoadPanel
            id='app-loader'
            visible={ true }
            position={ { of: 'body', offset: { x: 0, y: -50 } } }
            showPane={ true }
            shading={ true }
            width={ 200 } height={ 70 }
            maxWidth={ 200 } maxHeight={ 70 }
            shadingColor={ 'rgba(0, 0, 0, 0.15)' }
        >
            <ProgressGear />
            <span data-testid="testId">Загрузка...</span>
        </LoadPanel>
    );
};

export default Loader;
