import React from 'react';
import { StyleSheet, Text, FlatList, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { ShoppingCartItem } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { postwebEngageProductRemovedEvent } from '@aph/mobile-patients/src/components/MedicineCart/Events';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { SpecialOffers } from '@aph/mobile-patients/src/components/ui/Icons';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { NudgeMessage } from '@aph/mobile-patients/src/components/Medicines/Components/NudgeMessage';
import { ServerCartItem } from '@aph/mobile-patients/src/components/ServerCart/Components/ServerCartItem';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';

export interface ServerCartItemsListProps {
  screen: 'summary' | 'serverCart';
  onPressProduct?: (item: ShoppingCartItem) => void;
  setloading?: (value: boolean) => void;
}

export const ServerCartItemsList: React.FC<ServerCartItemsListProps> = (props) => {
  const { pharmaCartNudgeMessage, serverCartItems } = useShoppingCart();
  const { setUserActionPayload } = useServerCart();
  const { screen, onPressProduct, setloading } = props;
  const { currentPatient } = useAllCurrentPatients();
  const { cartBankOffer } = useAppCommonData();
  const { isCircleExpired, circleSubscriptionId } = useShoppingCart();
  const isFromCart = screen === 'serverCart';
  const showNudgeMessage =
    pharmaCartNudgeMessage?.show === 'yes' &&
    (pharmaCartNudgeMessage?.nudgeMessageMore || pharmaCartNudgeMessage?.nudgeMessageLess) &&
    isFromCart;

  const renderCartItemsHeader = () => {
    const itemsCount =
      serverCartItems?.length == 0 || serverCartItems?.length > 10
        ? serverCartItems?.length
        : `0${serverCartItems?.length}`;
    return (
      <View style={styles.cartItemsHeader}>
        <Text style={styles.cartItemsHeaderText}>ITEMS IN YOUR CART</Text>
        <Text style={styles.cartItemsHeaderText}>{itemsCount}</Text>
      </View>
    );
  };

  const onUpdateQuantity = ({ sku }: ShoppingCartItem, unit: number) => {
    setUserActionPayload?.({
      medicineOrderCartLineItems: [
        {
          medicineSKU: sku,
          quantity: unit,
        },
      ],
    });
  };

  const onPressDelete = (item: ShoppingCartItem) => {
    if (!item?.freeProduct) {
      setUserActionPayload?.({
        medicineOrderCartLineItems: [
          {
            medicineSKU: item?.sku,
            quantity: 0,
          },
        ],
      });
      postwebEngageProductRemovedEvent(item, currentPatient && currentPatient!.id);
    }
  };

  const renderCartItems = () => {
    return (
      <View style={{ marginTop: 15 }}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={serverCartItems}
          renderItem={({ item, index }) => {
            return (
              <ServerCartItem
                item={item}
                onUpdateQuantity={(quantity) => onUpdateQuantity(item, quantity)}
                onPressDelete={() => onPressDelete(item)}
                onPressProduct={() => onPressProduct!(item)}
              />
            );
          }}
          keyExtractor={(item) => item.id}
        />
      </View>
    );
  };

  const renderCartBankOfferBanner = () =>
    !!cartBankOffer ? (
      <View style={styles.bankOfferView}>
        <SpecialOffers style={styles.offerIcon} />
        <Text style={styles.bankOfferText}>{cartBankOffer}</Text>
      </View>
    ) : null;

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
      {renderCartBankOfferBanner()}
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
