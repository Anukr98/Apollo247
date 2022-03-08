import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

const styles = StyleSheet.create({
  cardContainer: {
    ...theme.viewStyles.cardViewStyle,
    margin: 16,
    padding: 16,
  },
  descriptiontext: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(14),
    textAlign: 'left',
  },
  separator: {
    borderBottomColor: '#02475b',
    borderBottomWidth: 1,
    marginVertical: 7.5,
    opacity: 0.1,
  },
});

export type Option = {
  icon?: Element;
  optionText: string;
  onPress?: () => void;
};

export interface DropDownProps {
  cardContainer?: StyleProp<ViewStyle>;
  options: Option[];
  selectedOptionIndex?: number;
}

export const DropDown: React.FC<DropDownProps> = (props) => {
  return (
    <View style={[styles.cardContainer, props.cardContainer]}>
      {props.options.map((option, index, array) => {
        return (
          <TouchableOpacity activeOpacity={0.5} key={index} onPress={option.onPress}>
            <View style={{ flexDirection: 'row' }}>
              <View>{option.icon ? option.icon : null}</View>
              <Text style={[styles.descriptiontext, props.selectedOptionIndex == index ? {} : {}]}>
                {option.optionText}
              </Text>
            </View>
            <View
              style={[styles.separator, index == array.length - 1 ? { marginBottom: 0 } : {}]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
