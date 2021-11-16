import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { LinearGradientComponent } from '@aph/mobile-patients/src/components/ui/LinearGradientComponent';
import {
  WhatsappIcon,
  WhatsAppBannerDoctorIcon,
  ApolloPharmacyIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';

export const WhatsappRedirectionBanner = () => {
  const message = "I'm interested in placing a medicine order";
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          Linking.openURL(`https://api.whatsapp.com/send/?text=${message}&phone=91${'4048218743'}`);
        }}
      >
        <LinearGradientComponent style={{ height: 137 }} colors={['#FFF6DE', '#FFDDD6']}>
          <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingLeft: 14,
              }}
            >
              <Text style={styles.mainTextStyle}>
                Yay! Now you can<Text style={styles.highlightedTextStyle}> Whatsapp</Text> to Order
              </Text>
              <ApolloPharmacyIcon style={{ height: 41, marginRight: 9 }} />
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.whatsappContainer}>
                <View style={{ width: '80%', paddingBottom: 10 }}>
                  <Text style={styles.subTextStyle}>
                    You can get 20% CASHBACK on your first order + FREE DELIVERY.
                  </Text>
                </View>

                <View style={styles.buttonStyle}>
                  <Text style={styles.buttonTextStyle}>Whatsapp @ +91 -9810098100 </Text>
                  <WhatsappIcon style={{ height: 18, width: 18 }} />
                </View>
              </View>
              <View style={{ width: '35%' }}>
                <WhatsAppBannerDoctorIcon style={styles.doctorIconStyle} />
              </View>
            </View>
          </View>
        </LinearGradientComponent>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 5,
  },
  mainTextStyle: {
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 24,
    color: theme.colors.SHERPA_BLUE,
    fontWeight: '600',
    marginTop: 10,
  },
  highlightedTextStyle: {
    ...theme.fonts.IBMPlexSansRegular(13),
    color: theme.colors.APP_YELLOW,
  },
  subTextStyle: {
    ...theme.fonts.IBMPlexSansRegular(10),
    lineHeight: 14,
    color: theme.colors.CARD_HEADER,
    flexWrap: 'wrap',
  },
  buttonStyle: {
    flexDirection: 'row',
    backgroundColor: theme.colors.APP_YELLOW,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: 38,
    width: 220,
  },
  buttonTextStyle: {
    ...theme.fonts.IBMPlexSansBold(12),
    lineHeight: 14,
    color: theme.colors.HEX_WHITE,
    fontWeight: '600',
    paddingRight: 4,
  },
  whatsappContainer: {
    flexDirection: 'column',
    paddingLeft: 14,
    width: '65%',
    zIndex: 1,
  },
  doctorIconStyle: { height: 95, minWidth: 112, zIndex: 0 },
});
