import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Apollo247 } from '@aph/mobile-patients/src/components/ui/Icons';

export interface ExpectCallProps {}

export const ExpectCall: React.FC<ExpectCallProps> = (props) => {
  const renderMsg = () => {
    return (
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTxt}>Expect a call from 040 48212890, that’s us!</Text>
        <Text style={styles.bodyTxt} numberOfLines={2}>
          Our pharmacist will call you to verify the prescription in the next 15 minutes. Working
          hours between 8 am and 9 pm
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
    ...theme.fonts.IBMPlexSansSemiBold(14),
    lineHeight: 18,
    color: '#01475B',
    paddingRight: 5,
  },
  bodyTxt: {
    ...theme.fonts.IBMPlexSansRegular(10),
    lineHeight: 13,
    color: '#01475B',
    marginTop: 5,
    paddingRight: 5,
  },
});
