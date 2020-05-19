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

import { colors } from '../../../theme/colors';
import PaymentCardHeader from './PaymentCardHeader';
import PaymentCardBody from './PaymentCardBody';
import PaymentCardFooter from './PaymentCardFooter';

interface PaymentHistoryCardProps {
  id: string;
  item: any;
  index: number;
  lastIndex: boolean;
  paymentFor: string;
  navigationProps: any;
}
const PaymentHistoryCard: FC<PaymentHistoryCardProps> = (props) => {
  useEffect(() => {}, []);
  const renderHeader = () => {
    const { status, appointmentDateTime } = item;
    if (status === 'PAYMENT_REFUND' || !appointmentDateTime) {
      return <PaymentCardHeader status={status} />;
    }
  };
  const { id, item, lastIndex, index, paymentFor } = props;
  return (
    <View
      style={{
        ...styles.mainContainer,
        marginBottom: lastIndex ? 35 : 10,
        marginTop: index === 0 ? 25 : 10,
      }}
    >
      {renderHeader()}
      <PaymentCardBody
        item={item}
        paymentFor={paymentFor}
        navigationProps={props.navigationProps}
      />
      <PaymentCardFooter
        item={item}
        paymentFor={paymentFor}
        navigationProps={props.navigationProps}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 10,
    backgroundColor: colors.WHITE,
    shadowColor: '#4c808080',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
});

export default PaymentHistoryCard;
