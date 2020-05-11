/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */
import React, { FC, useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { NavigationScreenProps } from 'react-navigation';
import { colors } from '../../../theme/colors';

interface PaymentCardFooterProps {}
const PaymentCardFooter: FC<PaymentCardFooterProps> = (props) => {
  useEffect(() => {}, []);
  const upperSection = () => {
    return (
      <View style={styles.contentViewStyles}>
        <View>
          <Text>Hello</Text>
        </View>
        <View>
          <Text style={{ color: colors.CARD_HEADER }}>Rs. </Text>
        </View>
      </View>
    );
  };
  const lowerSection = () => {
    return (
      <View style={styles.lowerView}>
        <View>
          <Text>Payment Ref Number</Text>
        </View>
        <View>
          <Text>Hello</Text>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      {upperSection()}
      {lowerSection()}
    </View>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  contentViewStyles: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lowerView: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
  },
});

export default PaymentCardFooter;
