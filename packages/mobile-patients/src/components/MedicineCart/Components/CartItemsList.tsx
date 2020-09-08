import React from 'react';
import { StyleSheet, Text, FlatList, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { CartItemCard } from '@aph/mobile-patients/src/components/MedicineCart/Components/CartItemCard';
import { CartItemCard2 } from '@aph/mobile-patients/src/components/MedicineCart/Components/CartItemCard2';

import { ShoppingCartItem } from '@aph/mobile-patients/src/components/ShoppingCartProvider';

export interface CartItemsListProps {
  screen: 'cart' | 'summary';
}

export const CartItemsList: React.FC<CartItemsListProps> = (props) => {
  const { cartItems, updateCartItem, removeCartItem } = useShoppingCart();
  const { screen } = props;

  const renderCartItemsHeader = () => {
    const itemsCount =
      cartItems.length == 0 || cartItems.length > 10 ? cartItems.length : `0${cartItems.length}`;
    return (
      <View style={styles.cartItemsHeader}>
        <Text style={styles.cartItemsHeaderText}>ITEMS IN YOUR CART</Text>
        <Text style={styles.cartItemsHeaderText}>{itemsCount}</Text>
      </View>
    );
  };

  const onUpdateQuantity = ({ id }: ShoppingCartItem, unit: number) => {
    updateCartItem && updateCartItem({ id, quantity: unit });
  };

  const onPressDelete = ({ id }: ShoppingCartItem) => {
    removeCartItem && removeCartItem(id);
  };

  const renderCartItems = () => {
    return (
      <View style={{ marginTop: 15 }}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={cartItems}
          renderItem={({ item, index }) => {
            return screen == 'cart' ? (
              <CartItemCard
                item={item}
                onUpdateQuantity={(quantity) => onUpdateQuantity(item, quantity)}
                onPressDelete={() => onPressDelete(item)}
              />
            ) : (
              <CartItemCard2 item={item} />
            );
          }}
          keyExtractor={(item) => item.id}
        />
      </View>
    );
  };

  return (
    <View>
      {renderCartItemsHeader()}
      {renderCartItems()}
    </View>
  );
};

const styles = StyleSheet.create({
  cartItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
    marginTop: 20,
    marginHorizontal: 20,
  },
  cartItemsHeaderText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansBold(13),
  },
});
