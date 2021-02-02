import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { ArrowRight } from '@aph/mobile-patients/src/components/ui/Icons';

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.cardViewStyle,
    ...theme.viewStyles.shadowStyle,
    padding: 16,
    height: 57,
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 4,
    justifyContent: 'center',
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
  titleStyle?: StyleProp<TextStyle>;
  leftTitle?: string;
  leftTitleStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

export const ListCardAbout: React.FC<ListCardProps> = (props) => {
  const { title, leftIcon, rightIcon, leftTitle, leftTitleStyle, titleStyle, children } = props;

  return (
    <TouchableOpacity activeOpacity={1} onPress={props.onPress}>
      <View style={[styles.container, props.container]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {leftIcon}
          <View style={{ flex: 1 }}>
            <Text style={[styles.titleStyle, leftTitleStyle]}>
              {leftTitle}
              <Text style={[styles.titleStyle, titleStyle]}>{title}</Text>
            </Text>
          </View>
          {rightIcon ? rightIcon : <ArrowRight />}
        </View>
        {children}
      </View>
    </TouchableOpacity>
  );
};
