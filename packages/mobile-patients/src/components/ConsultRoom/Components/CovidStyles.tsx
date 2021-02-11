import { IconBase } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import string from '@aph/mobile-patients/src/strings/strings.json';

const { height } = Dimensions.get('window');

interface Props {
  onPress: () => void;
  title: string;
  iconbase: iconBase;
}
const CovidButton = (props: Props) => (
  <TouchableOpacity style={styles.buttonStyle} activeOpacity={0.5} onPress={props.onPress}>
    <View style={styles.viewStyle}>
      <props.iconbase style={{ width: 20, height: 20 }} />
    </View>
    <View style={styles.viewSubContainer}>
      {props.title === string.common.callDoctor ? (
        <Text style={[theme.viewStyles.text('SB', 12, theme.colors.APP_YELLOW, 1, 18)]}>
          {props.title}
        </Text>
      ) : (
        <Text style={[theme.viewStyles.text('SB', 14, theme.colors.APP_YELLOW, 1, 18)]}>
          {props.title}
        </Text>
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  buttonStyle: {
    shadowColor: '#4c808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: '#fff',
    flexDirection: 'row',
    height: 0.06 * height,
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
  textStyle :{
    {[theme.viewStyles.text('SB', 12, theme.colors.APP_YELLOW, 1, 18)]}
  }
});
// eslint-disable-next-line import/no-default-export
export default CovidButton;
