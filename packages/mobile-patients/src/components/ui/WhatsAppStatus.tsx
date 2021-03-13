import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { theme } from '../../theme/theme';
import {
  CheckBoxFilled,
  CheckBox,
  WhatsAppIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';

const styles = StyleSheet.create({
  headerView: {
    flex: 1,
    backgroundColor: 'transparent',
    marginHorizontal: 20,
    marginTop: 15,
    flexDirection: 'row',
  },
  titleStyles: {
    color: theme.colors.SHERPA_BLUE,
    textAlign: 'left',
    ...theme.fonts.IBMPlexSansMedium(13),
    letterSpacing: 0,
    paddingLeft: 0,
    paddingRight: 5,
    marginTop: Platform.OS === 'ios' ? -1 : -3,
  },
});

export interface WhatsAppStatusProps {
  style?: StyleProp<ViewStyle>;
  isSelected: boolean;
  onPress: () => void;
}

export const WhatsAppStatus: React.FC<WhatsAppStatusProps> = (props) => {
  const { style, isSelected } = props;
  const [whatsAppUpdate, setWhatsAppUpdate] = useState<boolean>(false);

  useEffect(() => {
    setWhatsAppUpdate(isSelected);
  }, [isSelected]);

  return (
    <View style={[styles.headerView, style]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          props.onPress();
        }}
        style={{ width: 25, height: 25 }}
      >
        {whatsAppUpdate ? (
          <CheckBoxFilled style={{ width: 18, height: 18 }} resizeMode={'contain'} />
        ) : (
          <CheckBox style={{ width: 18, height: 18 }} resizeMode={'contain'} />
        )}
      </TouchableOpacity>
      <Text style={styles.titleStyles}>Receive status updates on</Text>
      <WhatsAppIcon
        style={{ width: 10, height: 10, marginTop: Platform.OS === 'ios' ? 3 : 3, marginRight: 5 }}
        resizeMode={'contain'}
      />
      <Text style={styles.titleStyles}>Whatsapp</Text>
    </View>
  );
};
