import { View, StyleProp, ViewStyle, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { theme } from '../../theme/theme';

const styles = StyleSheet.create({
  containerStyles: {
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.BUTTON_BG,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledStyle: {
    backgroundColor: theme.colors.BUTTON_DISABLED_BG,
  },
  titleTextStyle: {
    ...theme.fonts.IBMPlexSansBold(14),
    color: theme.colors.BUTTON_TEXT,
  },
});

export interface buttonProps {
  style: StyleProp<ViewStyle>;
  titleTextStyle: StyleProp<ViewStyle>;
  title: string;
  onPress: () => null;
  disabled: boolean;
}

export const Button: React.FC<buttonProps> = (props) => {
  return (
    <TouchableOpacity
      style={[styles.containerStyles, props.style, props.disabled ? styles.disabledStyle : null]}
      onPress={props.onPress}
    >
      <Text style={[styles.titleTextStyle, props.titleTextStyle]}>{props.title}</Text>
    </TouchableOpacity>
  );
};
