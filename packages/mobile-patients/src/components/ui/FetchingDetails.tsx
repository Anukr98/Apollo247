import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { Loader } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
const { height, width } = Dimensions.get('window');

export const FetchingDetails = () => {
  return (
    <View style={styles.viewAbsoluteStyles}>
      <View style={styles.container}>
        <ApolloLogo />
        <Loader style={{ marginTop: 12, height: 26, width: 76 }} />
        <Text style={styles.pleaseWaitText}>Please Wait!</Text>
        <Text style={styles.description}>{`While we're fetching\nyour details`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAbsoluteStyles: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 20,
  },
  pleaseWaitText: {
    marginTop: 22,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansBold(17),
    lineHeight: 24,
    textAlign: 'center',
  },
  description: {
    marginTop: 4,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansRegular(17),
    lineHeight: 24,
    textAlign: 'center',
  },
});
