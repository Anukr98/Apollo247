import { AphOverlay } from '@aph/mobile-doctors/src/components/ui/AphOverlay';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacityProps, View, ViewStyle } from 'react-native';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import NeedHelpCardStyles from '@aph/mobile-doctors/src/components/ui/NeedHelpCard.styles';

const styles = NeedHelpCardStyles;

export interface NeedHelpCardProps {
  heading?: string;
  descriptionTextStyle?: StyleProp<ViewStyle>;
  description?: string;
  onPress?: TouchableOpacityProps['onPress'];
  overlayStyle?: StyleProp<ViewStyle>;
}

export const NeedHelpCard: React.FC<NeedHelpCardProps> = (props) => {
  const data = [
    {
      label: 'SPOC for Apollo Hyderabad Doctors',
      name: 'Ms. Sreevani  |  7702700910 ',
      email: 'sreevani_u@apollohospitals.com',
    },
    {
      label: 'SPOC for Apollo Chennai Doctors',
      name: 'Mr. Sreekanth  |  09941134567',
      email: 'edocmh_cni@apollohospitals.com',
    },
    {
      label: 'SPOC for ATHS Doctors',
      name: 'Call Centre  |  18001021066',
      email: 'mrc_support@healthnet-global.com',
    },
  ];
  return (
    <AphOverlay
      isVisible
      onClose={props.onPress}
      overlayStyle={{ marginHorizontal: 40, marginTop: 74 }}
    >
      <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 20 }}>
        <Text style={styles.headingText}>{strings.need_help.need_help_q.toLowerCase()}</Text>
        {data.map((item, i) => (
          <View style={i + 1 !== data.length && styles.viewStyle}>
            <Text style={styles.labelStyle}>{item.label}</Text>
            <Text style={styles.nameStyle}>{item.name}</Text>
            <Text style={styles.emailStyle}>{item.email}</Text>
          </View>
        ))}
      </View>
    </AphOverlay>
  );
};
