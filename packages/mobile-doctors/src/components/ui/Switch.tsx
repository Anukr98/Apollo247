import React, { useState } from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { theme } from '@aph/mobile-doctors/src/theme/theme';

export interface SwitchProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
  pathColor?: { left: string; right: string };
  containerStyle?: ViewStyle;
  switchStyle?: ViewStyle;
}

export const Switch: React.FC<SwitchProps> = (props) => {
  const { value, onChange, pathColor, containerStyle, switchStyle } = props;
  const [switchValue, setSwitchValue] = useState<boolean>(value || false);
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => {
        setSwitchValue(!switchValue);
        onChange && onChange(!switchValue);
      }}
    >
      <View
        style={[
          {
            width: 32,
            height: 17,
            backgroundColor: switchValue
              ? (pathColor && pathColor.right) || theme.colors.APP_YELLOW
              : (pathColor && pathColor.left) || theme.colors.APP_GREEN,
            borderRadius: 100,
            justifyContent: 'center',
            padding: 2,
            alignItems: switchValue ? 'flex-end' : 'flex-start',
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
