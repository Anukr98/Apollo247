import React from 'react';
import DateTimePicker, { DateTimePickerProps } from 'react-native-modal-datetime-picker';

export interface DatePickerProps {
  date?: Date;
  time?: boolean;
  isDateTimePickerVisible: boolean;
  maximumDate?: boolean;
  minimumDate?: Date;
  handleDatePicked: DateTimePickerProps['onConfirm'];
  hideDateTimePicker: () => void;
}

export const DatePicker: React.FC<DatePickerProps> = (props) => {
  return (
    <DateTimePicker
      mode={props.time ? 'time' : 'date'}
      date={props.date}
      isVisible={props.isDateTimePickerVisible}
      onConfirm={props.handleDatePicked}
      onCancel={props.hideDateTimePicker}
      minimumDate={props.minimumDate}
      maximumDate={props.maximumDate ? new Date() : undefined}
      display={'spinner'}
    />
  );
};

DatePicker.defaultProps = {
  maximumDate: true,
};
