import './home-page.scss';
import AppConstants from '../../constants/app-constants';
import { HomeIcon } from '../../constants/app-icons';
import PageHeader from '../../components/page-header/page-header';
import { Mnemoschema } from '../../components/mnemoschema/mnemoschema';
import { useScreenSize } from '../../utils/media-query';

export const HomePage = () => {
    const { isXSmall, isSmall } = useScreenSize();
    return (
        <>
            <PageHeader caption={ 'Главная' }>
                <HomeIcon size={ AppConstants.headerIconSize } />
            </PageHeader>
            <div className={ 'content-block' }>
                <div className={ 'dx-card responsive-paddings home-page-content' }>
                    <Mnemoschema width={ isXSmall || isSmall ? 'auto' : 500 } />
                    {/* <div className={ 'logos-container' }>
                        <div>{AppConstants.appInfo.companyName}</div>
                    </div>
                    <p>
                        Благодарим Вас за использование нашего программного комплекса&nbsp;
                        <span style={ { fontWeight: 'bold' } }>{AppConstants.appInfo.title}</span>.
                    </p>
                    <p>
                        <span>
                            Это программное обеспечение предназначено для управления контроллерами регулирования компании ЭнергоТехАудит &nbsp; <a href={ 'https://ic-eta.ru' } target={ '_blank' } rel={ 'noopener noreferrer' }>ETA24™ Regulator Board</a>.
                            Программный комплекс <span style={ { fontWeight: 'bold' } }>{AppConstants.appInfo.title}</span> позволяет выполнить задание параметров регулирования,
                            получение текущей информации о состоянии объекта регулирования для обеспечения оперативного контроля и задания уставок регулирования.
                        </span>

                    </p>
                    <p>
                        <span>
                            Для получения более подробной технической информацией относительно{' '}
                            <span style={ { fontWeight: 'bold' } }>{AppConstants.appInfo.title}</span> обращайтесь в офисы компании{' '}
                        </span>
                        <a href="https://ic-eta.ru" target="_blank" rel="noopener noreferrer">
                            {AppConstants.appInfo.companyName}
                        </a>
                        <span>.</span>
                    </p> */}
                </div>
            </div>
        </>
    );
};
