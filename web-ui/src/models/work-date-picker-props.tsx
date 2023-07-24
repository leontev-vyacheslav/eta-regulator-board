import { EventInfo } from 'devextreme/events';
import dxDateBox from 'devextreme/ui/date_box';
import DateBox from 'devextreme-react/date-box';
import { Ref } from 'react';

export type WorkDatePickerProps = {
  innerRef?:  Ref<DateBox>,
  onClosed: ((e: EventInfo<dxDateBox>) => void) | undefined
}
