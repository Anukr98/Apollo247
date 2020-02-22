import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { ArrowRight } from '@aph/mobile-patients/src/components/ui/Icons';

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.cardViewStyle,
    ...theme.viewStyles.shadowStyle,
    padding: 16,
    marginHorizontal: 20,
    flexDirection: 'row',
    height: 56,
    marginTop: 4,
    marginBottom: 4,
    alignItems: 'center',
  },
  titleStyle: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    paddingHorizontal: 16,
  },
});

export interface ListCardProps {
  title?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  container?: StyleProp<ViewStyle>;
  onPress?: TouchableOpacityProps['onPress'];
}

export const ListCard: React.FC<ListCardProps> = (props) => {
  const { title, leftIcon, rightIcon } = props;

  return (
    <TouchableOpacity activeOpacity={1} onPress={props.onPress}>
      <View style={[styles.container, props.container]}>
        {leftIcon}
        <View style={{ flex: 1 }}>
          <Text style={styles.titleStyle}>{title}</Text>
        </View>
        {rightIcon ? rightIcon : <ArrowRight />}
      </View>
    </TouchableOpacity>
  );
};
