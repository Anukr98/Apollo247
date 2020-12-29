import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { WhiteArrowRight } from '@aph/mobile-patients/src/components/ui/Icons';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import moment from 'moment';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { format } from 'date-fns';

export interface TatCardProps {
  vdcType: string;
  deliveryAddress: string;
  onPressChangeAddress: () => void;
  onPressTatCard?: () => void;
}

export const TatCard: React.FC<TatCardProps> = (props) => {
  const { vdcType, deliveryAddress, onPressChangeAddress, onPressTatCard } = props;
  const { cartItems } = useShoppingCart();
  const unServiceable = cartItems.find((item) => item.unserviceable);

  function getGenericDate() {
    const genericServiceableDate = moment()
      .add(2, 'days')
      .set('hours', 20)
      .set('minutes', 0)
      .format(AppConfig.Configuration.TAT_API_RESPONSE_DATE_FORMAT);
    return <Text style={styles.dateTime}>{`${format(genericServiceableDate, 'D-MMM-YYYY')}`}</Text>;
  }

  //   function getDeliveryDate() {
  //     let tommorowDate = new Date();
  //     tommorowDate.setDate(tommorowDate.getDate() + 1);

  //     if (new Date(deliveryTime).toLocaleDateString() == new Date().toLocaleDateString()) {
  //       return <Text style={styles.dateTime}> {`${format(deliveryTime, 'h:mm A')}, Today!`}</Text>;
  //     } else if (new Date(deliveryTime).toLocaleDateString() == tommorowDate.toLocaleDateString()) {
  //       return <Text style={styles.dateTime}> {`${format(deliveryTime, 'h:mm A')}, Tomorrow!`}</Text>;
  //     } else {
  //       return <Text style={styles.dateTime}>{`${format(deliveryTime, 'D-MMM-YYYY')}`}</Text>;
  //     }
  //   }

  function getDeliveryMsg() {
    let hourOftheDay = new Date().getHours();
    return vdcType == 'LVDC'
      ? hourOftheDay > 7 && hourOftheDay < 17
        ? 'Typically Delivers in : 4 hours'
        : hourOftheDay > 16 && hourOftheDay < 24
        ? 'Typically Delivers by Tomorrow'
        : 'Typically Delivers by : 12:00 PM'
      : 'between 1 to 3 days';
  }
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPressTatCard}
      style={{ backgroundColor: '#02475B', paddingHorizontal: 13 }}
    >
      <View
        style={{
          ...styles.subCont1,
          justifyContent: !unServiceable ? 'space-between' : 'flex-end',
        }}
      >
        {!unServiceable && vdcType != '' && <Text style={styles.delivery}>{getDeliveryMsg()}</Text>}
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={() => onPressChangeAddress()}
        >
          <Text style={styles.change}>CHANGE</Text>
          <WhiteArrowRight />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 15 }}>
        <Text style={styles.delivery}>
          Deliver to : <Text style={styles.dateTime}>{deliveryAddress}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  subCont1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 17,
    flex: 1,
  },
  delivery: {
    color: '#F7F8F5',
    ...theme.fonts.IBMPlexSansRegular(14),
    lineHeight: 18,
  },
  dateTime: {
    color: '#F7F8F5',
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
  },
  change: {
    color: '#F7F8F5',
    ...theme.fonts.IBMPlexSansSemiBold(14),
    lineHeight: 18,
    marginRight: 7,
  },
});
