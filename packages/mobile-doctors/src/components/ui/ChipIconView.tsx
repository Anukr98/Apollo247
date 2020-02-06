import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { DiagonisisRemove } from '@aph/mobile-doctors/src/components/ui/Icons';
import { Icon } from 'react-native-vector-icons/Icon';

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: 32,
    alignSelf: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: 10,
  },

  containerSelected: {
    backgroundColor: '#00b38e',
    borderRadius: 16,

    // flexWrap: 'wrap',
  },
  iconView: { justifyContent: 'center', paddingRight: 6 },

  textSelectedStyle: {
    color: '#ffffff',
    ...theme.fonts.IBMPlexSansSemiBold(14),
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    paddingLeft: 13,
    paddingTop: 2,
    paddingBottom: 4,
    paddingRight: 13,
    letterSpacing: 0.02,
  },
});

export interface ChipIconViewProps {
  title: string;
  isChecked?: boolean;
  onChange?: (isChecked: boolean) => void;
  containerStyle?: StyleProp<ViewStyle>;
  containerUnSelectedStyle?: StyleProp<ViewStyle>;
  containerSelectedStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<ViewStyle>;
  textSelectedStyle?: StyleProp<ViewStyle>;
  buttonWidth?: number;
  icon?: Element;
  onPress?: TouchableOpacityProps['onPress'];
}

export const ChipIconView: React.FC<ChipIconViewProps> = (props) => {
  const {
    title,
    // isChecked,
    onChange,
    containerStyle,
    containerUnSelectedStyle,
    containerSelectedStyle,
    textStyle,
    textSelectedStyle,
    buttonWidth,
    // iconsPress,
  } = props;
  return (
    <View
      style={[styles.container, containerStyle, styles.containerSelected, containerSelectedStyle]}
    >
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={[styles.textSelectedStyle, textSelectedStyle]} numberOfLines={1}>
          {title}
        </Text>
        <TouchableOpacity onPress={props.onPress} style={styles.iconView}>
          <DiagonisisRemove />
        </TouchableOpacity>
      </View>
    </View>
  );
};
