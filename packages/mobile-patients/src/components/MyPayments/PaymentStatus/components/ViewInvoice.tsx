/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */

import React, { FC } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import PaymentConstants from '../../constants';
import { textComponent } from './GenericText';

interface ViewInvoiceProps {
  item: any;
  paymentFor: string;
  navigationProps?: any;
}
const ViewInvoice: FC<ViewInvoiceProps> = (props) => {
  const { SUCCESS, FAILED, REFUND } = PaymentConstants;
  const statusItemValues = () => {
    const { paymentFor, item } = props;
    let status = 'PENDING';
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
      return { status: null };
    }
  };

  const navigateTo = () => {
    const { status } = statusItemValues();
    const { paymentFor } = props;
    if (paymentFor === 'consult') {
      if (status === SUCCESS) {
        // props.navigationProps.navigate(AppRoutes.Consult, {});
      }
    }
  };
  const { paymentFor } = props;
  const { status } = statusItemValues();
  return status === SUCCESS && paymentFor === 'consult' ? (
    <TouchableOpacity
      onPress={() => {
        navigateTo();
      }}
      style={styles.mainContainer}
    >
      {textComponent('VIEW INVOICE', undefined, theme.colors.APP_YELLOW, false)}
    </TouchableOpacity>
  ) : null;
};

const styles = StyleSheet.create({
  mainContainer: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: 15,
  },
});

export default ViewInvoice;
