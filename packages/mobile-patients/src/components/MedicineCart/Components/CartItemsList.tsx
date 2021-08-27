import React from 'react';
import { StyleSheet, Text, FlatList, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { CartItemCard } from '@aph/mobile-patients/src/components/MedicineCart/Components/CartItemCard';
import { CartItemCard2 } from '@aph/mobile-patients/src/components/MedicineCart/Components/CartItemCard2';
import { ShoppingCartItem } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { postwebEngageProductRemovedEvent } from '@aph/mobile-patients/src/components/MedicineCart/Events';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { SpecialOffers } from '@aph/mobile-patients/src/components/ui/Icons';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { NudgeMessage } from '@aph/mobile-patients/src/components/Medicines/Components/NudgeMessage';

export interface CartItemsListProps {
  screen: 'cart' | 'summary';
  onPressProduct?: (item: ShoppingCartItem) => void;
  setloading?: (value: boolean) => void;
}

export const CartItemsList: React.FC<CartItemsListProps> = (props) => {
  const { cartItems, updateCartItem, removeCartItem, pharmaCartNudgeMessage } = useShoppingCart();
  const { screen, onPressProduct, setloading } = props;
  const { currentPatient } = useAllCurrentPatients();
  const { cartBankOffer } = useAppCommonData();
  const { isCircleExpired, circleSubscriptionId } = useShoppingCart();
  const isFromCart = screen === 'cart';
  const showNudgeMessage =
    pharmaCartNudgeMessage?.show === 'yes' &&
    (pharmaCartNudgeMessage?.nudgeMessageMore || pharmaCartNudgeMessage?.nudgeMessageLess) &&
    isFromCart;

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

  const renderCartBankOfferBanner = () => (
    <View style={styles.bankOfferView}>
      <SpecialOffers style={styles.offerIcon} />
      <Text style={styles.bankOfferText}>{cartBankOffer}</Text>
    </View>
  );

  const renderNudgeMessage = () => {
    const showByUserType =
      pharmaCartNudgeMessage?.userType == 'all' ||
      (pharmaCartNudgeMessage?.userType == 'circle' && circleSubscriptionId && !isCircleExpired) ||
      (pharmaCartNudgeMessage?.userType == 'non-circle' &&
        (!circleSubscriptionId || isCircleExpired));
    if (showByUserType) {
      return (
        <View style={{ marginTop: 10 }}>
          <NudgeMessage nudgeMessageCart={pharmaCartNudgeMessage} source={'cart'} />
        </View>
      );
    } else {
      return null;
    }
  };

  return (
    <View>
      {renderCartItemsHeader()}
      {!!cartBankOffer && renderCartBankOfferBanner()}
      {showNudgeMessage && renderNudgeMessage()}
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
  bankOfferView: {
    flexDirection: 'row',
    borderRadius: 5,
    marginTop: 10,
    marginHorizontal: 18,
    backgroundColor: theme.colors.WHITE,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  bankOfferText: {
    ...theme.fonts.IBMPlexSansRegular(16),
    lineHeight: 22,
    color: '#02475B',
    paddingRight: 25,
  },
  offerIcon: { marginRight: 7, marginTop: 5, resizeMode: 'contain', width: 35, height: 35 },
});
