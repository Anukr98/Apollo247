/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */

import React, { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import PaymentConstants from '../../constants';

interface FooterButtonProps {
  item: any;
  paymentFor: string;
  navigationProps: any;
}
const FooterButton: FC<FooterButtonProps> = (props) => {
  const { SUCCESS, FAILED, REFUND } = PaymentConstants;
  const statusItemValues = () => {
    const { paymentFor, item } = props;
    let status = 'PENDING';
    let orderID = 0;
    if (paymentFor === 'consult') {
      const { appointmentPayments, appointmentRefunds, appointmentPaymentOrders } = item;
      const paymentInfo = Object.keys(appointmentPaymentOrders).length
        ? appointmentPaymentOrders
        : appointmentPayments[0];
      if (!paymentInfo) {
        status = 'PENDING';
      } else if (appointmentRefunds.length) {
        status = REFUND;
      } else {
        status = paymentInfo?.paymentStatus;
      }
      return {
        status: status,
      };
    } else {
      const { medicineOrderPayments, orderAutoId, currentStatus } = item;
      const { medicineOrderRefunds } = medicineOrderPayments[0];
      orderID = orderAutoId;
      if (!medicineOrderPayments.length) {
        status = 'PENDING';
      } else if (currentStatus === 'CANCELLED' && medicineOrderRefunds.length) {
        status = REFUND;
      } else {
        status = medicineOrderPayments[0].paymentStatus;
      }
      return {
        status: status,
        orderID: orderID,
      };
    }
  };
  const getTitle = () => {
    const { paymentFor } = props;
    const { status } = statusItemValues();
    let buttonTitle = 'TRY AGAIN';
    if (paymentFor === 'consult') {
      if (status === FAILED) {
        buttonTitle = 'TRY AGAIN';
        return { buttonTitle: buttonTitle };
      } else if (status === SUCCESS) {
        buttonTitle = 'VIEW CONSULT DETAILS';
        return { buttonTitle: buttonTitle };
      } else {
        buttonTitle = 'GO TO HOME';
        return { buttonTitle: buttonTitle };
      }
    } else {
      if (status === FAILED) {
        buttonTitle = 'TRY AGAIN';
        return { buttonTitle: buttonTitle };
      } else if (status === SUCCESS) {
        buttonTitle = 'TRACK ORDER';
        return { buttonTitle: buttonTitle };
      } else {
        buttonTitle = 'GO TO HOME';
        return { buttonTitle: buttonTitle };
      }
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
        props.navigationProps.navigate(AppRoutes.ConsultRoom, {});
      }
    } else {
      if (status === FAILED) {
        props.navigationProps.navigate(AppRoutes.MedicineCart, {});
      } else if (status === SUCCESS) {
        props.navigationProps.navigate(AppRoutes.OrderDetailsScene, {
          orderAutoId: orderID,
        });
      } else {
        props.navigationProps.navigate(AppRoutes.ConsultRoom, {});
      }
    }
  };
  const { buttonTitle } = getTitle();
  return (
    <View style={styles.mainContainer}>
      <Button
        style={styles.buttonStyles}
        title={buttonTitle}
        onPress={() => {
          navigateTo();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    display: 'flex',
    alignItems: 'center',
    marginVertical: 15,
  },
  buttonStyles: {
    width: '80%',
  },
});

export default FooterButton;
