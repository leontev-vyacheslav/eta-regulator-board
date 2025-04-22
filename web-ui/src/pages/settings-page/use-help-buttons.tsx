import { useCallback } from 'react';
import { quickHelpReferenceService } from '../../services/quick-help-reference-service';

export const useHelpButtonOptions = () => {

    return useCallback((controlName: string, referencePath: string) => {
        const name = referencePath.split('/').findLast(() => true);
        const predefinedButton = controlName === 'dxSelectBox' ? ['dropDown'] : (controlName === 'dxNumberBox' ? ['spins'] : []);

        return {
            buttons: [{
                name: `help-button-${name}`,
                location: 'after',
                options: {
                    elementAttr: {
                        id: `help-button-${name}`,
                        style: {
                            display: 'none',
                        }
                    },
                    icon: 'help',
                    stylingMode: 'text',
                    type: 'normal',
                    onClick: () => {
                        quickHelpReferenceService.show(referencePath);
                    }
                }
            }, ...predefinedButton],
            onFocusIn: (e: any) => {
                e.element.querySelector(`#help-button-${name}`).style.display = 'flex';
            },
            onFocusOut: (e: any) => {
                setTimeout(() => {
                    e.element.querySelector(`#help-button-${name}`).style.display = 'none';
                }, 100);
            },
        };
    }
        , []);
}