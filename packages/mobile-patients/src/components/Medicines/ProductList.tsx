import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { Props as ProductCardProps } from '@aph/mobile-patients/src/components/Medicines/ProductCard';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  addPharmaItemToCart,
  formatToCartItem,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import React from 'react';
import { FlatList, FlatListProps, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { NavigationRoute, NavigationScreenProp } from 'react-navigation';

type ListProps = FlatListProps<MedicineProduct>;

export interface Props extends Omit<ListProps, 'renderItem'> {
  navigation: NavigationScreenProp<NavigationRoute<object>, object>;
  Component: React.FC<ProductCardProps>;
  addToCartSource: WebEngageEvents[WebEngageEventName.PHARMACY_ADD_TO_CART]['Source'];
  pharmacyCategorySectionProductClickSectionName?: WebEngageEvents[WebEngageEventName.PHARMACY_CATEGORY_SECTION_PRODUCT_CLICK]['Section Name'];
  pharmacyProductClickedSource?: WebEngageEvents[WebEngageEventName.PHARMACY_PRODUCT_CLICKED]['Source'];
  pharmacyProductClickedSectionName?: WebEngageEvents[WebEngageEventName.PHARMACY_PRODUCT_CLICKED]['Section Name'];
}

export const ProductList: React.FC<Props> = ({
  addToCartSource,
  pharmacyCategorySectionProductClickSectionName,
  pharmacyProductClickedSource,
  pharmacyProductClickedSectionName,
  navigation,
  Component,
  data,
  contentContainerStyle,
  ...restOfProps
}) => {
  const { currentPatient } = useAllCurrentPatients();
  const { locationDetails, pharmacyLocation, isPharmacyLocationServiceable } = useAppCommonData();
  const { showAphAlert, setLoading: setGlobalLoading } = useUIElements();
  const { getCartItemQty, addCartItem, updateCartItem, removeCartItem } = useShoppingCart();
  const pharmacyPincode = pharmacyLocation?.pincode || locationDetails?.pincode;

  const onPress = (sku: string, name: string, categoryId: string) => {
    if (pharmacyCategorySectionProductClickSectionName) {
      const atr1: WebEngageEvents[WebEngageEventName.PHARMACY_CATEGORY_SECTION_PRODUCT_CLICK] = {
        'Section Name': pharmacyCategorySectionProductClickSectionName,
        ProductId: sku,
        ProductName: name,
      };
      postWebEngageEvent(WebEngageEventName.PHARMACY_CATEGORY_SECTION_PRODUCT_CLICK, atr1);
    }
    if (pharmacyProductClickedSource && pharmacyProductClickedSectionName) {
      const atr2: WebEngageEvents[WebEngageEventName.PHARMACY_PRODUCT_CLICKED] = {
        'product name': name,
        'product id': sku,
        'category ID': categoryId,
        Brand: '',
        'Brand ID': '',
        'category name': '',
        Source: pharmacyProductClickedSource,
        'Section Name': pharmacyProductClickedSectionName,
      };
      postWebEngageEvent(WebEngageEventName.PHARMACY_PRODUCT_CLICKED, atr2);
    }
    navigation.navigate(AppRoutes.MedicineDetailsScene, {
      sku,
      movedFrom: 'widget',
      sectionName: pharmacyProductClickedSectionName,
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

  const renderItem = ({ item, index }: ListRenderItemInfo<MedicineProduct>) => {
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
      onPress: () => onPress(item.sku, item.name, item.category_id!),
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

    return <Component {...props} />;
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
