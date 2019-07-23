import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '@aph/mobile-doctors/src/theme/theme';

const styles = StyleSheet.create({
  container: {
    width: 96,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 4,
    shadowOpacity: 0.3,
    elevation: 4,
  },
  containerUnSelected: {
    backgroundColor: '#ffffff',
  },
  containerSelected: {
    backgroundColor: '#00b38e',
  },
  textStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    textAlign: 'center',
    color: '#00b38e',
  },
  textSelectedStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    textAlign: 'center',
    color: '#ffffff',
  },
});

export interface SelectableButtonProps {
  title: string;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
  containerStyle?: StyleProp<ViewStyle>;
  containerUnSelectedStyle?: StyleProp<ViewStyle>;
  containerSelectedStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<ViewStyle>;
  textSelectedStyle?: StyleProp<ViewStyle>;
  buttonWidth?: number;
}

export const SelectableButton: React.FC<SelectableButtonProps> = (props) => {
  const {
    title,
    isChecked,
    onChange,
    containerStyle,
    containerUnSelectedStyle,
    containerSelectedStyle,
    textStyle,
    textSelectedStyle,
    buttonWidth,
  } = props;
  return (
    <TouchableOpacity
      onPress={() => onChange(!isChecked)}
      style={
        isChecked
          ? [
              styles.container,
              containerStyle,
              styles.containerSelected,
              containerSelectedStyle,
              buttonWidth ? { width: buttonWidth } : {},
            ]
          : [styles.container, containerStyle, styles.containerUnSelected, containerUnSelectedStyle]
      }
    >
      <Text
        style={
          isChecked ? [styles.textSelectedStyle, textSelectedStyle] : [styles.textStyle, textStyle]
        }
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};
