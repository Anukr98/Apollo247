import React from 'react';
import DateTimePicker, { DateTimePickerProps } from 'react-native-modal-datetime-picker';

export interface DatePickerProps {
  isDateTimePickerVisible: boolean;
  handleDatePicked: DateTimePickerProps['onConfirm'];
  hideDateTimePicker: () => void;
  date?: Date;
}

export const DatePicker: React.FC<DatePickerProps> = (props) => {
  return (
    <DateTimePicker
      isVisible={props.isDateTimePickerVisible}
      onConfirm={props.handleDatePicked}
      onCancel={props.hideDateTimePicker}
      maximumDate={new Date()}
      date={props.date}
    />
  );
};
