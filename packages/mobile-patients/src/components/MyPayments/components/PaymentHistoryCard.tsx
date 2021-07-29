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
  patientId?: string;
  fromNotification?: boolean;
}
const PaymentHistoryCard: FC<PaymentHistoryCardProps> = (props) => {
  useEffect(() => {
    if (props.fromNotification) {
      const { id, item, lastIndex, index, paymentFor, patientId } = props;
      const appointmentId = props.navigationProps.getParam('appointmentId');
      if (id === appointmentId) {
        props.navigationProps.navigate(AppRoutes.PaymentStatusScreen, {
          item: item,
          paymentFor: paymentFor,
          status: 'TXN_REFUND',
          patientId: patientId,
        });
      }
    }
  }, []);
  const renderHeader = () => {
    if (paymentFor === 'consult') {
      const { status, appointmentRefunds, PaymentOrders } = item;
      const { refund } = PaymentOrders;
      const refundInfo = refund?.length ? refund : appointmentRefunds;
      if (status === 'CANCELLED' && refundInfo.length) {
        return <PaymentCardHeader status={status} />;
      }
    } else if (paymentFor === 'pharmacy') {
      const { currentStatus, medicineOrderPayments, PaymentOrdersPharma } = item;
      const { refund } = PaymentOrdersPharma;
      const refundInfo = refund?.length ? refund : medicineOrderPayments[0]?.medicineOrderRefunds;
      if (currentStatus === 'CANCELLED' && refundInfo?.length) {
        return <PaymentCardHeader status={currentStatus} />;
      }
    } else {
      return null;
    }
  };
  const { id, item, lastIndex, index, paymentFor, patientId } = props;

  const getAmountPaid = () => {
    if (paymentFor === 'consult') {
      const { appointmentPayments, PaymentOrders } = item;
      const paymentInfo = PaymentOrders?.paymentStatus ? PaymentOrders : appointmentPayments[0];
      if (!paymentInfo) {
        return 0;
      } else {
        const { amountPaid } = paymentInfo;
        return amountPaid;
      }
    } else if (paymentFor === 'pharmacy') {
      const { medicineOrderPayments, PaymentOrdersPharma } = item;
      const paymentInfo = PaymentOrdersPharma?.paymentStatus
        ? PaymentOrdersPharma
        : medicineOrderPayments[0];
      if (!paymentInfo) {
        return 0;
      } else {
        const { amountPaid } = paymentInfo;
        return amountPaid;
      }
    }
  };

  if (getAmountPaid() != 0) {
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
          patientId={patientId}
        />
        <PaymentCardFooter
          item={item}
          paymentFor={paymentFor}
          navigationProps={props.navigationProps}
        />
      </View>
    );
  } else {
    return null;
  }
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
