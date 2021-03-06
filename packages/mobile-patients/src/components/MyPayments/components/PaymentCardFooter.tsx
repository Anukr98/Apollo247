/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */
import React, { FC, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { colors } from '../../../theme/colors';
import { getDate } from '@aph/mobile-patients/src/utils/dateUtil';
import CardFooterButton from './CardFooterButton';
import PaymentConstants from '../constants';

interface PaymentCardFooterProps {
  item: any;
  paymentFor: string;
  navigationProps: any;
}
const PaymentCardFooter: FC<PaymentCardFooterProps> = (props) => {
  const { SUCCESS, FAILED, REFUND } = PaymentConstants;
  const PaymentModes: any = {
    DEBIT_CARD: 'Debit Card',
    CREDIT_CARD: 'Credit Card',
    NET_BANKING: 'Net Banking',
    PAYTM_WALLET: 'Paytm Wallet',
    EMI: 'EMI',
    UPI: 'UPI',
    PAYTM_POSTPAID: 'Paytm Postpaid',
    COD: 'COD',
  };
  useEffect(() => {}, []);
  const statusItemValues = () => {
    const { paymentFor, item } = props;
    let leftHeaderText = '';
    let dateAndTime = '';
    let type = '';
    let status = '';
    let orderID = 0;
    let aptType = '';
    if (paymentFor === 'consult') {
      const {
        appointmentDateTime,
        appointmentPayments,
        PaymentOrders,
        doctor,
        appointmentType,
        appointmentRefunds,
        orderType,
        subscriptionOrderDetails,
      } = item;
      const { refund } = PaymentOrders;
      const refundInfo = refund?.length ? refund : appointmentRefunds;
      leftHeaderText =
        orderType === 'CONSULT'
          ? 'Dr. ' + doctor.name
          : subscriptionOrderDetails?.plan_id?.toUpperCase();
      type = appointmentType === 'ONLINE' ? 'Online Consult' : 'Clinic Visit';
      aptType = appointmentType;
      const paymentInfo = subscriptionOrderDetails?.status
        ? subscriptionOrderDetails?.status
        : PaymentOrders?.paymentStatus
        ? PaymentOrders
        : appointmentPayments[0];
      if (!paymentInfo) {
        status = 'PENDING';
        return {
          leftHeaderText: leftHeaderText,
          dateAndTime: getDate(appointmentDateTime),
          type: type,
          status: status,
          aptType: aptType,
          orderType,
        };
      } else if (refundInfo?.length) {
        status = 'TXN_REFUND';
        return {
          leftHeaderText: leftHeaderText,
          dateAndTime: getDate(appointmentDateTime),
          type: type,
          status: status,
          aptType: aptType,
          orderType,
        };
      } else {
        status = paymentInfo?.paymentStatus;
        return {
          leftHeaderText: leftHeaderText,
          dateAndTime:
            orderType === 'CONSULT'
              ? getDate(appointmentDateTime)
              : getDate(subscriptionOrderDetails?.transaction_date_time),
          type: type,
          status: status,
          aptType: aptType,
          orderType,
        };
      }
    } else {
      const {
        medicineOrderPayments,
        orderAutoId,
        orderDateTime,
        currentStatus,
        PaymentOrdersPharma,
      } = item;
      const { refund } = PaymentOrdersPharma;
      const refundInfo = refund?.length ? refund : medicineOrderPayments[0]?.medicineOrderRefunds;
      const paymentInfo = PaymentOrdersPharma?.paymentStatus
        ? PaymentOrdersPharma
        : medicineOrderPayments[0];
      orderID = orderAutoId;
      dateAndTime = orderDateTime;
      if (!paymentInfo) {
        type = '';
        status = 'PENDING';
        return {
          leftHeaderText: 'Order No. - ' + orderAutoId,
          dateAndTime: dateAndTime,
          type: type,
          status: status,
          orderID: orderID,
          aptType: aptType,
        };
      } else {
        const { paymentType, paymentMode } = paymentInfo;
        type = !paymentMode ? paymentType : PaymentModes[paymentMode];
        status =
          currentStatus === 'CANCELLED' && refundInfo?.length ? REFUND : paymentInfo?.paymentStatus;
        return {
          leftHeaderText: 'Order No. - ' + orderAutoId,
          dateAndTime: getDate(dateAndTime),
          type: type,
          status: status,
          orderID: orderID,
          aptType: aptType,
        };
      }
    }
  };
  const upperSection = () => {
    const { leftHeaderText, status } = statusItemValues();
    const showStatus = status === 'TXN_REFUND' ? 'Cancelled' : null;
    return (
      <View style={styles.contentViewStyles}>
        <View>
          <Text style={{ ...theme.viewStyles.text('M', 16, colors.CARD_HEADER, 1, 20, 0) }}>
            {leftHeaderText}
          </Text>
        </View>
        <View>
          <Text style={{ ...theme.viewStyles.text('M', 12, colors.FAILURE_TEXT, 1, 20, 0.04) }}>
            {showStatus}
          </Text>
        </View>
      </View>
    );
  };
  const lowerSection = () => {
    const { dateAndTime, type, orderType } = statusItemValues();
    return (
      <View style={styles.lowerView}>
        <View>
          <Text style={{ ...theme.viewStyles.text('M', 12, colors.CARD_HEADER, 0.6, 20, 0.04) }}>
            {dateAndTime}
          </Text>
        </View>
        {orderType === 'CONSULT' ? (
          <View>
            <Text style={{ ...theme.viewStyles.text('M', 12, colors.CARD_HEADER, 0.6, 20, 0.04) }}>
              {type}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };
  const getTitle = () => {
    const { paymentFor } = props;
    const { status, aptType } = statusItemValues();
    let buttonTitle = 'TRY AGAIN';
    if (paymentFor === 'consult') {
      if (status === SUCCESS) {
        buttonTitle = aptType === 'ONLINE' ? 'START CONSULTATION' : 'VIEW CONSULT DETAILS';
        return { buttonTitle: buttonTitle };
      }
      buttonTitle = 'TRY AGAIN';
      return { buttonTitle: buttonTitle };
    } else {
      if (status === SUCCESS) {
        buttonTitle = 'TRACK ORDER';
        return { buttonTitle: buttonTitle };
      }
      buttonTitle = 'TRY AGAIN';
      return { buttonTitle: buttonTitle };
    }
  };
  const navigateTo = () => {
    const { status, orderID } = statusItemValues();
    const { paymentFor } = props;
    if (paymentFor === 'consult') {
      if (status === FAILED) {
        props.navigationProps.navigate(AppRoutes.DoctorSearch, {});
      } else if (status === SUCCESS) {
        props.navigationProps.navigate(AppRoutes.Consult, {});
      } else {
        props.navigationProps.navigate(AppRoutes.HomeScreen, {});
      }
    } else {
      if (status === FAILED) {
        props.navigationProps.navigate(AppRoutes.ServerCart, {});
      } else if (status === SUCCESS) {
        props.navigationProps.navigate(AppRoutes.OrderDetailsScene, {
          orderAutoId: orderID,
        });
      } else {
        props.navigationProps.navigate(AppRoutes.HomeScreen, {});
      }
    }
  };
  const renderButton = () => {
    const { paymentFor, item } = props;
    const { status } = statusItemValues();
    const { buttonTitle } = getTitle();
    if (paymentFor === 'consult') {
      const { appointmentRefunds, PaymentOrders } = item;
      const { refund } = PaymentOrders;
      const refundInfo = refund?.length ? refund : appointmentRefunds;
      if ((status === SUCCESS || status === FAILED) && refundInfo?.length < 1) {
        return <CardFooterButton buttonTitle={buttonTitle} onPressAction={navigateTo} />;
      } else {
        return null;
      }
    } else {
      if (status === SUCCESS || status === FAILED) {
        return <CardFooterButton buttonTitle={buttonTitle} onPressAction={navigateTo} />;
      }
    }
  };

  return (
    <View style={styles.mainContainer}>
      {upperSection()}
      {lowerSection()}
      {renderButton()}
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
