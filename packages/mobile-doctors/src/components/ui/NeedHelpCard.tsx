import { Remove } from '@aph/mobile-doctors/src/components/ui/Icons';
import NeedHelpCardStyles from '@aph/mobile-doctors/src/components/ui/NeedHelpCard.styles';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import React from 'react';
import { Linking, StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

const styles = NeedHelpCardStyles;

export interface NeedHelpCardProps {
  heading?: string;
  descriptionTextStyle?: StyleProp<ViewStyle>;
  description?: string;
  onPress?: () => void;
  overlayStyle?: StyleProp<ViewStyle>;
}
type helpData = {
  label?: string;
  name?: string;
  number?: string;
  email?: string;
}[];

export const NeedHelpCard: React.FC<NeedHelpCardProps> = (props) => {
  const data: helpData = [
    {
      label: 'For any help, please call',
      // name: 'Ms. Sreevani  |  ',
      number: '04048217273',
      // email: 'sreevani_u@apollohospitals.com',
    },
    // {
    //   label: 'SPOC for Apollo Chennai Doctors',
    //   name: 'Mr. Sreekanth  |  ',
    //   number: '09941134567',
    //   email: 'edocmh_cni@apollohospitals.com',
    // },
    // {
    //   label: 'SPOC for ATHS Doctors',
    //   name: 'Call Centre  |  ',
    //   number: '18001021066',
    //   email: 'mrc_support@healthnet-global.com',
    // },
  ];
  const { onPress } = props;
  return (
    <View style={styles.mainView}>
      <View
        style={{
          paddingHorizontal: 30,
        }}
      >
        <View
          style={{
            alignItems: 'flex-end',
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              onPress && onPress();
            }}
            style={styles.touchableCloseIcon}
          >
            <Remove style={styles.closeIcon} />
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 20 }}>
          <Text style={styles.headingText}>{strings.need_help.need_help_q.toLowerCase()}</Text>
          {data.map((item, i) => (
            <View style={i + 1 !== data.length && styles.viewStyle}>
              <Text style={styles.labelStyle}>{item.label}</Text>
              <Text style={styles.nameStyle}>
                {item.name || ''}
                <Text onPress={() => Linking.openURL(`tel:${item.number}`)}>{item.number}</Text>
              </Text>
              <Text style={styles.emailStyle}>{item.email}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
