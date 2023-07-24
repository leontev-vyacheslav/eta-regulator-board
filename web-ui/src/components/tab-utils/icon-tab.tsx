import { IconTabProps } from '../../models/icon-tab-props';

const IconTab = ({ tab, children }: IconTabProps) => {
    return (
        <div style={ { display: 'grid', gridTemplateColumns: '20px 1fr', gridGap: 5, alignItems: 'center' } }>
            { children }
            <span className="dx-tab-text">{ tab.title }</span>
        </div>
    );
}
export default IconTab;
