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
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  FlatListProps,
  ListRenderItem,
  ListRenderItemInfo,
  StyleSheet,
  View,
} from 'react-native';
import { NavigationRoute, NavigationScreenProp } from 'react-navigation';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

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
  onAddedSuccessfully?: () => void;
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
  const isPdp: boolean = addToCartSource === 'Similar Widget' || addToCartSource === 'Pharmacy PDP';
  const step: number = 3;
  const initData = data?.length > 4 ? data?.slice(0, step) : data;
  const [dataToShow, setDataToShow] = useState(initData);
  const [lastIndex, setLastIndex] = useState<number>(data?.length > 4 ? step : 0);
  const { currentPatient } = useAllCurrentPatients();
  const { locationDetails, pharmacyLocation, isPharmacyLocationServiceable } = useAppCommonData();
  const { showAphAlert, setLoading: setGlobalLoading } = useUIElements();
  const {
    getCartItemQty,
    addCartItem,
    updateCartItem,
    removeCartItem,
    pharmacyCircleAttributes,
    cartItems,
    asyncPincode,
  } = useShoppingCart();
  const pharmacyPincode = pharmacyLocation?.pincode || locationDetails?.pincode;

  const onPress = (sku: string, urlKey: string) => {
    if (movedFrom === ProductPageViewedSource.SIMILAR_PRODUCTS) {
      navigation.replace(AppRoutes.ProductDetailPage, {
        sku,
        movedFrom,
        sectionName,
        productPageViewedEventProps,
        urlKey,
      });
    } else {
      navigation.push(AppRoutes.ProductDetailPage, {
        sku,
        movedFrom,
        sectionName,
        productPageViewedEventProps,
        urlKey,
      });
    }
  };

  const onPressNotify = (name: string) => {
    showAphAlert!({
      title: 'Okay! :)',
      description: `You will be notified when ${name} is back in stock.`,
    });
  };

  const onPressAddToCart = (item: MedicineProduct) => {
    const { onAddedSuccessfully } = restOfProps;
    addPharmaItemToCart(
      formatToCartItem(item),
      asyncPincode?.pincode || pharmacyPincode!,
      addCartItem,
      setGlobalLoading,
      navigation,
      currentPatient,
      !!isPharmacyLocationServiceable,
      {
        source: addToCartSource,
        categoryId: productPageViewedEventProps?.CategoryID,
        categoryName: productPageViewedEventProps?.CategoryName,
        section: productPageViewedEventProps?.SectionName,
      },
      JSON.stringify(cartItems),
      () => {},
      pharmacyCircleAttributes!,
      onAddedSuccessfully ? onAddedSuccessfully : () => {}
    );
  };

  const onPressCareCashback = () => {
    navigation.navigate(AppRoutes.CommonWebView, {
      url: AppConfig.Configuration.CIRLCE_PHARMA_URL,
      source: 'Pharma',
    });
  };

  const renderItem = useCallback(
    (info: ListRenderItemInfo<MedicineProduct>) => {
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
        onPress: () => onPress(item.sku, item.url_key),
        onPressAddToCart: () => onPressAddToCart(item),
        onPressAddQty: onPressAddQty,
        onPressSubtractQty: onPressSubtractQty,
        onPressNotify: () => onPressNotify(item.name),
        onPressCashback: () => onPressCareCashback(),
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
    },
    [cartItems]
  );

  const keyExtractor = useCallback(({ sku }) => `${sku}`, []);

  const renderItemSeparator = useCallback(() => <View style={styles.itemSeparator} />, []);

  return (
    <FlatList
      data={isPdp ? dataToShow : data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      bounces={false}
      horizontal
      showsHorizontalScrollIndicator={false}
      removeClippedSubviews={true}
      ItemSeparatorComponent={renderItemSeparator}
      contentContainerStyle={[styles.flatListContainer, contentContainerStyle]}
      onEndReached={() => {
        if (dataToShow?.length && isPdp) {
          if (lastIndex <= data?.length) {
            const newData = data?.slice(lastIndex, step);
            setDataToShow(data?.slice(0, lastIndex + step));
            setLastIndex(lastIndex + step);
          }
        }
      }}
      onEndReachedThreshold={0.2}
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
