import { useScreenSize } from '../../utils/media-query';
import { useMemo } from 'react';


export const useMnemoschemaWidth = ({ onHomePage }: { onHomePage: boolean }) => {
    const { isXSmall, isSmall } = useScreenSize();

    return useMemo<string | number>(() => {
        if (isXSmall) {
            return 'auto';
        }

        if (onHomePage) {
            if (isSmall) {
                return 500;
            }

            return 600;
        } else {
            return 450;
        }

    }, [isSmall, isXSmall, onHomePage]);
};
