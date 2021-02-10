import { IconBase } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

interface Props {
  onPress: () => void;
  title: string;
  iconbase : IconBase;
}
const CovidButton = (props: Props) => (
        <TouchableOpacity
        style={{flexDirection:'row'}} activeOpacity={0.5}
        onPress={props.onPress}>
        <props.iconbase style={{ width: 20, height: 20 }}/>
        <View style={{left:4,right:4}}>
        <Text style={[theme.viewStyles.text('SB', 14, theme.colors.APP_YELLOW, 1, 18)]}>{props.title}</Text>
        </View>
        </TouchableOpacity>
);
// eslint-disable-next-line import/no-default-export
export default CovidButton;
