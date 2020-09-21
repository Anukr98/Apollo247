import React from 'react';
import { StyleSheet, Text, FlatList, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { CartItemCard } from '@aph/mobile-patients/src/components/MedicineCart/Components/CartItemCard';
import { CartItemCard2 } from '@aph/mobile-patients/src/components/MedicineCart/Components/CartItemCard2';
import { ShoppingCartItem } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { postwebEngageProductRemovedEvent } from '@aph/mobile-patients/src/components/MedicineCart/Events';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';

export interface CartItemsListProps {
  screen: 'cart' | 'summary';
  onPressProduct?: (item: ShoppingCartItem) => void;
}

export const CartItemsList: React.FC<CartItemsListProps> = (props) => {
  const { cartItems, updateCartItem, removeCartItem } = useShoppingCart();
  const { screen, onPressProduct } = props;
  const { currentPatient } = useAllCurrentPatients();

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

  const onPressDelete = (item: ShoppingCartItem) => {
    removeCartItem && removeCartItem(item.id);
    postwebEngageProductRemovedEvent(item, currentPatient && currentPatient!.id);
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
                onPressProduct={() => onPressProduct!(item)}
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
