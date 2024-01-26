import './archives-page.scss';

import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/page-header/page-header';
import AppConstants from '../../constants/app-constants';
import { AdditionalMenuIcon, ArchivesIcon, DownloadIcon, GraphIcon, RefreshIcon, TableIcon, WorkDateIcon } from '../../constants/app-icons';
import { ArchivesChart } from './archives-chart';
import { ArchivesGrid } from './archives-grid';
import { useAppData } from '../../contexts/app-data/app-data';
import { ArchiveModel } from '../../models/regulator-settings/archive-model';
import { ArchivesDateSelectorDialog } from './archives-date-selector-dialog';
import { PopupCallbackModel } from '../../models/popup-callback';

export const ArchivesPage = () => {
    const { getArchivesByDateAsync, getArchivesByDateAsFile } = useAppData();
    const [isShowGraph, setIsShowGraph] = useState(true);
    const [isShowArchiveDateSelector, setIsShowArchiveDateSelector] = useState(false);
    const [archivesDate, setArchivesDate] = useState<Date>(new Date());
    const [archives, setArchives] = useState<ArchiveModel[]>([]);
    const [refreshToken, setRefreshToken] = useState<({ token: number }) | null>({ token: 0 });

    const downloadRegulatorSettingsAsync = useCallback(async () => {
        const data = await getArchivesByDateAsFile(archivesDate);

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
    }, [archivesDate, getArchivesByDateAsFile]);

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
                    }
                ]
            }];
    }, [downloadRegulatorSettingsAsync, isShowGraph, refreshToken])

    useEffect(() => {
        (async () => {
            if (!refreshToken) {
                return;
            }

            const archives = await getArchivesByDateAsync(archivesDate);
            if (archives) {
                setArchives(archives.items);
            }
        })();
    }, [archivesDate, getArchivesByDateAsync, refreshToken]);

    return (
        <>
            <PageHeader caption={ () => {
                return (
                    <div style={ { display: 'flex', gap: 10, alignItems: 'center' } }>
                        <span>Архивы</span>
                        <span>({archivesDate.toLocaleDateString('ru-RU')})</span>
                    </div>
                );
            } } menuItems={ menuItems } >
                <ArchivesIcon size={ AppConstants.headerIconSize } />
            </PageHeader>
            <div className={ 'content-block' }>
                <div className={ `dx-card responsive-paddings ${isShowGraph ? 'archives-content-chart' : 'archives-content-grid'}` }>
                    {
                        isShowGraph
                            ? <ArchivesChart dataSource={ archives } />
                            : <ArchivesGrid dataSource={ archives } />
                    }
                </div>
            </div>
            {isShowArchiveDateSelector
                ? <ArchivesDateSelectorDialog callback={ ({ modalResult, data }: PopupCallbackModel) => {
                    if(modalResult === 'OK') {
                        setArchivesDate(data);
                    }
                    setIsShowArchiveDateSelector(false);
                } } />
               : null
            }
        </>
    );
}

