import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  formatSelectedAddress,
  isEmptyObject,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import moment from 'moment';

export interface BookingInfoProps {
  LOB: 'diagnostics' | 'consult' | 'Pharma' | 'vaccine';
  orderDetails: any;
  modifyOrderDetails?: any;
}

export const BookingInfo: React.FC<BookingInfoProps> = (props) => {
  const { LOB, orderDetails, modifyOrderDetails } = props;
  const isDiagnosticModifyFlow = !!modifyOrderDetails && !isEmptyObject(modifyOrderDetails);
  const { addresses, deliveryAddressId, diagnosticSlot } = useDiagnosticsCart();
  const selectedAddress = isDiagnosticModifyFlow
    ? !!modifyOrderDetails?.patientAddressObj
      ? modifyOrderDetails?.patientAddressObj
      : addresses.find((address) => address?.id == modifyOrderDetails?.patientAddressId)
    : addresses.find((address) => address?.id == deliveryAddressId);

  const renderHeading = () => {
    const slotTime = isDiagnosticModifyFlow
      ? moment(modifyOrderDetails?.slotDateTimeInUTC).format('hh:mm')
      : diagnosticSlot?.slotStartTime;

    const slotDate = moment(
      isDiagnosticModifyFlow ? modifyOrderDetails?.slotDateTimeInUTC : diagnosticSlot?.date
    ).format('D MMM, YYYY');

    const msg =
      LOB == 'diagnostics'
        ? `Slot booked for sample collection ${slotTime}, ${slotDate}`
        : LOB == 'consult'
        ? `${orderDetails?.doctorName}'s appointment on ${moment(
            orderDetails?.appointmentDateTime
          ).format('DD MMM YYYY, h:mm A')} `
        : '';
    return <Text style={styles.heading}>{msg}</Text>;
  };

  const renderSubText = () => {
    const subTxt = LOB == 'diagnostics' ? formatSelectedAddress(selectedAddress!).slice(0, 60) : '';
    return !!subTxt ? <Text style={styles.subTxt}>{subTxt}</Text> : null;
  };

  return LOB == 'consult' || LOB == 'diagnostics' ? (
    <View style={styles.card}>
      {renderHeading()}
      {renderSubText()}
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(0,135,186,0.15)',
    padding: 10,
    borderRadius: 9,
    marginHorizontal: 20,
    marginTop: 15,
    alignItems: 'center',
  },
  heading: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
    color: '#01475B',
  },
  subTxt: {
    ...theme.fonts.IBMPlexSansRegular(11),
    lineHeight: 20,
    color: '#01475B',
  },
});
