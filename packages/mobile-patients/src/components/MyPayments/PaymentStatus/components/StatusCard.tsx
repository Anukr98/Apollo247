/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */

import React, { FC } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { Payment } from '@aph/mobile-patients/src/strings/strings.json';
import { Success, Failure, Pending, Refund } from '@aph/mobile-patients/src/components/ui/Icons';
import { LocalStrings } from '@aph/mobile-patients/src/strings/LocalStrings';
import { textComponent } from './GenericText';
import ViewInvoice from './ViewInvoice';
import PaymentStatusConstants from '../../constants';

interface StatusCardProps {
  item: any;
  paymentFor: string;
}

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const StatusCard: FC<StatusCardProps> = (props) => {
  const { SUCCESS, FAILED, REFUND } = PaymentStatusConstants;
  const { paymentFailed, paymentPending, paymentSuccessful, paymentRefund } = LocalStrings;
  const statusItemValues = () => {
    const { paymentFor, item } = props;
    let status = 'PENDING';
    let refId = '';
    let price = 0;
    let orderID = '';
    if (paymentFor === 'consult') {
      const { appointmentPayments, actualAmount, displayId } = item;
      price = actualAmount;
      orderID = 'Order ID: ' + String(displayId);
      if (!appointmentPayments.length) {
        status = 'PENDING';
      } else {
        status = appointmentPayments[0].paymentStatus;
        refId = appointmentPayments[0].paymentRefId;
      }
      return {
        status: status,
        refId: refId,
        price: 'Rs. ' + String(price),
        orderID: orderID,
      };
    } else {
      const { medicineOrderPayments, devliveryCharges, estimatedAmount, orderAutoId } = item;
      price = estimatedAmount + devliveryCharges;
      orderID = 'Order ID: ' + String(orderAutoId);
      if (!medicineOrderPayments.length) {
        status = 'PENDING';
      } else {
        status = medicineOrderPayments[0].paymentStatus;
        refId = medicineOrderPayments[0].paymentRefId;
      }
      return {
        status: status,
        refId: refId,
        price: 'Rs. ' + String(price),
        orderID: orderID,
      };
    }
  };
  const getStatusItems = () => {
    const { status } = statusItemValues();
    //TODO: get status type value for pending
    switch (status) {
      case SUCCESS:
        return {
          icon: <Success style={styles.statusIconStyles} />,
          cardColor: colors.SUCCESS,
          statusText: paymentSuccessful,
          textColor: theme.colors.SUCCESS_TEXT,
        };
      case FAILED:
        return {
          icon: <Failure style={styles.statusIconStyles} />,
          cardColor: colors.FAILURE,
          statusText: paymentFailed,
          textColor: theme.colors.FAILURE_TEXT,
        };
      case REFUND:
        return {
          icon: (
            <View style={styles.refundIconStyles}>
              <Refund />
            </View>
          ),
          cardColor: colors.REFUND,
          statusText: paymentRefund,
          textColor: theme.colors.REFUND_TEXT,
        };
      default:
        return {
          icon: <Pending style={styles.statusIconStyles} />,
          cardColor: colors.PENDING,
          statusText: paymentPending,
          textColor: theme.colors.PENDING_TEXT,
        };
    }
  };

  const { icon, cardColor, statusText, textColor } = getStatusItems();
  const { refId, price, orderID } = statusItemValues();
  const payRefId = 'Payment Ref. Number - ' + refId.slice(0, 6);
  return (
    <View style={[styles.statusCardStyle, { backgroundColor: cardColor }]}>
      <View style={styles.statusCardSubContainerStyle}>{icon}</View>
      <View style={styles.statusStyles}>
        {textComponent(statusText, undefined, textColor, false)}
      </View>
      <View style={styles.orderStyles}>
        {textComponent(price, undefined, theme.colors.SHADE_GREY, false)}
      </View>
      <View style={styles.orderStyles}>
        {textComponent(payRefId, undefined, theme.colors.SHADE_GREY, false)}
      </View>
      <View style={{ flex: 0.25, justifyContent: 'flex-start', alignItems: 'center' }}>
        {textComponent(orderID, undefined, theme.colors.SHADE_GREY, false)}
      </View>
      <ViewInvoice item={props.item} paymentFor={props.paymentFor} />
    </View>
  );
};

const styles = StyleSheet.create({
  statusIconStyles: {
    width: 45,
    height: 45,
  },
  refundIconStyles: {
    paddingVertical: 15,
  },
  statusCardStyle: {
    height: 0.27 * windowHeight,
    margin: 0.06 * windowWidth,
    flex: 1,
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  statusCardSubContainerStyle: {
    flex: 0.22,
    marginVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderStyles: {
    flex: 0.18,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  statusStyles: {
    flex: 0.15,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});

export default StatusCard;
