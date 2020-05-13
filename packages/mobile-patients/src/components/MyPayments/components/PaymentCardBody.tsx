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
}
const PaymentCardBody: FC<PaymentCardBodyProps> = (props) => {
  useEffect(() => {}, []);

  const getPaymentStatus = () => {
    const { SUCCESS, FAILED, REFUND } = PaymentStatusConstants;
    const { status } = props.item;
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
    const { actualAmount } = props.item;
    return (
      <View style={styles.contentViewStyles}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {renderLeftContainer()}
          <Text style={{ ...theme.viewStyles.text('SB', 13, textColor, 1, 20, 0.5) }}>{text}</Text>
        </View>
        <View>
          <Text style={{ ...theme.viewStyles.text('M', 14, colors.CARD_HEADER, 1, 20) }}>
            Rs. {actualAmount}
          </Text>
        </View>
      </View>
    );
  };
  const lowerSection = () => {
    const { displayId } = props.item;
    return (
      <View style={styles.lowerView}>
        <View>
          <Text style={{ ...theme.viewStyles.text('M', 13, colors.SHADE_GREY, 1, 20, 0.5) }}>
            Payment Ref Number - {displayId}
          </Text>
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
  const { status, appointmentDateTime } = props.item;
  const borderRadiusValue = status === 'PAYMENT_REFUND' || !appointmentDateTime ? 0 : 10;
  return (
    <View
      style={{
        ...styles.mainContainer,
        borderTopRightRadius: borderRadiusValue,
        borderTopLeftRadius: borderRadiusValue,
      }}
    >
      {renderContainer()}
    </View>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    display: 'flex',
    backgroundColor: colors.LIGHT_GRAY,
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
