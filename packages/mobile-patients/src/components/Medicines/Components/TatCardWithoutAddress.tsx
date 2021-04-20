import React, { useState, useEffect } from 'react';
import { StyleSheet, StyleProp, ViewStyle, Text, View, Image } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { DeliveryIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { format } from 'date-fns';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';

export interface TatCardwithoutAddressProps {
  style?: StyleProp<ViewStyle>;
  vdcType: string;
  isNonCartOrder?: boolean;
}

export const TatCardwithoutAddress: React.FC<TatCardwithoutAddressProps> = (props) => {
  const { style, vdcType, isNonCartOrder } = props;
  const { deliveryTime } = useShoppingCart();
  const { nonCartDeliveryText } = useAppCommonData();

  function getNonCartDeliveryDate() {
    let tommorowDate = new Date();
    tommorowDate.setDate(tommorowDate.getDate() + 1);
    if (new Date(deliveryTime).toLocaleDateString() == new Date().toLocaleDateString()) {
      return `Expected Delivery by Today!`;
    } else if (new Date(deliveryTime).toLocaleDateString() == tommorowDate.toLocaleDateString()) {
      return `Expected Delivery by Tomorrow!`;
    } else {
      return `Expected Delivery by: ${format(deliveryTime, 'D-MMM-YYYY')}`;
    }
  }

  function getDeliveryDate() {
    let hourOftheDay = new Date().getHours();
    return vdcType == 'LVDC'
      ? hourOftheDay > 7 && hourOftheDay < 17
        ? 'Typically Delivers in 4 hours!'
        : hourOftheDay > 16 && hourOftheDay < 24
        ? 'Typically Delivers by Tomorrow!'
        : 'Typically Delivers by 12:00 PM!'
      : 'Deliver in 1 to 3 days!';
  }

  function getDeliveryMsg() {
    return 'Exact Delivery timeline will be confirmed after order is verified, based on confirmed items.';
  }

  return (
    <View style={[styles.card, style]}>
      <DeliveryIcon />
      <View style={{ marginLeft: 10 }}>
        <Text style={styles.boldTxt}>
          {!!isNonCartOrder
            ? nonCartDeliveryText
              ? nonCartDeliveryText
              : getNonCartDeliveryDate()
            : getDeliveryDate()}
        </Text>
        {!isNonCartOrder && <Text style={styles.subText}>{getDeliveryMsg()}</Text>}
      </View>
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
    paddingVertical: 10,
  },
  normalTxt: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 24,
    color: '#01475B',
  },
  boldTxt: {
    ...theme.fonts.IBMPlexSansBold(14),
    color: '#01475B',
    lineHeight: 17,
  },
  subText: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 15,
    color: 'rgba(1,71,91,0.59)',
    marginTop: 4,
    marginRight: 30,
  },
});
