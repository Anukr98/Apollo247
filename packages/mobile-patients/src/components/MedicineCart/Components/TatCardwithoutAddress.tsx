import React, { useState, useEffect } from 'react';
import { StyleSheet, StyleProp, ViewStyle, Text, View, Image } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { DeliveryIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { getDate } from '@aph/mobile-patients/src/utils/dateUtil';
import { format } from 'date-fns';

export interface TatCardwithoutAddressProps {
  style?: StyleProp<ViewStyle>;
  deliveryDate: string;
}

export const TatCardwithoutAddress: React.FC<TatCardwithoutAddressProps> = (props) => {
  const { style, deliveryDate } = props;

  function getDeliveryMsg() {
    let tommorowDate = new Date();
    tommorowDate.setDate(tommorowDate.getDate() + 1);

    if (new Date(deliveryDate).toLocaleDateString() == new Date().toLocaleDateString()) {
      return (
        <View>
          <Text style={styles.boldTxt}>Order now, get delivery today!</Text>
          <Text style={styles.normalTxt}>By {format(deliveryDate, 'h:mm A, Do MMM')}</Text>
        </View>
      );
    } else if (new Date(deliveryDate).toLocaleDateString() == tommorowDate.toLocaleDateString()) {
      return (
        <View>
          <Text style={styles.boldTxt}>Delivering tomorrow!</Text>
          <Text style={styles.normalTxt}>By {format(deliveryDate, 'h:mm A, Do MMM')}</Text>
        </View>
      );
    } else {
      return (
        <View>
          <Text style={styles.normalTxt}>Delivery by</Text>
          <Text style={styles.boldTxt}>
            {`${format(deliveryDate, 'dddd')}, ${format(deliveryDate, 'Do MMM')}`}
          </Text>
        </View>
      );
    }
  }

  return (
    <View style={[styles.card, style]}>
      <DeliveryIcon />
      <View style={{ marginLeft: 10 }}>{getDeliveryMsg()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 13,
    borderRadius: 3,
    marginBottom: 9,
    flexDirection: 'row',
    paddingHorizontal: 15,
    backgroundColor: '#F7F8F5',
    borderColor: '#00B38E',
    borderWidth: 0.5,
    alignItems: 'center',
    paddingVertical: 5,
  },
  normalTxt: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 24,
    color: '#01475B',
  },
  boldTxt: {
    ...theme.fonts.IBMPlexSansBold(16),
    color: '#00B38E',
    lineHeight: 24,
  },
});
