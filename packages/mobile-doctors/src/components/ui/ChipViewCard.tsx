import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    //width: 96,
    // paddingVertical: 12,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    height: 24,
  },
  containerUnSelected: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderColor: '#00b38e',
    borderWidth: 1,
  },
  containerSelected: {
    backgroundColor: '#00b38e',
    borderRadius: 14,
  },
  textStyle: {
    color: '#00b38e',
    ...theme.fonts.IBMPlexSans(12),
    textAlign: 'center',
    justifyContent: 'center',
    paddingLeft: 13,
    paddingTop: 2,
    paddingBottom: 4,
    paddingRight: 13,
    letterSpacing: 0.02,
  },
  textSelectedStyle: {
    color: '#ffffff',
    ...theme.fonts.IBMPlexSansSemiBold(12),
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    paddingLeft: 13,
    paddingTop: 2,
    paddingBottom: 4,
    paddingRight: 13,
    letterSpacing: 0.02,
  },
});

export interface ChipViewCardProps {
  title: string;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
  containerStyle?: StyleProp<ViewStyle>;
  containerUnSelectedStyle?: StyleProp<ViewStyle>;
  containerSelectedStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  textSelectedStyle?: StyleProp<TextStyle>;
  buttonWidth?: number;
  icon?: Element;
}

export const ChipViewCard: React.FC<ChipViewCardProps> = (props) => {
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
      activeOpacity={1}
      onPress={() => onChange(!isChecked)}
      style={
        isChecked
          ? [
              styles.container,
              containerStyle,
              styles.containerSelected,
              containerSelectedStyle,
              // buttonWidth ? { width: buttonWidth } : {},
            ]
          : [styles.container, containerStyle, styles.containerUnSelected, containerUnSelectedStyle]
      }
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
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
