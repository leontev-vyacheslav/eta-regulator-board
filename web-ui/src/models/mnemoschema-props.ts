import { SharedRegulatorStateModel } from './regulator-settings/shared-regulator-state-model';

export type MnemoschemaProps = SharedRegulatorStateModel & {
    pumpOn: boolean;
}