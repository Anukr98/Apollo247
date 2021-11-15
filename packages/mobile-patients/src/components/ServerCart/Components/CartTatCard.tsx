import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { WhiteArrowRight } from '@aph/mobile-patients/src/components/ui/Icons';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import moment from 'moment';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { format } from 'date-fns';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';

export interface CartTatCardProps {
  deliveryTime: string;
  deliveryAddress: string;
  onPressChangeAddress: () => void;
  onPressTatCard?: () => void;
}

export const CartTatCard: React.FC<CartTatCardProps> = (props) => {
  const { deliveryTime, deliveryAddress, onPressChangeAddress, onPressTatCard } = props;
  const { serverCartItems, isSplitCart } = useShoppingCart();
  const unServiceable = !!serverCartItems?.find(({ isShippable }) => !isShippable);

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
    let dateText = `${format(deliveryTime, 'D-MMM-YYYY')}`;
    if (new Date(deliveryTime).toLocaleDateString() == new Date().toLocaleDateString()) {
      dateText = `${format(deliveryTime, 'h:mm A')}, Today!`;
    } else if (new Date(deliveryTime).toLocaleDateString() == tommorowDate.toLocaleDateString()) {
      dateText = `${format(deliveryTime, 'h:mm A')}, Tomorrow!`;
    }
    return <Text style={styles.dateTime}>{dateText}</Text>;
  }

  const renderViewDelivery = () => {
    return (
      <TouchableOpacity onPress={onPressTatCard} style={styles.viewDeliveryView}>
        <Text style={styles.viewDelivery}>View delivery time</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ backgroundColor: '#02475B', paddingHorizontal: 13 }}>
      <View
        style={{
          ...styles.subCont1,
          justifyContent: !unServiceable ? 'space-between' : 'flex-end',
        }}
      >
        {!unServiceable &&
          (!isSplitCart ? (
            <Text style={styles.delivery}>
              {`Deliver by : `}
              {deliveryTime ? getDeliveryDate() : getGenericDate()}
            </Text>
          ) : (
            renderViewDelivery()
          ))}
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
    </View>
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
  viewDelivery: {
    ...theme.fonts.IBMPlexSansMedium(10),
    lineHeight: 13,
    color: '#D4D4D4',
  },
  viewDeliveryView: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: '#D4D4D4',
    borderRadius: 5,
  },
  deliveryText: {
    width: '79%',
    color: '#F7F8F5',
    ...theme.fonts.IBMPlexSansRegular(14),
    lineHeight: 18,
  },
});
