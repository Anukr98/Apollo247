import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Linking } from 'react-native';
import { WhatsAppIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
const whatsappScheme = `whatsapp://send?text=${AppConfig.Configuration.CUSTOMER_CARE_HELP_TEXT}&phone=91${AppConfig.Configuration.CUSTOMER_CARE_NUMBER}`;
interface ChatWithUsProps {}

export const ChatWithUs: React.FC<ChatWithUsProps> = (props) => {
  return (
    <View style={styles.chatWithUsView}>
      <TouchableOpacity
        style={styles.chatWithUsTouch}
        onPress={() => {
          Linking.canOpenURL(whatsappScheme)
            .then((supported) =>
              Linking.openURL(
                supported
                  ? whatsappScheme
                  : AppConfig.Configuration.MED_ORDERS_CUSTOMER_CARE_WHATSAPP_LINK
              )
            )
            .catch((err) => CommonBugFender(`${AppRoutes.OrderModifiedScreen}_TATBreach`, err));
        }}
      >
        <WhatsAppIcon style={styles.whatsappIconStyle} />
        <Text style={styles.chatWithUsText}>{string.OrderSummery.chatWithUs}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  chatWithUsView: { paddingBottom: 10, paddingTop: 4 },
  chatWithUsTouch: { flexDirection: 'row', justifyContent: 'flex-end' },
  whatsappIconStyle: { height: 24, width: 24, resizeMode: 'contain' },
  chatWithUsText: {
    textAlign: 'center',
    paddingRight: 0,
    marginHorizontal: 5,
    ...theme.viewStyles.text('B', 14, '#FC9916'),
  },
});
