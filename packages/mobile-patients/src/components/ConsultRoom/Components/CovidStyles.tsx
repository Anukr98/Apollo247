import { IconBase } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';

const { height } = Dimensions.get('window');

interface Props {
  onPress: () => void;
  title: string;
  iconbase: IconBase;
}
const CovidButton = (props: Props) => (
  <TouchableOpacity
    style={{
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
    }}
    activeOpacity={0.5}
    onPress={props.onPress}
  >
    <View
      style={{
        flex: 0.17,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      <props.iconbase style={{ width: 20, height: 20 }} />
    </View>
    <View
      style={{
        flex: 0.83,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      {props.title === 'Call an Apollo Doctor' ? (
        <Text style={[theme.viewStyles.text('SB', 12, theme.colors.APP_YELLOW, 1, 18)]}>
          {props.title}
        </Text>
      ) : (
        <Text style={[theme.viewStyles.text('SB', 14, theme.colors.APP_YELLOW, 1, 18)]}>
          {props.title}
        </Text>
      )}
    </View>
    {/* <View style={{ left: 4, right: 4 }}> */}
    {/* </View> */}
  </TouchableOpacity>
);
// eslint-disable-next-line import/no-default-export
export default CovidButton;
