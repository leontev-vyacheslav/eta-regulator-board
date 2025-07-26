import { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { AppBaseProviderProps } from '../models/app-base-provider-props';

import { useAppData } from './app-data/app-data';
import { proclaim } from '../utils/proclaim';
import { formatMessage } from 'devextreme/localization';
import { showConfirmDialogEx } from '../utils/dialogs';
import { useSharedArea } from './shared-area';
import { ProcFunc } from '../models/primitive-type';

export type ServiceAreaContextModel = {
    isInReboot?: boolean;
    initSystemReboot: ProcFunc;
};

const ServiceAreaContext = createContext<ServiceAreaContextModel>({} as ServiceAreaContextModel);
const useServiceArea = () => useContext(ServiceAreaContext);


function ServiceAreaProvider(props: AppBaseProviderProps) {
    const { children } = props;
    const { showLoader, hideLoader } = useSharedArea();
    const [isInReboot, setIsInReboot] = useState<boolean>();
    const { getSystemRebootRequestAsync, getAliveRequestAsync } = useAppData();


    const initSystemReboot = useCallback(async () => {
        showConfirmDialogEx({
            title: formatMessage('confirm-title'),
            iconName: 'RestartIcon',
            iconSize: 48,
            iconColor: 'darkred',
            textRender: () => {
                return <>{formatMessage('confirm-dialog-system-reboot-request')}</>;
            },
            callback: async (dialogResult) => {
                if (dialogResult) {
                    await getSystemRebootRequestAsync();

                    proclaim({
                        type: 'warning',
                        message: 'Инициирован процесс перезапуска системы! Ориентировочное время выполнения 150 сек.',
                        // displayTime: 30000000
                    });
                    setIsInReboot(true);
                }
            },
        });
    }, [getSystemRebootRequestAsync]);


    useEffect(() => {
        if (isInReboot) {
            let intervalTimer: NodeJS.Timeout | null = null;
            const start = Date.now();
            showLoader();

            intervalTimer = setInterval(async () => {
                const end = Date.now();
                const loadingElement = document.querySelector('.dx-loadpanel-content');
                const spanElement = document.querySelector('.dx-loadpanel-content span');

                if (spanElement) {
                    const until = 160 - Math.round((end - start) / 1000);
                    (spanElement as HTMLSpanElement).innerText = `Перезапуск (${until > 0 ? until : 0} сек...)`;
                    (loadingElement as HTMLDivElement).style.width = '250px';
                }

                const response = await getAliveRequestAsync();
                if (response) {
                    clearInterval(intervalTimer!);
                    setIsInReboot(false);
                    hideLoader();
                    if (spanElement) {
                        (spanElement as HTMLSpanElement).innerText = 'Загрузка...';
                        (loadingElement as HTMLDivElement).style.width = '250px';
                        (loadingElement as HTMLDivElement).style.translate = '250px'; // translate(106px, 372px)
                    }
                }
            }, 5000);
        }
    }, [getAliveRequestAsync, hideLoader, isInReboot, showLoader]);

    return (
        <ServiceAreaContext.Provider value={ {
            isInReboot,
            initSystemReboot
        } } { ...props }>
            {children}

        </ServiceAreaContext.Provider>
    );
}

export { useServiceArea, ServiceAreaProvider };
