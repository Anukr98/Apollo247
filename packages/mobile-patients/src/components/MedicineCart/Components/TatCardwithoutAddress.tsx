import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, Text, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { DeliveryIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { format } from 'date-fns';
import moment from 'moment';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

export interface TatCardwithoutAddressProps {
  style?: StyleProp<ViewStyle>;
  deliveryDate: string;
}

export const TatCardwithoutAddress: React.FC<TatCardwithoutAddressProps> = (props) => {
  const { style, deliveryDate } = props;

  function getGenericDate() {
    const genericServiceableDate = moment()
      .add(2, 'days')
      .set('hours', 20)
      .set('minutes', 0)
      .format(AppConfig.Configuration.TAT_API_RESPONSE_DATE_FORMAT);
    return (
      <View>
        <Text style={styles.normalTxt}>Delivery by</Text>
        <Text style={styles.boldTxt}>
          {`${format(genericServiceableDate, 'dddd')}, ${format(genericServiceableDate, 'Do MMM')}`}
        </Text>
      </View>
    );
  }

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
      <View style={{ marginLeft: 10 }}>{deliveryDate ? getDeliveryMsg() : getGenericDate()}</View>
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
