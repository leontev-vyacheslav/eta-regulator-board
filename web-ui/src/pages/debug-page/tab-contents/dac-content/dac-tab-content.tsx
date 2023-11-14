import { DacContexProvider } from './dac-context';

const DacTabContentInternal = () => {
    return (
        <>DacTabContentInternal</>
    );
}

export const DacTabContent = () => {
    return (
        <DacContexProvider>
            <DacTabContentInternal />
        </DacContexProvider>
    )
}