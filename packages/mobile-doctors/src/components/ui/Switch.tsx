import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

export interface SwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  pathColor?: { left: string; right: string };
  containerStyle?: ViewStyle;
  switchStyle?: ViewStyle;
}

export const Switch: React.FC<SwitchProps> = (props) => {
  const { value, onChange, pathColor, containerStyle, switchStyle } = props;
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
            height: 17,
            backgroundColor: value
              ? (pathColor && pathColor.right) || theme.colors.APP_YELLOW
              : (pathColor && pathColor.left) || theme.colors.APP_GREEN,
            borderRadius: 100,
            justifyContent: 'center',
            padding: 2,
            alignItems: value ? 'flex-end' : 'flex-start',
          },
          containerStyle,
        ]}
      >
        <View
          style={[
            { height: 13, width: 13, borderRadius: 100, backgroundColor: 'white' },
            switchStyle,
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};
