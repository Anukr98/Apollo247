import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AlertIcon, BlueDotIcon } from '@aph/mobile-patients/src/components/ui/Icons';

export interface UnServiceableProps {
  style?: StyleProp<ViewStyle>;
}

export const UnServiceable: React.FC<UnServiceableProps> = (props) => {
  const { cartItems } = useShoppingCart();
  const { style } = props;
  const unServiceable = cartItems.filter((item) => item.unserviceable);

  return unServiceable && unServiceable.length ? (
    <View style={[styles.card, style]}>
      <AlertIcon />
      <View style={{ marginLeft: 8 }}>
        <Text style={styles.unServiceable}>Some Items are not serviceable in your area.</Text>
        {unServiceable.map((item) => {
          return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <BlueDotIcon />
              <Text style={styles.itemName}>{`${item.name} is out of stock.`}</Text>
            </View>
          );
        })}
      </View>
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  card: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: '#F7F8F5',
    marginHorizontal: 13,
    borderRadius: 5,
    marginBottom: 5,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  unServiceable: {
    ...theme.fonts.IBMPlexSansSemiBold(13),
    lineHeight: 17,
    color: '#01475B',
  },
  itemName: {
    ...theme.fonts.IBMPlexSansMedium(10),
    lineHeight: 13,
    color: '#0087BA',
    marginTop: 2,
    marginLeft: 4,
  },
});
