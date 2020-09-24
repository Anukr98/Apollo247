import { Remove } from '@aph/mobile-doctors/src/components/ui/Icons';
import NeedHelpCardStyles from '@aph/mobile-doctors/src/components/ui/NeedHelpCard.styles';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import React, { useEffect, useState } from 'react';
import { Linking, StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import { g } from '@aph/mobile-doctors/src/helpers/helperFunctions';

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
  const { helpLineNumbers, getHelplineNumbers, doctorDetails } = useAuth();
  const [helpNumber, setHelpNumber] = useState<string>('');

  useEffect(() => {
    if (helpLineNumbers === null) {
      getHelplineNumbers();
    } else {
      setHelpNumber(
        g(
          helpLineNumbers.find((i) => g(i, 'doctorType') === g(doctorDetails, 'doctorType')),
          'mobileNumber'
        ) || '04048217273'
      );
    }
  }, [helpLineNumbers]);

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

          <View style={styles.viewStyle}>
            <Text style={styles.labelStyle}>{'For any help, please call'}</Text>
            <Text style={styles.nameStyle}>
              <Text onPress={() => Linking.openURL(`tel:${helpNumber}`)}>{helpNumber}</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
