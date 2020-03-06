import styles from '@aph/mobile-doctors/src/components/ui/AddIconLabel.styles';
import { AddPlus } from '@aph/mobile-doctors/src/components/ui/Icons';
import React from 'react';
import { StyleProp, Text, TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';

export interface AddIconLabelProps {
  style?: StyleProp<ViewStyle>;
  onPress?: TouchableOpacityProps['onPress'];
  opacity?: number;
  label: string;
}

export const AddIconLabel: React.FC<AddIconLabelProps> = (props) => {
  return (
    <TouchableOpacity
      style={[styles.touchableStyle, { opacity: props.opacity }, props.style]}
      activeOpacity={1}
      onPress={props.onPress}
    >
      <AddPlus />
      <Text style={styles.addText}>{props.label}</Text>
    </TouchableOpacity>
  );
};
