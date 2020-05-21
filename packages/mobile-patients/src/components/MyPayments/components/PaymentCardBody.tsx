/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */
import React, { FC, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { colors } from '../../../theme/colors';
import {
  SuccessIcon,
  FailedIcon,
  RefundIcon,
  PendingIcon,
  ArrowRight,
} from '@aph/mobile-patients/src/components/ui/Icons';
import PaymentStatusConstants from '../constants';
import { LocalStrings } from '@aph/mobile-patients/src/strings/LocalStrings';

interface PaymentCardBodyProps {
  item: any;
  paymentFor: string;
  navigationProps: any;
  patientId?: string;
}
const PaymentCardBody: FC<PaymentCardBodyProps> = (props) => {
  useEffect(() => {}, []);
  const statusItemValues = () => {
    const { paymentFor, item } = props;
    let status = 'PENDING';
    let refId = '';
    let price = 0;
    if (paymentFor === 'consult') {
      const { appointmentPayments, actualAmount, discountedAmount } = item;
      price = actualAmount - discountedAmount;
      if (!appointmentPayments.length) {
        status = 'PENDING';
      } else {
        status = appointmentPayments[0].paymentStatus;
        refId = appointmentPayments[0].paymentRefId;
      }
      return { status: status, refId: refId, price: price };
    } else {
      const { medicineOrderPayments, devliveryCharges, estimatedAmount } = item;
      price = estimatedAmount + devliveryCharges;
      if (!medicineOrderPayments.length) {
        status = 'PENDING';
      } else {
        status = medicineOrderPayments[0].paymentStatus;
        refId = medicineOrderPayments[0].paymentRefId;
      }
      return { status: status, refId: refId, price: price };
    }
  };
  const getPaymentStatus = () => {
    const { SUCCESS, FAILED, REFUND } = PaymentStatusConstants;
    const { status } = statusItemValues();
    const { paymentFailed, paymentPending, paymentSuccessful, paymentRefund } = LocalStrings;
    const { SUCCESS_TEXT, PENDING_TEXT, FAILURE_TEXT, REFUND_TEXT } = colors;
    switch (status) {
      case SUCCESS:
        return { component: <SuccessIcon />, text: paymentSuccessful, textColor: SUCCESS_TEXT };
      case FAILED:
        return { component: <FailedIcon />, text: paymentFailed, textColor: FAILURE_TEXT };
      case REFUND:
        return { component: <RefundIcon />, text: paymentRefund, textColor: REFUND_TEXT };
      default:
        return { component: <PendingIcon />, text: paymentPending, textColor: PENDING_TEXT };
    }
  };
  const renderLeftContainer = () => {
    const { component } = getPaymentStatus();
    return <View style={styles.iconStyle}>{component}</View>;
  };
  const upperSection = () => {
    const { text, textColor } = getPaymentStatus();
    const { price } = statusItemValues();
    return (
      <View style={styles.contentViewStyles}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {renderLeftContainer()}
          <Text style={{ ...theme.viewStyles.text('SB', 13, textColor, 1, 20, 0.5) }}>{text}</Text>
        </View>
        <View>
          <Text style={{ ...theme.viewStyles.text('M', 14, colors.CARD_HEADER, 1, 20) }}>
            Rs. {price}
          </Text>
        </View>
      </View>
    );
  };
  const lowerSection = () => {
    const { refId } = statusItemValues();
    return (
      <View style={styles.lowerView}>
        <View>
          <Text
            style={{ ...theme.viewStyles.text('M', 13, colors.SHADE_GREY, 1, 20, 0.5) }}
            numberOfLines={1}
            ellipsizeMode="tail"
          ></Text>
        </View>
        <View>
          <ArrowRight />
        </View>
      </View>
    );
  };
  const renderContainer = () => {
    return (
      <View style={styles.rightContainerStyles}>
        {upperSection()}
        {lowerSection()}
      </View>
    );
  };

  const goToPaymentStatus = () => {
    const { status } = statusItemValues();
    const { item, paymentFor, patientId } = props;
    props.navigationProps.navigate(AppRoutes.PaymentStatusScreen, {
      item: item,
      paymentFor: paymentFor,
      status: status,
      patientId: patientId,
    });
  };
  const { status } = statusItemValues();
  const borderRadiusValue = status === 'TXN_REFUND' ? 0 : 10;
  return (
    <TouchableOpacity
      style={{
        ...styles.mainContainer,
        borderTopRightRadius: borderRadiusValue,
        borderTopLeftRadius: borderRadiusValue,
      }}
      onPress={() => {
        goToPaymentStatus();
      }}
    >
      {renderContainer()}
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    display: 'flex',
    backgroundColor: colors.PALE_LIGHT_GRAY,
    paddingHorizontal: 10,
  },
  iconStyle: {
    marginRight: 11,
    alignItems: 'center',
  },
  rightContainerStyles: {
    display: 'flex',
    flexDirection: 'column',
    paddingVertical: 19,
    paddingLeft: 11,
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
    marginLeft: 34,
    marginTop: 5,
  },
});

export default PaymentCardBody;
