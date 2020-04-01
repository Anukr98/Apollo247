import React from 'react';
import DateTimePicker, { DateTimePickerProps } from 'react-native-modal-datetime-picker';

export interface DatePickerProps {
  date?: Date;
  isDateTimePickerVisible: boolean;
  handleDatePicked: DateTimePickerProps['onConfirm'];
  hideDateTimePicker: () => void;
}

export const DatePicker: React.FC<DatePickerProps> = (props) => {
  return (
    <DateTimePicker
      date={props.date}
      isVisible={props.isDateTimePickerVisible}
      onConfirm={props.handleDatePicked}
      onCancel={props.hideDateTimePicker}
      maximumDate={new Date()}
      datePickerModeAndroid={'spinner'}
    />
  );
};
