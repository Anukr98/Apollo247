import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { WhiteArrowRight } from '@aph/mobile-patients/src/components/ui/Icons';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import moment from 'moment';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { format } from 'date-fns';

export interface TatCardProps {
  deliveryTime: string;
  deliveryAddress: string;
  onPressChangeAddress: () => void;
  onPressTatCard?: () => void;
  isNonCartOrder?: boolean;
}

export const TatCard: React.FC<TatCardProps> = (props) => {
  const {
    deliveryTime,
    deliveryAddress,
    onPressChangeAddress,
    onPressTatCard,
    isNonCartOrder,
  } = props;
  const { cartItems } = useShoppingCart();
  const unServiceable = isNonCartOrder ? false : cartItems?.find((item) => item?.unserviceable);

  function getGenericDate() {
    const genericServiceableDate = moment()
      .add(2, 'days')
      .set('hours', 20)
      .set('minutes', 0)
      .format(AppConfig.Configuration.TAT_API_RESPONSE_DATE_FORMAT);
    return <Text style={styles.dateTime}>{`${format(genericServiceableDate, 'D-MMM-YYYY')}`}</Text>;
  }

  function getDeliveryDate() {
    let tommorowDate = new Date();
    tommorowDate.setDate(tommorowDate.getDate() + 1);

    if (new Date(deliveryTime).toLocaleDateString() == new Date().toLocaleDateString()) {
      return !!isNonCartOrder ? (
        <Text style={styles.dateTime}> {`Today!`}</Text>
      ) : (
        <Text style={styles.dateTime}> {`${format(deliveryTime, 'h:mm A')}, Today!`}</Text>
      );
    } else if (new Date(deliveryTime).toLocaleDateString() == tommorowDate.toLocaleDateString()) {
      return !!isNonCartOrder ? (
        <Text style={styles.dateTime}> {`Tomorrow!`}</Text>
      ) : (
        <Text style={styles.dateTime}> {`${format(deliveryTime, 'h:mm A')}, Tomorrow!`}</Text>
      );
    } else {
      return <Text style={styles.dateTime}>{`${format(deliveryTime, 'D-MMM-YYYY')}`}</Text>;
    }
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
        {!unServiceable && (
          <Text style={styles.delivery}>
            {!!isNonCartOrder ? `Expected Delivery by ` : `Deliver by :`}
            {deliveryTime ? getDeliveryDate() : getGenericDate()}
          </Text>
        )}
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
