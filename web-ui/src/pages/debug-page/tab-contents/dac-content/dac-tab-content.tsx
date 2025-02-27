import Form, { GroupItem, SimpleItem } from 'devextreme-react/form';
import { DacContextProvider, useDac } from './dac-context';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Button from 'devextreme-react/button';
import { StartIcon, StopIcon } from '../../../../constants/app-icons';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { proclaim } from '../../../../utils/proclaim';
import { ActiveSignalGenModel } from '../../../../contexts/app-data/use-dac-data';
import AppConstants from '../../../../constants/app-constants';
import { useDebugPage } from '../../debug-page-context';
import { formatMessage } from 'devextreme/localization';

const DacTabContentInternal = () => {

    const { dacFormRef, testSignalList } = useDac();
    const { getStartedSignalGenAsync, getActiveSignalGenAsync, deleteActiveSignalGenAsync } = useAppData();
    const [activeSignalGen, setActiveSignalGen] = useState<ActiveSignalGenModel | null>(null);
    const intervalTimerLock = useRef<boolean>(false);

    const formData = useMemo(() => {
        return {
            signalId: 1,
            lifetime: 60
        };
    }, []);

    const start = useCallback(async () => {
        const startedSignal = await getStartedSignalGenAsync(formData.signalId, formData.lifetime);

        proclaim({
            type: 'success',
            message: `Запущен генератор с pid ${startedSignal?.pid}.`
        });

        setActiveSignalGen(startedSignal);
    }, [formData, getStartedSignalGenAsync]);

    const stop = useCallback(async () => {
        intervalTimerLock.current = true;
        try {
            const deletedSignal = await deleteActiveSignalGenAsync();
            proclaim({
                type: 'warning',
                message: `Удален активный генератор с pid ${deletedSignal?.pid}.`
            });
            setActiveSignalGen(null);
        } finally {
            intervalTimerLock.current = false;
        }

    }, [deleteActiveSignalGenAsync]);

    useEffect(() => {
        (async () => {
            const activeSignalGen = await getActiveSignalGenAsync();
            setActiveSignalGen(activeSignalGen);
        })();
    }, [getActiveSignalGenAsync]);

    useEffect(() => {
        const intervalTimer = setInterval(async () => {
            if(intervalTimerLock.current) {
                return
            }
            const activeSignalGen = await getActiveSignalGenAsync();
            setActiveSignalGen(activeSignalGen);

        }, 1000);

        return () => clearInterval(intervalTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Form
            ref={ dacFormRef }
            formData={ formData }
            className='app-form debug-form  adc-form'
            style={ { height: '50vh' } }
            height={ AppConstants.formHeight }
            scrollingEnabled={ true }
            colCount={ 1 }
        >
            <GroupItem caption={ 'Тестовые сигналы' }>
                <SimpleItem
                    dataField='signalId'
                    editorType='dxSelectBox'
                    label={ { location: 'top', showColon: true, text: 'Сигнал' } }
                    editorOptions={ {
                        displayExpr: 'description',
                        valueExpr: 'id',
                        items: testSignalList,
                        disabled: activeSignalGen
                    } }
                />
                 <SimpleItem
                    dataField='lifetime'
                    editorType='dxNumberBox'
                    label={ { location: 'top', showColon: true, text: 'Время непрерывной генерации (сек)' } }
                    editorOptions={ {
                        min: 10,
                        max: 300,
                        step: 10,
                        showSpinButtons: true,
                        disabled: activeSignalGen
                    } }
                />

                <SimpleItem
                >
                    {
                        activeSignalGen
                        ? <div style={ { marginBottom: 10, marginTop: 10 } }>
                            <div>Запущен фоновый процесс с pid {activeSignalGen.pid}.</div>
                            <div>Время исполнения процесса {activeSignalGen.lifetime} сек.</div>
                        </div>

                        : <span>Нет активных фоновых процессов</span>
                    }

                </SimpleItem>
                <SimpleItem cssClass='adc-form_buttons'>
                    {
                        activeSignalGen
                        ?
                            <Button width={ 115 } type='danger' onClick={ stop }>
                                <StopIcon size={ 20 } /><span style={ { marginLeft: 5 } }>СТОП</span>
                            </Button>
                        :
                            <Button width={ 115 } text='Старт' style= { { backgroundColor: '#ff5722 ' } } type='success' onClick={ start } >
                                <StartIcon size={ 20 } /><span style={ { marginLeft: 5 } }>СТАРТ</span>
                            </Button>
                    }
                </SimpleItem>
            </GroupItem>
        </Form>
    );
}

export const DacTabContent = () => {
    const { modeId } = useDebugPage();

    return (
        <DacContextProvider>
            {
                modeId === 1
                ? <div className='dx-empty-message' style={ { height: AppConstants.formHeight } }>{formatMessage('dxCollectionWidget-noDataText')}</div>
                : <DacTabContentInternal />
            }
        </DacContextProvider>
    )
}