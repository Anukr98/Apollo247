import { IconBase } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
  Image,
  ImageStyle,
} from 'react-native';
import string from '@aph/mobile-patients/src/strings/strings.json';

const { height } = Dimensions.get('window');

interface Props {
  onPress: () => void;
  title: string;
  iconBase: IconBase;
  iconUrl?: string;
  buttonStyle?: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<ViewStyle | ImageStyle>;
  btnTitleStyle?: StyleProp<ViewStyle>;
}
const CovidButton = (props: Props) => {
  const iconStyle = [styles.iconStyle, props.iconStyle];
  return (
    <TouchableOpacity
      style={[styles.buttonStyle, props.buttonStyle]}
      activeOpacity={0.5}
      onPress={props.onPress}
    >
      <View style={styles.viewStyle}>
        {props.iconUrl ? (
          <Image source={{ uri: props.iconUrl }} style={iconStyle} />
        ) : (
          <props.iconBase style={iconStyle} />
        )}
      </View>
      <View style={styles.viewSubContainer}>
        <Text style={[styles.titleStyle, props.btnTitleStyle]}>{props.title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonStyle: {
    shadowColor: '#4c808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: '#fff',
    flexDirection: 'row',
    height: 43,
    marginTop: 16,
    borderRadius: 10,
  },
  viewStyle: {
    flex: 0.17,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  viewSubContainer: {
    flex: 0.83,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  titleStyle: {
    ...theme.viewStyles.text('SB', 14, theme.colors.APP_YELLOW, 1, 18),
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});
// eslint-disable-next-line import/no-default-export
export default CovidButton;
