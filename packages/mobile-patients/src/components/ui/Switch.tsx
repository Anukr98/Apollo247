import React from 'react';
import { View, ViewStyle, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

export interface SwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  pathColor?: { left: string; right: string };
  containerStyle?: ViewStyle;
  switchStyle?: ViewStyle;
  dotColor?: { left: string; right: string };
  dotBorderColor?: { left: string; right: string };
}

export const Switch: React.FC<SwitchProps> = (props) => {
  const {
    value,
    onChange,
    pathColor,
    containerStyle,
    switchStyle,
    dotColor,
    dotBorderColor,
  } = props;
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => {
        onChange && onChange(!value);
      }}
    >
      <View
        style={[
          {
            width: 32,
            height: 10,
            backgroundColor: value
              ? (pathColor && pathColor.right) || theme.colors.APP_YELLOW
              : (pathColor && pathColor.left) || theme.colors.APP_GREEN,
            borderRadius: 10,
            justifyContent: 'center',

            alignItems: value ? 'flex-end' : 'flex-start',
          },
          containerStyle,
        ]}
      >
        <View
          style={[
            {
              height: 20,
              width: 20,
              borderRadius: 100,
              backgroundColor: value ? dotColor?.right || 'white' : dotColor?.left || 'white',
              borderWidth: 2,
              borderColor: value
                ? dotBorderColor?.right || 'white'
                : dotBorderColor?.left || 'white',
            },
            switchStyle,
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};
