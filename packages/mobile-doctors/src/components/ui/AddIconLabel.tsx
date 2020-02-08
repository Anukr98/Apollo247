import { AddPlus } from '@aph/mobile-doctors/src/components/ui/Icons';
import React from 'react';
import { StyleProp, Text, TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';

export interface AddIconLabelProps {
  style?: StyleProp<ViewStyle>;
  onPress?: TouchableOpacityProps['onPress'];
  opacity?: number;
  label: string;
}

export const AddIconLabel: React.FC<AddIconLabelProps> = (props) => {
  return (
    <TouchableOpacity
      style={[
        {
          flexDirection: 'row',
          marginTop: 18,
          marginLeft: 20,
          alignItems: 'center',
          opacity: props.opacity,
        },
        props.style,
      ]}
      activeOpacity={1}
      onPress={props.onPress}
    >
      <AddPlus />
      <Text
        style={{
          ...theme.viewStyles.yellowTextStyle,
          fontSize: 14,
          marginLeft: 8,
        }}
      >
        {props.label}
      </Text>
    </TouchableOpacity>
  );
};
