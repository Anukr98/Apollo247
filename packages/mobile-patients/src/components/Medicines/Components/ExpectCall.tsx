import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Apollo247 } from '@aph/mobile-patients/src/components/ui/Icons';

export interface ExpectCallProps {}

export const ExpectCall: React.FC<ExpectCallProps> = (props) => {
  const renderMsg = () => {
    return (
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTxt}>Expect a call from 140 3456789, that’s us!</Text>
        <Text style={styles.bodyTxt} numberOfLines={2}>
          Our Pharmacists may call you to verify your prescription around{' '}
          <Text style={styles.headerTxt}>2PM TODAY.</Text>
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <Apollo247 style={styles.apollo247Icon} />
      {renderMsg()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginBottom: 30,
    marginHorizontal: 20,
    borderRadius: 5,
    paddingVertical: 9,
    flexDirection: 'row',
    borderColor: '#02475B',
    borderWidth: 0.5,
    alignItems: 'center',
  },
  apollo247Icon: {
    marginHorizontal: 5,
    height: 48,
    width: 48,
  },
  headerTxt: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 16,
    color: '#01475B',
  },
  bodyTxt: {
    ...theme.fonts.IBMPlexSansRegular(10),
    lineHeight: 13,
    color: '#01475B',
    marginTop: 5,
  },
});
