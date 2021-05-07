import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { formatSelectedAddress } from '@aph/mobile-patients/src/helpers/helperFunctions';
import moment from 'moment';

export interface BookingInfoProps {
  LOB: 'Diag' | 'Consult' | 'Pharma';
  modifyOrderDetails?: any;
}

export const BookingInfo: React.FC<BookingInfoProps> = (props) => {
  const { LOB, modifyOrderDetails } = props;
  const { addresses, deliveryAddressId, diagnosticSlot } = useDiagnosticsCart();
  const selectedAddress = !!modifyOrderDetails
    ? !!modifyOrderDetails?.patientAddressObj
      ? modifyOrderDetails?.patientAddressObj
      : addresses.find((address) => address?.id == modifyOrderDetails?.patientAddressId)
    : addresses.find((address) => address?.id == deliveryAddressId);

  const renderHeading = () => {
    const slotTime = !!modifyOrderDetails
      ? moment(modifyOrderDetails?.slotDateTimeInUTC).format('hh:mm')
      : diagnosticSlot?.slotStartTime;

    const slotDate = moment(
      !!modifyOrderDetails ? modifyOrderDetails?.slotDateTimeInUTC : diagnosticSlot?.date
    ).format('D MMM, YYYY');

    const msg = LOB == 'Diag' ? `Slot booked for sample collection ${slotTime}, ${slotDate}` : '';
    return <Text style={styles.heading}>{msg}</Text>;
  };

  const renderSubText = () => {
    const subTxt = LOB == 'Diag' ? formatSelectedAddress(selectedAddress!).slice(0, 60) : '';
    return <Text style={styles.subTxt}>{subTxt}</Text>;
  };

  return (
    <View style={styles.card}>
      {renderHeading()}
      {renderSubText()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(0,135,186,0.15)',
    padding: 10,
    borderRadius: 9,
    marginHorizontal: 20,
    marginTop: 15,
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
