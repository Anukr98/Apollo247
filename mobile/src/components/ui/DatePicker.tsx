import React from 'react';
import DateTimePicker, { DateTimePickerProps } from 'react-native-modal-datetime-picker';

export interface datePickerProps {
  isDateTimePickerVisible: boolean;
  handleDatePicked: DateTimePickerProps['onConfirm'];
  hideDateTimePicker: () => void;
}

export const DatePicker: React.FC<datePickerProps> = (props) => {
  return (
    <DateTimePicker
      isVisible={props.isDateTimePickerVisible}
      onConfirm={props.handleDatePicked}
      onCancel={props.hideDateTimePicker}
    />
  );
};
