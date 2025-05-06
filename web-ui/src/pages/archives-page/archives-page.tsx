import './archives-page.scss';

import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/page-header/page-header';
import AppConstants from '../../constants/app-constants';
import { AdditionalMenuIcon, ArchivesIcon, DownloadIcon, GraphIcon, RefreshIcon, TableIcon, WorkDateIcon, ViewIcon, CheckIcon } from '../../constants/app-icons';
import { ArchivesChart } from './archives-chart';
import { ArchivesGrid } from './archives-grid';
import { useAppData } from '../../contexts/app-data/app-data';
import { ArchiveModel } from '../../models/regulator-settings/archive-model';
import { ArchivesDateSelectorDialog } from './archives-date-selector-dialog';
import { PopupCallbackModel } from '../../models/popup-callback';
import { PageToolbar } from '../../components/page-toolbar/page-toolbar';
import { formatMessage } from 'devextreme/localization';
import { useParams } from 'react-router';
import { useRegulatorSettings } from '../../contexts/app-regulator-settings';
import { HeatingCircuitTypes } from '../../models/regulator-settings/enums/heating-circuit-type-model';
import { useScreenSize } from '../../utils/media-query';

export const ArchivesPage = () => {
    const { circuitIdParam } = useParams();
    const { isXSmall, isSmall } = useScreenSize();


    const { regulatorSettings } = useRegulatorSettings();
    const { getArchivesByDateAsync, getArchivesByDateAsFile } = useAppData();
    const [archivesDate, setArchivesDate] = useState<Date>(new Date());
    const [archives, setArchives] = useState<ArchiveModel[]>([]);
    const [refreshToken, setRefreshToken] = useState<({ token: number }) | null>({ token: 0 });

    const [isShowGraph, setIsShowGraph] = useState(true);
    const [isShowArchiveDateSelector, setIsShowArchiveDateSelector] = useState(false);
    const [isShowCalculatedValues, setIsShowCalculatedValues] = useState<boolean>(false);
    const [isShowTwoAxis, setIsShowTwoAxis] = useState<boolean>(false);
    const [isShowLegends, setIsShowLegends] = useState<boolean>(false);


    const circuitId = useMemo(() => {
        return circuitIdParam ? parseInt(circuitIdParam) : 0;
    }, [circuitIdParam]);

    const currentHeatingCircuitType = useMemo(() => {
        return HeatingCircuitTypes.find(t => t.type === regulatorSettings!.heatingCircuits.items[circuitId].type)!;
    }, [circuitId, regulatorSettings]);

    const pageHeaderTitle = useMemo(() => {
        return (
            <div style={ { display: 'flex', gap: 10, alignItems: 'center' } }>
                <span>{`Архивы контура ${circuitId + 1} (${currentHeatingCircuitType.shotDescription})`}</span>
                <span>({archivesDate.toLocaleDateString('ru-RU')})</span>
            </div>
        );

    }, [archivesDate, circuitId, currentHeatingCircuitType]);


    const downloadRegulatorSettingsAsync = useCallback(async () => {
        const data = await getArchivesByDateAsFile(circuitId, archivesDate);

        if (!data) {
            return;
        };

        const href = URL.createObjectURL(data);

        const anchorElement = document.createElement('a');
        anchorElement.href = href;
        anchorElement.setAttribute('download', `${archivesDate.toISOString()}.json`);
        document.body.appendChild(anchorElement);
        anchorElement.click();

        document.body.removeChild(anchorElement);

        setTimeout(() => {
            URL.revokeObjectURL(href);
        }, 100);
    }, [archivesDate, circuitId, getArchivesByDateAsFile]);

    const menuItems = useMemo(() => {

        return [
            {
                icon: () => !isShowGraph ? <GraphIcon size={ 20 } color='black' /> : <TableIcon size={ 20 } color='black' />,
                onClick: () => {
                    setIsShowGraph(previous => !previous);
                }
            },
            {
                icon: () => <AdditionalMenuIcon size={ 20 } color='black' />,
                items: [
                    {
                        text: 'Вид',
                        icon: () => <ViewIcon size={ 20 } />,
                        visible: isShowGraph,
                        items: [
                            {
                                text: 'Две оси значений',
                                icon: () => isShowTwoAxis ? <CheckIcon size={ 20 } color='black' /> : <span style={ { width: 20 } } />,
                                onClick: () => {
                                    setIsShowTwoAxis(previous => !previous);
                                },
                            },
                            {
                                text: 'Значения по темп. гр.',
                                icon: () => isShowCalculatedValues ? <CheckIcon size={ 20 } color='black' /> : <span style={ { width: 20 } } />,
                                onClick: () => {
                                    setIsShowCalculatedValues(previous => !previous);
                                },
                            },
                            {
                                text: 'Леденды',
                                icon: () => isShowLegends ? <CheckIcon size={ 20 } color='black' /> : <span style={ { width: 20 } } />,
                                onClick: () => {
                                    setIsShowLegends(previous => !previous);
                                },
                            },
                        ]
                    },
                    {
                        text: 'Обновить...',
                        icon: () => < RefreshIcon size={ 20 } />,
                        onClick: () => setRefreshToken({ token: refreshToken!.token + 1 })
                    },
                    {
                        text: 'Выбрать дату...',
                        icon: () => < WorkDateIcon size={ 20 } />,
                        onClick: () => setIsShowArchiveDateSelector(true)
                    },
                    {
                        text: 'Выгрузить...',
                        icon: () => <DownloadIcon size={ 20 } />,
                        onClick: async () => await downloadRegulatorSettingsAsync()
                    },
                ]
            }];
    }, [downloadRegulatorSettingsAsync, isShowCalculatedValues, isShowGraph, isShowLegends, isShowTwoAxis, refreshToken])

    useEffect(() => {
        (async () => {
            if (!refreshToken) {
                return;
            }
            const archives = await getArchivesByDateAsync(circuitId, archivesDate);
            if (archives) {
                archives.items = archives.items.map(a => {
                    // converting to the locale date/time
                    return { ...a, datetime: new Date(a.datetime) }
                });
                setArchives(archives.items);
            }
        })();
    }, [archivesDate, circuitId, getArchivesByDateAsync, refreshToken]);

    useEffect(() => {
        setIsShowLegends(!(isXSmall || isSmall))
    }, [isSmall, isXSmall]);

    return (
        <>
            <PageHeader caption={ () => pageHeaderTitle } menuItems={ [] } >
                <ArchivesIcon size={ AppConstants.headerIconSize } />
            </PageHeader>
            <div className={ 'content-block' }>
                <div className={ `dx-card responsive-paddings ${isShowGraph ? 'archives-content-chart' : 'archives-content-grid'}` }>
                    <PageToolbar title={ formatMessage('archives-graphs') } menuItems={ menuItems } />
                    {
                        isShowGraph
                            ? <ArchivesChart dataSource={ archives } isShowTwoAxis={ isShowTwoAxis } isShowLegends={ isShowLegends } isShowCalculatedValues = { isShowCalculatedValues } />
                            : <ArchivesGrid dataSource={ archives } />
                    }
                </div>
            </div>
            {isShowArchiveDateSelector
                ? <ArchivesDateSelectorDialog circuitId={ circuitId } callback={ ({ modalResult, data }: PopupCallbackModel) => {
                    if (modalResult === 'OK') {
                        setArchivesDate(data);
                    }
                    setIsShowArchiveDateSelector(false);
                } } />
                : null
            }
        </>
    );
}

