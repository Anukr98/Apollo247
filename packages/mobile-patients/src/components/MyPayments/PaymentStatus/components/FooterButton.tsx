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
      const { appointmentPayments } = item;
      if (!appointmentPayments.length) {
        status = 'PENDING';
      } else {
        status = appointmentPayments[0].paymentStatus;
      }
      return {
        status: status,
      };
    } else {
      const { medicineOrderPayments, orderAutoId } = item;
      orderID = orderAutoId;
      if (!medicineOrderPayments.length) {
        status = 'PENDING';
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
        props.navigationProps.navigate(AppRoutes.YourCart, {});
      } else if (status === SUCCESS) {
        props.navigationProps.navigate(AppRoutes.OrderDetailsScene, {
          goToHomeOnBack: true,
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
