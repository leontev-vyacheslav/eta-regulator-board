import { ReactNode } from 'react';


export const HeatingCircuitInfoItem = ({ children }: { children: ReactNode; }) => {
    return (
        <div className="dx-field">
            <div className="dx-field-item-label dx-field-item-label-location-top" style={ { fontSize: 16, color: 'rdba(0, 0, 0, 0.87)' } }>
                {children}
            </div>
        </div>
    );
};
