import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { ProductPageViewedEventProps } from '@aph/mobile-patients/src/components/Medicines/MedicineDetailsScene';
import { Props as ProductCardProps } from '@aph/mobile-patients/src/components/Medicines/ProductCard';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  addPharmaItemToCart,
  formatToCartItem,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  ProductPageViewedSource,
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import React from 'react';
import {
  FlatList,
  FlatListProps,
  ListRenderItem,
  ListRenderItemInfo,
  StyleSheet,
  View,
} from 'react-native';
import { NavigationRoute, NavigationScreenProp } from 'react-navigation';

type ListProps = FlatListProps<MedicineProduct>;

export interface Props extends Omit<ListProps, 'renderItem'> {
  navigation: NavigationScreenProp<NavigationRoute<object>, object>;
  /** one of the props (Component | renderComponent) are mandatory */
  Component?: React.FC<ProductCardProps>;
  renderComponent?: ListRenderItem<ProductCardProps>;
  addToCartSource: WebEngageEvents[WebEngageEventName.PHARMACY_ADD_TO_CART]['Source'];
  movedFrom: ProductPageViewedSource;
  productPageViewedEventProps?: ProductPageViewedEventProps;
  sectionName?: string;
}

export const ProductList: React.FC<Props> = ({
  addToCartSource,
  sectionName,
  productPageViewedEventProps,
  movedFrom,
  navigation,
  Component,
  renderComponent,
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
    navigation.push(AppRoutes.MedicineDetailsScene, {
      sku,
      movedFrom,
      sectionName,
      productPageViewedEventProps,
    });
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
      { source: addToCartSource, categoryId: item.category_id }
    );
  };

  const renderItem = (info: ListRenderItemInfo<MedicineProduct>) => {
    const { item, index } = info;
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

    const props: ProductCardProps = {
      ...item,
      quantity: qty,
      onPress: () => onPress(item.sku),
      onPressAddToCart: () => onPressAddToCart(item),
      onPressAddQty: onPressAddQty,
      onPressSubtractQty: onPressSubtractQty,
      onPressNotify: () => onPressNotify(item.name),
      containerStyle:
        index === 0
          ? styles.itemStartContainer
          : index + 1 === data?.length
          ? styles.itemEndContainer
          : styles.itemContainer,
    };
    
    return renderComponent ? (
      renderComponent({ ...info, item: props })
    ) : Component ? (
      <Component {...props} />
    ) : null;
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
  flatListContainer: {},
  itemSeparator: { margin: 5 },
  itemContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  itemStartContainer: {
    marginTop: 16,
    marginBottom: 20,
    marginLeft: 20,
  },
  itemEndContainer: {
    marginTop: 16,
    marginBottom: 20,
    marginRight: 20,
  },
});
