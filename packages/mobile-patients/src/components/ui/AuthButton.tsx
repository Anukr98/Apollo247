import React from 'react';
import { StyleSheet, TouchableOpacity, Text, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Truecaller } from '@aph/mobile-patients/src/components/ui/Icons';

interface AuthButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  btnTitleStyle?: StyleProp<ViewStyle>;
  icon?: any;
}

export const AuthButton: React.FC<AuthButtonProps> = (props) => {
  const { onPress, style, btnTitleStyle, icon } = props;
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      {icon ? icon : <Truecaller />}
      <Text style={[styles.btnText, btnTitleStyle]}>One Tap Login with Truecaller</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 44,
    borderRadius: 7,
    backgroundColor: theme.colors.TRUECALLER_THEME,
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    ...theme.viewStyles.text('M', 12, theme.colors.WHITE),
    marginLeft: 12,
  },
});
