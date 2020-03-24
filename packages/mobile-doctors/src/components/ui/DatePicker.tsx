import { CalendarIcon } from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import Moment from 'moment';
import React, { useState } from 'react';
import {
  Keyboard,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import DateTimePicker, { DateTimePickerProps } from 'react-native-modal-datetime-picker';
import DatePickerStyles from '@aph/mobile-doctors/src/components/ui/DatePicker.styles';

const styles = DatePickerStyles;

export interface DatePickerProps {
  isDateTimePickerVisible?: boolean;
  handleDatePicked?: DateTimePickerProps['onConfirm'];
  hideDateTimePicker?: () => void;
  label?: string;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
  maximumDate?: Date;
  minimumDate?: Date;
  onChangeDate: (arg0: Date) => void;
  mode?: 'date' | 'time' | 'datetime' | undefined;
  showCalendarIcon?: boolean;
  placeholderStyle?: StyleProp<TextStyle>;
  placeholderViewStyle?: StyleProp<ViewStyle>;
  value?: Date | undefined;
}

export const DatePicker: React.FC<DatePickerProps> = (props) => {
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState<boolean>(false);
  const [date, setDate] = useState<string>('');

  return (
    <View style={props.containerStyle}>
      {props.label && (
        <Text
          style={{
            ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE, 0.5, undefined, 0.02),
            marginBottom: 6,
          }}
        >
          {props.label}
        </Text>
      )}
      <TouchableOpacity
        activeOpacity={1}
        style={[styles.placeholderViewStyle, props.placeholderViewStyle]}
        onPress={() => {
          Keyboard.dismiss();
          setIsDateTimePickerVisible(true);
        }}
      >
        <Text
          style={[
            styles.placeholderTextStyle,
            date !== '' ? null : styles.placeholderStyle,
            props.placeholderStyle,
          ]}
        >
          {date !== '' ? date : props.placeholder}
        </Text>
        {props.showCalendarIcon && <CalendarIcon />}
      </TouchableOpacity>

      <DateTimePicker
        date={props.value}
        isVisible={isDateTimePickerVisible}
        onConfirm={(date) => {
          props.handleDatePicked && props.handleDatePicked(date);
          const formatDate = Moment(date).format(
            props.mode && props.mode === 'time' ? 'hh:mm A' : 'DD/MM/YYYY'
          );
          setDate(formatDate);
          props.onChangeDate(date);
          setIsDateTimePickerVisible(false);
          Keyboard.dismiss();
        }}
        onCancel={() => {
          setIsDateTimePickerVisible(false);
          Keyboard.dismiss();
          // props.hideDateTimePicker();
        }}
        minimumDate={props.minimumDate}
        maximumDate={props.maximumDate}
        mode={props.mode || 'date'}
      />
    </View>
  );
};

DatePicker.defaultProps = {
  showCalendarIcon: true,
};
