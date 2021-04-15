/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */

import React, { FC, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Clipboard } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { Payment } from '@aph/mobile-patients/src/strings/strings.json';
import { Success, Failure, Pending, Refund } from '@aph/mobile-patients/src/components/ui/Icons';
import { LocalStrings } from '@aph/mobile-patients/src/strings/LocalStrings';
import { textComponent } from './GenericText';
import ViewInvoice from './ViewInvoice';
import PaymentStatusConstants from '../../constants';
import { Copy } from '@aph/mobile-patients/src/components/ui/Icons';
import { Snackbar } from 'react-native-paper';
import string from '@aph/mobile-patients/src/strings/strings.json';

interface StatusCardProps {
  item: any;
  paymentFor: string;
  patientId?: string;
}

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const StatusCard: FC<StatusCardProps> = (props) => {
  const { SUCCESS, FAILED, REFUND } = PaymentStatusConstants;
  const { paymentFailed, paymentPending, paymentSuccessful, paymentRefund } = LocalStrings;
  const [copiedText, setCopiedText] = useState('');
  const [snackbarState, setSnackbarState] = useState<boolean>(false);
  const copyToClipboard = (refId: string) => {
    Clipboard.setString(refId);
    setSnackbarState(true);
  };

  const statusItemValues = () => {
    const { paymentFor, item } = props;
    let status = 'PENDING';
    let refId = '';
    let price = 0;
    let orderID = '';
    if (paymentFor === 'consult') {
      const {
        appointmentPayments,
        appointmentPaymentOrders,
        actualAmount,
        displayId,
        discountedAmount,
        appointmentRefunds,
      } = item;
      const { refund } = appointmentPaymentOrders;
      const refundInfo = refund?.length ? refund : appointmentRefunds;
      orderID = 'Order ID: ' + String(displayId);
      const paymentInfo = Object.keys(appointmentPaymentOrders).length
        ? appointmentPaymentOrders
        : appointmentPayments[0];
      if (!paymentInfo) {
        status = 'PENDING';
      } else if (refundInfo.length) {
        const { paymentRefId, amountPaid } = paymentInfo;
        refId = paymentRefId;
        price = amountPaid;
        status = REFUND;
      } else {
        const { paymentStatus, paymentRefId, amountPaid } = paymentInfo;
        status = paymentStatus;
        refId = paymentRefId;
        price = amountPaid;
      }
      return {
        status: status,
        refId: refId,
        price: `${string.common.Rs} ` + String(price),
        orderID: orderID,
      };
    } else {
      const { medicineOrderPayments, orderAutoId, currentStatus } = item;
      orderID = 'Order ID: ' + String(orderAutoId);
      if (!medicineOrderPayments.length) {
        status = 'PENDING';
      } else {
        const {
          paymentStatus,
          paymentRefId,
          amountPaid,
          medicineOrderRefunds,
        } = medicineOrderPayments[0];
        status = paymentStatus;
        refId =
          currentStatus === 'CANCELLED' && medicineOrderRefunds.length
            ? medicineOrderRefunds[0].refundId
            : paymentRefId;
        price = amountPaid;
        status =
          currentStatus === 'CANCELLED' && medicineOrderRefunds.length ? REFUND : paymentStatus;
      }
      return {
        status: status,
        refId: refId,
        price: `${string.common.Rs} ` + String(price),
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
  const { refId, price, orderID, status } = statusItemValues();
  const payRefId = 'Payment Ref. Number - ';
  return (
    <View style={[styles.statusCardStyle, { backgroundColor: cardColor }]}>
      <View style={styles.statusCardSubContainerStyle}>{icon}</View>
      <View style={styles.statusStyles}>
        {textComponent(statusText, undefined, textColor, false)}
      </View>
      <View style={styles.orderStyles}>
        {textComponent(price, undefined, theme.colors.SHADE_GREY, false)}
      </View>
      <View style={styles.orderIdStyles}>
        {textComponent(orderID, undefined, theme.colors.SHADE_GREY, false)}
      </View>
      <View style={styles.refIdStyles}>
        {textComponent(payRefId, undefined, theme.colors.SHADE_GREY, false)}
        <TouchableOpacity style={styles.refStyles} onPress={() => copyToClipboard(refId)}>
          {textComponent(refId, undefined, theme.colors.SHADE_GREY, false)}
          <Copy style={styles.iconStyle} />
        </TouchableOpacity>
      </View>
      <ViewInvoice
        status={status}
        item={props.item}
        paymentFor={props.paymentFor}
        patientId={props.patientId}
      />
      <Snackbar
        style={{ position: 'absolute', zIndex: 1001, bottom: -10 }}
        visible={snackbarState}
        onDismiss={() => {
          setSnackbarState(false);
        }}
        duration={1000}
      >
        Copied
      </Snackbar>
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
    margin: 0.06 * windowWidth,
    display: 'flex',
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  statusCardSubContainerStyle: {
    marginVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderStyles: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  statusStyles: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  refIdStyles: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'column',
    marginBottom: 10,
  },
  orderIdStyles: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,
  },
  refStyles: {
    flexDirection: 'row',
  },
  iconStyle: {
    marginLeft: 6,
    marginTop: 5,
    width: 9,
    height: 10,
  },
});

export default StatusCard;
