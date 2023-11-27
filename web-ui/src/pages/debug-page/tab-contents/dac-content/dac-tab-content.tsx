import Form, { GroupItem, SimpleItem } from 'devextreme-react/form';
import { DacContextProvider, useDac } from './dac-context';
import { useScreenSize } from '../../../../utils/media-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Button from 'devextreme-react/button';
import { StartIcon, StopIcon } from '../../../../constants/app-icons';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { proclaim } from '../../../../utils/proclaim';
import { ActiveSignalGenModel } from '../../../../contexts/app-data/use-dac-data';

const DacTabContentInternal = () => {
    const { dacFormRef, testSignalList } = useDac();
    const { isXSmall, isSmall } = useScreenSize();
    const { getStartedSignalGenAsync, getActiveSignalGenAsync, deleteActiveSignalGenAsync } = useAppData();
    const [activeSignalGen, setActiveSignalGen] = useState<ActiveSignalGenModel | null>(null);
    const intervalTimerLock = useRef<boolean>(false);

    const formData = useMemo(() => {
        return {
            testSignal: 1,
        };
    }, []);

    const start = useCallback(async () => {
        const startedSignal = await getStartedSignalGenAsync(formData.testSignal);

        proclaim({
            type: 'success',
            message: `Запущен генератор с pid ${startedSignal?.pid}.`
        });

        setActiveSignalGen(startedSignal);
    }, [formData.testSignal, getStartedSignalGenAsync]);

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
            className='app-form adc-form'
            style={ { height: '50vh' } }
            height={ '50vh' }
            width={ isXSmall || isSmall ? '100%' : 600 }
            scrollingEnabled={ true }
            colCount={ 1 }
        >
            <GroupItem caption={ 'Тестовые сигналы' }>
                <SimpleItem
                    dataField='testSignal'
                    editorType='dxSelectBox'
                    label={ { location: 'top', showColon: true, text: 'Сигнал' } }
                    editorOptions={ {
                        displayExpr: 'description',
                        valueExpr: 'id',
                        items: testSignalList
                    } }
                />

                <SimpleItem></SimpleItem>
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
    return (
        <DacContextProvider>
            <DacTabContentInternal />
        </DacContextProvider>
    )
}