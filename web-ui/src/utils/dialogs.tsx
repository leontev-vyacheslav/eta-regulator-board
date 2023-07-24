import { createElement } from 'react';
import { alert, confirm } from 'devextreme/ui/dialog';
import * as AppIcons from '../constants/app-icons';
import { SimpleDialogContentModel, SimpleDialogModel } from '../models/simple-dialog';
import ReactDOMServer from 'react-dom/server';


const dialogContentRender = ({ iconName, iconSize, iconColor, textRender }: SimpleDialogContentModel) => {
    function innerContent() {
        return (
            <div style={ { display: 'flex', alignItems: 'center' } }>
                { createElement((AppIcons as any)[iconName], { size: iconSize ? iconSize : 36, style: { color: iconColor ? iconColor : '#ff5722' } }) }
                <span style={ { marginLeft: 10 } }>{ textRender() }</span>
            </div>
        );
    }

    return ReactDOMServer.renderToString(
        createElement(innerContent as any, {})
    );
}

const showConfirmDialog = ({ title, iconName, iconSize, iconColor, textRender, callback } : SimpleDialogModel) => {

    confirm(dialogContentRender({ iconName, iconSize, iconColor, textRender }), title).then((dialogResult) => {
        if (dialogResult) {
            if(callback) {
                callback();
            }
        }
    });
}

const showAlertDialog = ({ title, iconName, iconSize, iconColor, textRender, callback }: SimpleDialogModel) => {
    alert(dialogContentRender({ iconName, iconSize, iconColor, textRender }), title).then(() => {
        if (callback) {
            callback();
        }
    });
};

export { showConfirmDialog, showAlertDialog };
