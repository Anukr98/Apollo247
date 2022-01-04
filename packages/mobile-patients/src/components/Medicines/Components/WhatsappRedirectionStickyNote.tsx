import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Linking } from 'react-native';
import { LinearGradientComponent } from '@aph/mobile-patients/src/components/ui/LinearGradientComponent';
import { WhatsappIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

export const WhatsappRedirectionStickyNote = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const windowHeight = Dimensions.get('window').height;
  const message = AppConfig.Configuration.WHATSAPP_TO_ORDER.whatsappMessage;
  const phoneNumber = AppConfig.Configuration.WHATSAPP_TO_ORDER.whatsappNumber;

  return (
    <View style={[styles.container, { top: 0.3 * windowHeight }]}>
      {isExpanded ? (
        <View>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(
                `https://api.whatsapp.com/send/?text=${message}&phone=91${phoneNumber}`
              );
            }}
          >
            <LinearGradientComponent
              style={styles.linearGradientStyle}
              colors={['#2782A1', '#0E6D88']}
            >
              <View style={styles.container}>
                <View style={styles.whatsappContentContainer}>
                  <View style={{ flexDirection: 'row' }}>
                    <WhatsappIcon style={styles.iconStyle} />
                    <View style={{ marginTop: 5, marginHorizontal: 7 }}>
                      <Text style={styles.textStyle}>Whatsapp to Order at</Text>
                      <Text style={styles.phoneNumberStyle}>+91-{phoneNumber}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setIsExpanded(!isExpanded);
                    }}
                  >
                    <View style={styles.crossIconContainer}>
                      <Text style={styles.crossIconStyle}>+</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradientComponent>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.closedViewStyle, { height: 46, width: 48 }]}>
          <TouchableOpacity
            onPress={() => {
              setIsExpanded(!isExpanded);
            }}
          >
            <WhatsappIcon style={styles.iconStyle} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  linearGradientStyle: {
    height: 58,
    width: 200,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  container: {
    position: 'absolute',
    right: 0,
  },
  whatsappContentContainer: {
    flexDirection: 'row',
    padding: 5,
    justifyContent: 'space-between',
  },
  closedViewStyle: {
    backgroundColor: '#0E6088',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.97,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  iconStyle: {
    width: 27,
    height: 27,
    margin: 4,
  },
  textStyle: {
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 14,
    color: theme.colors.HEX_WHITE,
    fontWeight: '700',
    paddingBottom: 7,
  },
  phoneNumberStyle: {
    ...theme.fonts.IBMPlexSansRegular(14),
    lineHeight: 14,
    color: theme.colors.HEX_WHITE,
    fontWeight: '500',
  },
  crossIconContainer: {
    marginRight: 3,
    transform: [{ rotate: '45deg' }],
  },
  crossIconStyle: {
    color: theme.colors.HEX_WHITE,
    fontSize: 25,
    top: -7,
  },
});
