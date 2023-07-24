import Popup from 'devextreme-react/popup';
import { useScreenSize } from '../../../utils/media-query';
import { DialogConstants } from '../../../constants/app-dialog-constant';
import { AppModalPopupProps } from '../../../models/app-modal-popup-props';

const AppModalPopup = ({ title,  children, callback }: AppModalPopupProps) => {
    const { isXSmall, isSmall } = useScreenSize();
    return (
        <Popup className={ 'app-popup' } title={ title }
               wrapperAttr={ { class: 'app-popup' } }
               dragEnabled={ true }
               visible={ true }
               showTitle={ true }
               showCloseButton={ true }
               onHiding={ () => callback({ modalResult: DialogConstants.ModalResults.Close, parametric: null }) }
               width={ isXSmall || isSmall ? '95%' : '40%' }
               height={ isXSmall || isSmall ? '95%' : '450' }>
            { children }
        </Popup>
    )
}

export default  AppModalPopup;
