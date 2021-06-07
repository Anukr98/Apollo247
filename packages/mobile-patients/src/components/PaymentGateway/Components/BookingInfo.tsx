import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { formatSelectedAddress } from '@aph/mobile-patients/src/helpers/helperFunctions';
import moment from 'moment';

export interface BookingInfoProps {
  LOB: 'diagnostics' | 'consult' | 'Pharma';
  orderDetails: any;
}

export const BookingInfo: React.FC<BookingInfoProps> = (props) => {
  const { LOB, orderDetails } = props;
  const { addresses, deliveryAddressId, diagnosticSlot } = useDiagnosticsCart();
  const selectedAddress = addresses.find((address) => address?.id == deliveryAddressId);

  const renderHeading = () => {
    const msg =
      LOB == 'diagnostics'
        ? `Slot booked for sample collection ${diagnosticSlot?.slotStartTime}, ${moment(
            diagnosticSlot?.date
          ).format('D MMM, YYYY')}`
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

  return LOB == 'diagnostics' || LOB == 'consult' ? (
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
