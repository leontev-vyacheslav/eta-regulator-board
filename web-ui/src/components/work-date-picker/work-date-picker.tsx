import React from 'react';
import DateBox from 'devextreme-react/date-box';
import { useAppSettings } from '../../contexts/app-settings';
import { WorkDatePickerProps } from '../../models/work-date-picker-props';
import { useRtcDataTimeData } from '../../contexts/app-data/use-rtc-datetime-data';

const WorkDatePicker = ({ innerRef, onClosed }: WorkDatePickerProps) => {
  const { putRtcDateTimeAsync } = useRtcDataTimeData();
    const { appSettingsData, setAppSettingsData } = useAppSettings();

    return (
      <DateBox
        ref={ innerRef }
        style={ { width: 0, height: 0 } }
        visible={ true }
        type='datetime'
        value={ appSettingsData.workDate }
        pickerType={ 'rollers' }
        onClosed={ onClosed }
        onValueChanged={ async (e) => {
          const dt = new Date(e.value)

          await putRtcDateTimeAsync({
            datetime: dt
          });

          setAppSettingsData({ ...appSettingsData, ...{ workDate: dt } });
        } } />
    );
};

export default React.forwardRef<DateBox, WorkDatePickerProps>((props, ref) =>
  <WorkDatePicker { ...props } innerRef={ ref } />
);
