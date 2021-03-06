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
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import AsyncStorage from '@react-native-community/async-storage';
import { postCleverTapEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';

export interface ServerCartItemsListProps {
  screen: 'summary' | 'serverCart';
  onPressProduct?: (item: ShoppingCartItem) => void;
}

export const ServerCartItemsList: React.FC<ServerCartItemsListProps> = (props) => {
  const {
    pharmaCartNudgeMessage,
    serverCartItems,
    addresses,
    cartAddressId,
    pharmacyCircleAttributes,
    cartCoupon,
  } = useShoppingCart();
  const { setUserActionPayload, userActionPayload } = useServerCart();
  const { screen, onPressProduct } = props;
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

  const postUpdateQuantityEvent = async (
    sku,
    name,
    isPrescriptionRequired,
    price,
    sellingPrice,
    unit
  ) => {
    try {
      const pincode = addresses.find((item) => item?.id === cartAddressId)?.zipcode;
      const eventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_CART_ITEM_QUANTITY_CHANGED] = {
        quantity: unit,
        id: sku,
        name,
        user: currentPatient?.firstName,
        mobile_number: currentPatient?.mobileNumber,
        user_type: await AsyncStorage.getItem('PharmacyUserType'),
        circle_member: pharmacyCircleAttributes?.['Circle Membership Added'],
        circle_membership_value: pharmacyCircleAttributes?.['Circle Membership Value']
          ? pharmacyCircleAttributes?.['Circle Membership Value']
          : 0,
        prescriptionRequired: isPrescriptionRequired === '1' ? true : false,
        total_items_in_cart: serverCartItems?.length,
        price,
        special_price: sellingPrice ? sellingPrice : price,
        pincode,
        coupon: cartCoupon ? cartCoupon?.coupon : null,
      };
      postCleverTapEvent(CleverTapEventName.PHARMACY_CART_ITEM_QUANTITY_CHANGED, eventAttributes);
    } catch (err) {}
  };

  const onUpdateQuantity = async (
    { sku, name, isPrescriptionRequired, price, sellingPrice }: ShoppingCartItem,
    unit: number
  ) => {
    postUpdateQuantityEvent(sku, name, isPrescriptionRequired, price, sellingPrice, unit);
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
                userActionPayload={userActionPayload}
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
      {showNudgeMessage ? renderNudgeMessage() : null}
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
