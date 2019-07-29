import React from 'react';
import { Picker } from 'react-native';

export interface MonthDropDownProps {
  monthIndex: number;
  onPress: (monthIndex: number) => void;
}
export const MonthDropDown: React.FC<MonthDropDownProps> = (props) => {
  const months = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ];

  return (
    <Picker
      mode="dropdown"
      selectedValue={props.monthIndex}
      style={{ height: 50, width: 100 }}
      onValueChange={(itemValue: number) => props.onPress(itemValue)}
    >
      {months.map((month, index) => (
        <Picker.Item label={month} value={index} />
      ))}
    </Picker>
  );
};
