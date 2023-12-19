import { useScreenSize } from '../../../utils/media-query';
import { useMemo } from 'react';


export const useMnemoschemaWidth = () => {
    const { isXSmall, isSmall } = useScreenSize();

    return useMemo(() => {
        if (isXSmall) {
            return 'auto';
        }

        if (isSmall) {
            return '500';
        }

        return '600';
    }, [isSmall, isXSmall]);
};
