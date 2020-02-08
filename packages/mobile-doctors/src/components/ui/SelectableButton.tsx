import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle, View } from 'react-native';
import { theme } from '@aph/mobile-doctors/src/theme/theme';

const styles = StyleSheet.create({
  container: {
    //width: 96,
    // paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      height: 1,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 2,
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
    marginTop: 12,
    marginBottom: 12,
    marginRight: 20,
  },
  textSelectedStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    textAlign: 'center',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 12,
    marginRight: 20,
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
  icon?: Element;
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
              { shadowOpacity: 0.4 },
            ]
          : [styles.container, containerStyle, styles.containerUnSelected, containerUnSelectedStyle]
      }
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View
          style={{
            marginTop: 12,
            marginBottom: 12,
            marginLeft: 20,
            marginRight: props.icon ? 12 : 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {props.icon}
        </View>
        <Text
          style={
            isChecked
              ? [styles.textSelectedStyle, textSelectedStyle]
              : [styles.textStyle, textStyle]
          }
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
