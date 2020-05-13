import React, { FC } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { Payment } from '@aph/mobile-patients/src/strings/strings.json';
import { Success, Failure, Pending, Refund } from '@aph/mobile-patients/src/components/ui/Icons';
import { LocalStrings } from '@aph/mobile-patients/src/strings/LocalStrings';
import { textComponent } from './GenericText';

interface StatusCardProps {
  refNo: string;
  displayId: string;
  price: string;
  status: string;
}

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const StatusCard: FC<StatusCardProps> = (props) => {
  const { refNo, displayId, price } = props;
  const { success, failure, pending, refund } = Payment;
  const { paymentFailed, paymentPending, paymentSuccessful, paymentRefund } = LocalStrings;
  const refNumberText = '     Ref.No : ' + String(refNo != '' && refNo != null ? refNo : '--');
  const orderIdText = 'Order ID: ' + String(displayId);
  const priceText = 'Rs. ' + String(price);

  const getStatusItems = () => {
    const { status } = props;
    //TODO: get status type value for pending
    console.log('status-->', status, pending);
    switch (status) {
      case success:
        return {
          icon: <Success style={styles.statusIconStyles} />,
          cardColor: colors.SUCCESS,
          statusText: paymentSuccessful,
          textColor: theme.colors.SUCCESS_TEXT,
        };
      case failure:
        return {
          icon: <Failure style={styles.statusIconStyles} />,
          cardColor: colors.FAILURE,
          statusText: paymentFailed,
          textColor: theme.colors.FAILURE_TEXT,
        };
      case 'PAYMENT_PENDING':
        return {
          icon: <Pending style={styles.statusIconStyles} />,
          cardColor: colors.PENDING,
          statusText: paymentPending,
          textColor: theme.colors.PENDING_TEXT,
        };
      case refund:
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
          icon: null,
          cardColor: '',
          statusText: '',
          textColor: '',
        };
    }
  };

  const { icon, cardColor, statusText, textColor } = getStatusItems();
  return (
    <View style={[styles.statusCardStyle, { backgroundColor: cardColor }]}>
      <View style={styles.statusCardSubContainerStyle}>{icon}</View>
      <View style={styles.statusStyles}>
        {textComponent(statusText, undefined, textColor, false)}
      </View>
      <View style={styles.orderStyles}>
        {textComponent(priceText, undefined, theme.colors.SHADE_GREY, false)}
      </View>
      <View style={styles.orderStyles}>
        {textComponent(refNumberText, undefined, theme.colors.SHADE_GREY, false)}
      </View>
      <View style={{ flex: 0.25, justifyContent: 'flex-start', alignItems: 'center' }}>
        {textComponent(orderIdText, undefined, theme.colors.SHADE_GREY, false)}
      </View>
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
