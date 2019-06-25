import React from 'react';
import DateTimePicker from 'react-native-modal-datetime-picker';

export interface datePickerProps {
  isDateTimePickerVisible: boolean;
  handleDatePicked: () => null;
  hideDateTimePicker: () => null;
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
