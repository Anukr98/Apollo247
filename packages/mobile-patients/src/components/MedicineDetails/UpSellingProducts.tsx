import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  ProductUpSellingCard,
  Props as ProductUpSellingCardProps,
} from '@aph/mobile-patients/src/components/Medicines/ProductUpSellingCard';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  addPharmaItemToCart,
  formatToCartItem,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import React from 'react';
import { FlatList, FlatListProps, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { NavigationRoute, NavigationScreenProp } from 'react-navigation';

type ListProps = FlatListProps<MedicineProduct>;

export interface Props extends Omit<ListProps, 'renderItem'> {
  navigation: NavigationScreenProp<NavigationRoute<object>, object>;
}

export const UpSellingProducts: React.FC<Props> = ({
  navigation,
  data,
  contentContainerStyle,
  ...restOfProps
}) => {
  const { currentPatient } = useAllCurrentPatients();
  const { locationDetails, pharmacyLocation, isPharmacyLocationServiceable } = useAppCommonData();
  const { showAphAlert, setLoading: setGlobalLoading } = useUIElements();
  const { getCartItemQty, addCartItem, updateCartItem, removeCartItem } = useShoppingCart();
  const pharmacyPincode = pharmacyLocation?.pincode || locationDetails?.pincode;

  const onPress = (sku: string) => {
    navigation.navigate(AppRoutes.MedicineDetailsScene, { sku, movedFrom: 'widget' });
  };

  const onPressNotify = (name: string) => {
    showAphAlert!({
      title: 'Okay! :)',
      description: `You will be notified when ${name} is back in stock.`,
    });
  };

  const onPressAddToCart = (item: MedicineProduct) => {
    addPharmaItemToCart(
      formatToCartItem(item),
      pharmacyPincode!,
      addCartItem,
      setGlobalLoading,
      navigation,
      currentPatient,
      !!isPharmacyLocationServiceable,
      { source: 'Pharmacy Full Search', categoryId: item.category_id }
    );
  };

  const renderItem = ({ item }: ListRenderItemInfo<MedicineProduct>) => {
    const id = item.sku;
    const qty = getCartItemQty(id);
    const onPressAddQty = () => {
      if (qty < item.MaxOrderQty) {
        updateCartItem!({ id, quantity: qty + 1 });
      }
    };
    const onPressSubtractQty = () => {
      qty == 1 ? removeCartItem!(id) : updateCartItem!({ id, quantity: qty - 1 });
    };

    const props: ProductUpSellingCardProps = {
      ...item,
      quantity: qty,
      MaxOrderQty: item.MaxOrderQty,
      onPress: () => onPress(id),
      onPressAddToCart: () => onPressAddToCart(item),
      onPressAddQty: onPressAddQty,
      onPressSubtractQty: onPressSubtractQty,
      onPressNotify: () => onPressNotify(item.name),
    };

    return <ProductUpSellingCard {...props} />;
  };

  const renderItemSeparator = () => <View style={styles.itemSeparator} />;

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={({ sku }) => `${sku}`}
      bounces={false}
      horizontal
      showsHorizontalScrollIndicator={false}
      removeClippedSubviews={true}
      ItemSeparatorComponent={renderItemSeparator}
      contentContainerStyle={[styles.flatListContainer, contentContainerStyle]}
      {...restOfProps}
    />
  );
};

const styles = StyleSheet.create({
  flatListContainer: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  itemSeparator: { margin: 5 },
});
