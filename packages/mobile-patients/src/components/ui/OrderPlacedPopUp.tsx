import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { MedicineIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import moment from 'moment';

export interface OrderPlacedPopUpProps {
  deliveryTime: any;
  orderAutoId: string;
  onPressViewInvoice: () => void;
  onPressTrackOrder: () => void;
}

export const OrderPlacedPopUp: React.FC<OrderPlacedPopUpProps> = (props) => {
  const { deliveryTime, orderAutoId, onPressTrackOrder, onPressViewInvoice } = props;

  const deliveryTimeMomentFormat = moment(
    deliveryTime,
    AppConfig.Configuration.TAT_API_RESPONSE_DATE_FORMAT
  );

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <MedicineIcon />
        <Text style={styles.MedicinesText}>Medicines</Text>
        <Text style={styles.orderIdText}>{`#${orderAutoId}`}</Text>
      </View>
    );
  };

  const renderDeliveryTime = () => {
    return deliveryTimeMomentFormat.isValid() ? (
      <>
        <View style={styles.deliveryTimeBorder} />
        <View>
          <Text style={styles.deliveryTimeText}>
            {deliveryTime &&
              `Delivery By: ${deliveryTimeMomentFormat.format(
                AppConfig.Configuration.MED_DELIVERY_DATE_DISPLAY_FORMAT
              )}`}
          </Text>
        </View>
      </>
    ) : null;
  };

  const renderFooter = () => {
    return (
      <View>
        <View style={styles.footerBorder} />
        <View style={styles.popupButtonStyle}>
          <TouchableOpacity style={{ flex: 1 }} onPress={onPressViewInvoice}>
            <Text style={styles.popupButtonTextStyle}>VIEW INVOICE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1, alignItems: 'flex-end' }} onPress={onPressTrackOrder}>
            <Text style={styles.popupButtonTextStyle}>TRACK ORDER</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderDeliveryTime()}
      {renderFooter()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f7f8f5',
    borderRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  MedicinesText: {
    flex: 1,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
    color: '#01475b',
  },
  orderIdText: {
    flex: 1,
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 24,
    color: '#01475b',
    textAlign: 'right',
  },
  deliveryTimeBorder: {
    height: 1,
    backgroundColor: '#02475b',
    opacity: 0.1,
    marginBottom: 7.5,
    marginTop: 15.5,
  },
  footerBorder: {
    height: 1,
    backgroundColor: '#02475b',
    opacity: 0.1,
    marginBottom: 15.5,
    marginTop: 7.5,
  },
  deliveryTimeText: {
    ...theme.viewStyles.text('M', 12, '#02475b', 0.6, 20, 0.04),
  },
  popupButtonTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    color: theme.colors.APP_YELLOW,
    lineHeight: 24,
  },
  popupButtonStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
