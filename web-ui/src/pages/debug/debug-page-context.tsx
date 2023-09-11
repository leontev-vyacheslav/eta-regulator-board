import { Dispatch, SetStateAction, createContext, useContext, useEffect, useState } from 'react';
import { TestListModel } from '../../models/data/test-list-model';
import { useAppData } from '../../contexts/app-data/app-data';

export type DebugPageContextModel = {
    testList: TestListModel | null,
    setTestList: Dispatch<SetStateAction<TestListModel | null>>
}

const DebugPageContext = createContext({} as DebugPageContextModel);

function DebugPageContextProvider(props: any) {
    const { getTestListDataAsync } = useAppData();
    const [testList, setTestList] = useState<TestListModel | null>(null);

    useEffect(() => {
        (async () => {
            const testList = await getTestListDataAsync();

            if (testList) {
                setTestList(testList);
            }
        })();
    }, [getTestListDataAsync]);

    return (
        <DebugPageContext.Provider value={ {
            testList,
            setTestList
        } } { ...props }>
            {props.children}
        </DebugPageContext.Provider>
    );
}
const useDebugPageContext = () => useContext(DebugPageContext);

export { DebugPageContextProvider, useDebugPageContext }