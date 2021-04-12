import React from 'react';
import { StyleSheet, Text, FlatList, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { CartItemCard } from '@aph/mobile-patients/src/components/MedicineCart/Components/CartItemCard';
import { CartItemCard2 } from '@aph/mobile-patients/src/components/MedicineCart/Components/CartItemCard2';
import { ShoppingCartItem } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { postwebEngageProductRemovedEvent } from '@aph/mobile-patients/src/components/MedicineCart/Events';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { TatCardwithoutAddress } from '@aph/mobile-patients/src/components/MedicineCart/Components/TatCardwithoutAddress';

export interface ShipmentsProps {
  onPressProduct?: (item: ShoppingCartItem) => void;
  setloading?: (value: boolean) => void;
}

export const Shipments: React.FC<ShipmentsProps> = (props) => {
  const { cartItems, updateCartItem, removeCartItem, orders } = useShoppingCart();
  const { onPressProduct, setloading } = props;
  const { currentPatient } = useAllCurrentPatients();
  const isSplitCart: boolean = orders?.length > 1 ? true : false;

  const renderCartItemsHeader = (index: any, items: any) => {
    const itemsCount = items.length == 0 || items.length > 10 ? items.length : `0${items.length}`;
    return isSplitCart ? (
      <View style={styles.cartItemsHeader}>
        <Text style={styles.cartItemsHeaderText}>SHIPMENT {index + 1}</Text>
        <Text style={styles.cartItemsHeaderText}> No. of items ({itemsCount})</Text>
      </View>
    ) : (
      <View style={{ ...styles.cartItemsHeader, marginBottom: 15 }}>
        <Text style={styles.cartItemsHeaderText}>ITEMS IN YOUR CART</Text>
        <Text style={styles.cartItemsHeaderText}>{itemsCount}</Text>
      </View>
    );
  };

  const onUpdateQuantity = ({ id }: ShoppingCartItem, unit: number) => {
    updateCartItem?.({ id, quantity: unit });
    setloading?.(true);
  };

  const onPressDelete = (item: ShoppingCartItem) => {
    removeCartItem?.(item.id);
    setloading?.(true);
    postwebEngageProductRemovedEvent(item, currentPatient && currentPatient!.id);
  };

  const renderCartItems = (items: any) => {
    const sku = items.map((item: any) => item?.sku || item?.id);
    const products = cartItems.filter((item) => sku.includes(item?.id));
    return (
      <View style={{}}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={products}
          renderItem={({ item, index }) => {
            return (
              <CartItemCard2
                item={item}
                onUpdateQuantity={(quantity) => onUpdateQuantity(item, quantity)}
                onPressDelete={() => onPressDelete(item)}
              />
            );
          }}
          keyExtractor={(item) => item.id}
        />
      </View>
    );
  };

  const renderOrders = () => {
    if (orders?.length) {
      return orders?.map((order: any, index: any) => {
        return (
          <View>
            {renderCartItemsHeader(index, order?.items || cartItems)}
            {isSplitCart && (
              <TatCardwithoutAddress
                style={{ marginTop: 13, marginBottom: 10 }}
                deliveryDate={order?.tat}
              />
            )}
            {renderCartItems(order?.items)}
          </View>
        );
      });
    } else {
      return (
        <View>
          {renderCartItemsHeader(0, cartItems)}
          {renderCartItems(cartItems)}
        </View>
      );
    }
  };

  return <View>{renderOrders()}</View>;
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
