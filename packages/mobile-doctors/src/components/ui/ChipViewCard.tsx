import React from 'react';
import { StyleProp, Text, TextStyle, View, ViewStyle, TouchableOpacity } from 'react-native';
import ChipViewCardStyles from '@aph/mobile-doctors/src/components/ui/ChipViewCard.styles';

const styles = ChipViewCardStyles;

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
              buttonWidth ? { width: buttonWidth } : {},
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
