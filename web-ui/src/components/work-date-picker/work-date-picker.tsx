import React from 'react';
import DateBox from 'devextreme-react/date-box';
import { useAppSettings } from '../../contexts/app-settings';
import { WorkDatePickerProps } from '../../models/work-date-picker-props';

const WorkDatePicker = ({ innerRef, onClosed }: WorkDatePickerProps) => {
    const { appSettingsData, setAppSettingsData } = useAppSettings();

    return (
      <DateBox
        ref={ innerRef }
        style={ { width: 0, height: 0 } }
        visible={ true }
        value={ appSettingsData.workDate }
        pickerType={ 'rollers' }
        onClosed={ onClosed }
        onValueChanged={ e => {
          setAppSettingsData({ ...appSettingsData, ...{ workDate: new Date(e.value) } });
        } } />
    );
};

export default React.forwardRef<DateBox, WorkDatePickerProps>((props, ref) =>
  <WorkDatePicker { ...props } innerRef={ ref } />
);
