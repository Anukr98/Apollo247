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
  g,
  getAvailabilityForSearchSuccess,
  getDiscountPercentage,
  postCleverTapEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import React, { useCallback, useState, useEffect } from 'react';
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
import {
  CleverTapEvents,
  CleverTapEventName,
  ProductPageViewedSource,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { SuggestedQuantityNudge } from '@aph/mobile-patients/src/components/SuggestedQuantityNudge/SuggestedQuantityNudge';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';

type ListProps = FlatListProps<MedicineProduct>;

export interface Props extends Omit<ListProps, 'renderItem'> {
  navigation: NavigationScreenProp<NavigationRoute<object>, object>;
  /** one of the props (Component | renderComponent) are mandatory */
  Component?: React.FC<ProductCardProps>;
  renderComponent?: ListRenderItem<ProductCardProps>;
  addToCartSource:
    | WebEngageEvents[WebEngageEventName.PHARMACY_ADD_TO_CART]['Source']
    | CleverTapEvents[CleverTapEventName.PHARMACY_ADD_TO_CART]['Nav src'];
  movedFrom: ProductPageViewedSource;
  productPageViewedEventProps?: ProductPageViewedEventProps;
  sectionName?: string;
  onAddedSuccessfully?: () => void;
  totalProducts?: number | undefined;
}

const ProductListFun: React.FC<Props> = ({
  addToCartSource,
  sectionName,
  productPageViewedEventProps,
  movedFrom,
  navigation,
  Component,
  renderComponent,
  data,
  contentContainerStyle,
  totalProducts,
  ...restOfProps
}) => {
  const isPdp: boolean =
    addToCartSource === 'Similar Widget' ||
    addToCartSource === 'Pharmacy PDP' ||
    addToCartSource == 'PDP All Substitutes';
  const step: number = 3;
  const initData = data?.length > 4 ? data?.slice(0, step) : data;
  const comingFromSearch = navigation.getParam('comingFromSearch')
    ? navigation.getParam('comingFromSearch')
    : false;
  const searchText = navigation.getParam('searchText') ? navigation.getParam('searchText') : '';
  const navSrcForSearchSuccess = navigation.getParam('navSrcForSearchSuccess')
    ? navigation.getParam('navSrcForSearchSuccess')
    : '';
  const [dataToShow, setDataToShow] = useState(initData);
  const [lastIndex, setLastIndex] = useState<number>(data?.length > 4 ? step : 0);
  const { isPharmacyLocationServiceable } = useAppCommonData();
  const { showAphAlert, setLoading: setGlobalLoading } = useUIElements();
  const {
    getCartItemQty,
    serverCartItems,
    setAddToCartSource,
    cartLocationDetails,
    pharmacyCircleAttributes,
    setServerCartItems,
  } = useShoppingCart();
  const { setUserActionPayload } = useServerCart();
  const [showSuggestedQuantityNudge, setShowSuggestedQuantityNudge] = useState<boolean>(false);
  const [shownNudgeOnce, setShownNudgeOnce] = useState<boolean>(false);
  const [currentProductIdInCart, setCurrentProductIdInCart] = useState<string>(null);
  const [currentProductQuantityInCart, setCurrentProductQuantityInCart] = useState<number>(0);
  const [itemPackForm, setItemPackForm] = useState<string>('');
  const [maxOrderQty, setMaxOrderQty] = useState<number>(0);
  const [suggestedQuantity, setSuggestedQuantity] = useState<string>(null);
  const { currentPatient } = useAllCurrentPatients();

  useEffect(() => {
    if (serverCartItems?.find(({ sku }) => sku?.toUpperCase() === currentProductIdInCart)) {
      if (shownNudgeOnce === false) {
        setShowSuggestedQuantityNudge(true);
      }
    }
  }, [serverCartItems, currentProductQuantityInCart, currentProductIdInCart]);

  useEffect(() => {
    if (showSuggestedQuantityNudge === false) {
      setShownNudgeOnce(false);
    }
  }, [currentProductIdInCart]);

  useEffect(() => {}, [showSuggestedQuantityNudge]);

  const onPress = (sku: string, urlKey: string, index: number, item) => {
    if (
      movedFrom === ProductPageViewedSource.SIMILAR_PRODUCTS ||
      movedFrom === ProductPageViewedSource.PDP_ALL_SUSBTITUTES
    ) {
      navigation.push(AppRoutes.ProductDetailPage, {
        sku,
        movedFrom,
        sectionName,
        productPageViewedEventProps,
        urlKey,
        navSrcForSearchSuccess,
      });
    } else {
      navigation.push(AppRoutes.ProductDetailPage, {
        sku,
        movedFrom,
        sectionName,
        productPageViewedEventProps,
        urlKey,
        navSrcForSearchSuccess,
      });
    }
    if (comingFromSearch !== false) {
      const pincode = cartLocationDetails?.pincode;
      const availability = getAvailabilityForSearchSuccess(pincode, item?.sku);
      const discount = getDiscountPercentage(item?.price, item?.special_price);
      const discountPercentage = discount ? discount + '%' : '0%';
      const cleverTapEventAttributes = {
        'Nav src': navSrcForSearchSuccess,
        Status: 'Success',
        Keyword: searchText,
        Position: index + 1,
        Source: 'Full search',
        Action: 'Product detail page viewed',
        'Product availability': availability ? 'Is in stock' : 'Out of stock',
        'Product position': index + 1,
        'Results shown': data?.length,
        'SKU ID': item?.sku,
        'Product name': item?.name,
        Discount: discountPercentage,
      };
      postCleverTapEvent(CleverTapEventName.PHARMACY_SEARCH_SUCCESS, cleverTapEventAttributes);
    }
  };

  const onPressNotify = (name: string) => {
    showAphAlert!({
      title: 'Okay! :)',
      description: `You will be notified when ${name} is back in stock.`,
    });
  };

  const onPressAddToCart = (item: MedicineProduct, index: number) => {
    updateServerCartLocally(1, item?.sku);

    // const { onAddedSuccessfully } = restOfProps;// commenting that because this is unused
    const discount = getDiscountPercentage(item?.price, item?.special_price);
    const discountPercentage = discount ? discount + '%' : '0%';
    const cleverTapSearchSuccessEventAttributes = {
      'Nav src': navSrcForSearchSuccess,
      Status: 'Success',
      Keyword: searchText,
      Position: index + 1,
      Source: 'Full search',
      Action: 'Add to cart',
      'Product availability': 'Available',
      'Product position': index + 1,
      'Results shown': totalProducts,
      'SKU ID': item?.sku,
      'Product name': item?.name,
      Discount: discountPercentage,
    };
    setAddToCartSource?.({ source: addToCartSource, categoryId: item?.category_id });
    setUserActionPayload?.({
      medicineOrderCartLineItems: [
        {
          medicineSKU: item?.sku,
          quantity: 1,
        },
      ],
    });
    addPharmaItemToCart(
      formatToCartItem(item),
      cartLocationDetails?.pincode,
      () => {},
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
      JSON.stringify(serverCartItems),
      () => {},
      pharmacyCircleAttributes!,
      () => {},
      comingFromSearch,
      cleverTapSearchSuccessEventAttributes
    );
    setCurrentProductIdInCart(item.sku);
    item?.pack_form ? setItemPackForm(item?.pack_form) : setItemPackForm('');
    item?.suggested_qty ? setSuggestedQuantity(item?.suggested_qty) : setSuggestedQuantity(null);
    item?.MaxOrderQty
      ? setMaxOrderQty(item?.MaxOrderQty)
      : item?.suggested_qty
      ? setMaxOrderQty(+item?.suggested_qty)
      : setMaxOrderQty(0);
    setCurrentProductQuantityInCart(1);
  };

  const onPressCareCashback = () => {
    navigation.navigate(AppRoutes.CommonWebView, {
      url: AppConfig.Configuration.CIRLCE_PHARMA_URL,
      source: 'Pharma',
    });
  };

  const updateServerCartLocally = (quantity: number = 0, id: string) => {
    try {
      const items = serverCartItems || [];
      let doesExists = false;
      items.forEach((i) => {
        const qty = i?.quantity || 0;
        if (i?.sku === id) {
          i.quantity = qty + quantity;
          doesExists = true;
          return;
        }
      });

      if (!doesExists) {
        items.push({ sku: id, quantity: 1 });
      }

      setServerCartItems && setServerCartItems(items);
    } catch (e) {}
  };

  const renderItem = useCallback(
    (info: ListRenderItemInfo<MedicineProduct>) => {
      const { item, index } = info;
      const id = item?.sku;
      let qty = getCartItemQty(id);
      const onPressAddQty = () => {
        if (qty < item?.MaxOrderQty) {
          qty = qty + 1;
          setCurrentProductQuantityInCart(qty);
          updateServerCartLocally(1, id);
          setUserActionPayload?.({
            medicineOrderCartLineItems: [
              {
                medicineSKU: item?.sku,
                quantity: qty,
              },
            ],
          });
        }
      };
      const onPressSubtractQty = () => {
        qty = qty - 1;
        setCurrentProductQuantityInCart(qty);
        updateServerCartLocally(-1, id);
        setUserActionPayload?.({
          medicineOrderCartLineItems: [
            {
              medicineSKU: item?.sku,
              quantity: qty,
            },
          ],
        });
      };

      const props: ProductCardProps = {
        ...item,
        quantity: qty,
        onPress: () => onPress(item.sku, item.url_key, index, item),
        onPressAddToCart: () => onPressAddToCart(item, index),
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
    [serverCartItems]
  );

  const keyExtractor = useCallback(({ sku }) => `${sku}`, []);

  const renderItemSeparator = useCallback(() => <View style={styles.itemSeparator} />, []);

  return (
    <View>
      <FlatList
        nestedScrollEnabled
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
      {showSuggestedQuantityNudge &&
        shownNudgeOnce === false &&
        !!suggestedQuantity &&
        +suggestedQuantity > 1 &&
        currentProductQuantityInCart < +suggestedQuantity && (
          <SuggestedQuantityNudge
            suggested_qty={suggestedQuantity}
            sku={currentProductIdInCart}
            packForm={itemPackForm}
            maxOrderQty={maxOrderQty}
            setShownNudgeOnce={setShownNudgeOnce}
            showSuggestedQuantityNudge={showSuggestedQuantityNudge}
            setShowSuggestedQuantityNudge={setShowSuggestedQuantityNudge}
            setCurrentProductQuantityInCart={setCurrentProductQuantityInCart}
          />
        )}
    </View>
  );
};

export const ProductList = React.memo(ProductListFun);

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
