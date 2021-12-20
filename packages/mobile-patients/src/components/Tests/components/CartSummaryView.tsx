import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { BlackArrowDown, ClockIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import {
  DiagnosticsCartItem,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { isSmallDevice, nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  calculatePackageDiscounts,
  diagnosticsDisplayPrice,
  getPricesForItem,
} from '@aph/mobile-patients/src/utils/commonUtils';
import {
  DIAGNOSTIC_GROUP_PLAN,
  getDiagnosticCartItemReportGenDetails,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import DiscountPercentage from '@aph/mobile-patients/src/components/Tests/components/DiscountPercentage';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import {
  getDiagnosticCartRecommendations,
  getDiagnosticsByItemIdCityId,
  getReportTAT,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  REPORT_TAT_SOURCE,
  TEST_COLLECTION_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics } from '@aph/mobile-patients/src/graphql/types/findDiagnosticsByItemIDsAndCityID';
import { getConfigurableReportTAT_getConfigurableReportTAT_itemLevelReportTATs } from '@aph/mobile-patients/src/graphql/types/getConfigurableReportTAT';

export interface CartPageSummaryProps {
  containerStyle: StyleProp<ViewStyle>;
  _onPressShowLess: () => void;
  cartItems: DiagnosticsCartItem[];
  isCircleSubscribed: boolean;
  locationDetails: any;
  client: any;
  cityId: number;
  recommendationCount: (count: number) => void;
}

export const CartPageSummary: React.FC<CartPageSummaryProps> = (props) => {
  const {
    containerStyle,
    _onPressShowLess,
    cartItems,
    isCircleSubscribed,
    locationDetails,
    client,
    cityId,
  } = props;
  const {
    updateCartItem,
    setCartItems,
    addCartItem,
    removeCartItem,
    removeMultiPatientCartItems,
  } = useDiagnosticsCart();
  const { setLoading } = useUIElements();
  const [recommendationsData, setRecommendationsData] = useState([] as any);
  const [reportTat, setReportTat] = useState([] as any);
  const [recommendationsTat, setRecommendationsTat] = useState([] as any);
  const [topBookedTests, setTopBookedTests] = useState([] as any);

  const itemCount = cartItems?.length;
  const itemCountText = itemCount > 9 ? `${itemCount}` : `0${itemCount}`;
  const zipCode = !!locationDetails?.pincode ? locationDetails?.pincode : 0;
  const cartItemIds = cartItems?.map((item) => Number(item?.id));
  var previousTat: any[];

  type itemReportTat = getConfigurableReportTAT_getConfigurableReportTAT_itemLevelReportTATs;

  useEffect(() => {
    if (cartItems?.length > 0) {
      fetchPricesForItems(cartItemIds); //fetch prices.
      fetchReportTat(cartItemIds); //for fetching the report tat
      fetchCartPageRecommendations(cartItemIds); //cartpage recommendations
      fetchTestReportGenDetails(cartItemIds);
    }
  }, [cartItems?.length]);

  const updatePricesInCart = (results: any) => {
    const arrayToChoose = cartItems;

    if (results?.length == 0) {
      setLoading?.(false);
    }
    const disabledCartItems = arrayToChoose?.filter(
      (cartItem) =>
        !results?.find(
          (d: findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics) =>
            `${d?.itemId}` == cartItem?.id
        )
    );
    let isItemDisable = false,
      isPriceChange = false;
    if (arrayToChoose?.length > 0) {
      arrayToChoose?.map((cartItem) => {
        const isItemInCart = results?.findIndex(
          (item: any) => String(item?.itemId) === String(cartItem?.id)
        );

        if (isItemInCart !== -1) {
          const pricesForItem = getPricesForItem(
            results?.[isItemInCart]?.diagnosticPricing,
            results?.[isItemInCart]?.packageCalculatedMrp!
          );
          if (!pricesForItem?.itemActive) {
            return null;
          }

          const specialPrice = pricesForItem?.specialPrice!;
          const price = pricesForItem?.price!;
          const circlePrice = pricesForItem?.circlePrice!;
          const circleSpecialPrice = pricesForItem?.circleSpecialPrice!;
          const discountPrice = pricesForItem?.discountPrice!;
          const discountSpecialPrice = pricesForItem?.discountSpecialPrice!;
          const planToConsider = pricesForItem?.planToConsider;

          const promoteCircle = pricesForItem?.promoteCircle;
          const promoteDiscount = pricesForItem?.promoteDiscount;

          const priceToCompare =
            isCircleSubscribed && promoteCircle
              ? circleSpecialPrice
              : promoteDiscount
              ? discountSpecialPrice
              : specialPrice || price;

          let cartPriceToCompare = 0;
          if (isCircleSubscribed && cartItem?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE) {
            cartPriceToCompare = Number(cartItem?.circleSpecialPrice);
          } else if (cartItem?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT) {
            cartPriceToCompare = Number(cartItem?.discountSpecialPrice);
          } else {
            cartPriceToCompare = Number(cartItem?.specialPrice || cartItem?.price);
          }
          if (priceToCompare !== cartPriceToCompare) {
            isPriceChange = true;
            // setShowPriceMismatch(true); -> your cart has been updated....
            let updatedObject = {
              id: results?.[isItemInCart]
                ? String(results?.[isItemInCart]?.itemId)
                : String(cartItem?.id),
              name: results?.[isItemInCart]?.itemName || '',
              price: price,
              specialPrice: specialPrice || price,
              circlePrice: circlePrice,
              circleSpecialPrice: circleSpecialPrice,
              discountPrice: discountPrice,
              discountSpecialPrice: discountSpecialPrice,
              mou: 1,
              thumbnail: cartItem?.thumbnail,
              groupPlan: planToConsider?.groupPlan,
              packageMrp: results?.[isItemInCart]?.packageCalculatedMrp,
              inclusions:
                results?.[isItemInCart]?.inclusions == null
                  ? [Number(results?.[isItemInCart]?.itemId)]
                  : results?.[isItemInCart]?.inclusions,
              collectionMethod: TEST_COLLECTION_TYPE.HC,
              isSelected: cartItem?.isSelected,
            };

            // updateCartItemsLocally(updatedObject, index, arrayToChoose?.length);
            updateCartItem?.(updatedObject);
          }
          setLoading?.(false);
        }
        //if items not available
        if (disabledCartItems?.length) {
          isItemDisable = true;
          const disabledCartItemIds = disabledCartItems?.map((item) => item?.id);
          setLoading?.(false);
          removeDisabledCartItems(disabledCartItemIds);
          // removeDisabledPatientCartItems(disabledCartItemIds); //patient cart items ??
          // setShowPriceMismatch(true); //show price mismatch msg
        }
      });
      if (!isItemDisable && !isPriceChange) {
        isPriceChange = false;
        isItemDisable = false;
        setLoading?.(false);
      }
    }
  };

  const removeDisabledCartItems = (disabledCartItemIds: string[]) => {
    setCartItems?.(
      cartItems?.filter((cItem) => !disabledCartItemIds?.find((dItem) => dItem == cItem?.id))
    );
  };

  function createRecommendationsObject(result: any, widgetsData: any) {
    let resultantObjectArray: DiagnosticsCartItem[] = [];
    result?.map((item: any, index: number) => {
      const pricesForItem = getPricesForItem(item?.diagnosticPricing, item?.packageCalculatedMrp!);
      const specialPrice = pricesForItem?.specialPrice!;
      const price = pricesForItem?.price!; //more than price (black)
      const circlePrice = pricesForItem?.circlePrice!;
      const circleSpecialPrice = pricesForItem?.circleSpecialPrice!;
      const discountPrice = pricesForItem?.discountPrice!;
      const discountSpecialPrice = pricesForItem?.discountSpecialPrice!;
      const planToConsider = pricesForItem?.planToConsider;

      //create this same as updatedObject wala
      resultantObjectArray.push({
        id: String(item?.itemId),
        name: item?.itemName,
        mou: 1,
        thumbnail: null,
        collectionMethod: TEST_COLLECTION_TYPE.HC,
        isSelected: true,
        price: price,
        specialPrice: specialPrice || price,
        circlePrice: circlePrice,
        circleSpecialPrice: circleSpecialPrice,
        discountPrice: discountPrice,
        discountSpecialPrice: discountSpecialPrice,
        groupPlan: planToConsider?.groupPlan,
        packageMrp: item?.packageCalculatedMrp,
        inclusions: item?.inclusions == null ? [Number(item?.itemId)] : item?.inclusions,
      });
    });
    return resultantObjectArray;
  }

  const fetchPricesForItems = async (
    cartItemsId: number[],
    widgetsData?: any,
    originalItemIds?: any,
    source?: string
  ) => {
    !!source ? null : setLoading?.(true);
    try {
      let getResponse = await getDiagnosticsByItemIdCityId(
        client,
        Number(cityId),
        cartItemsId,
        Number(zipCode)
      );
      if (!!getResponse?.data?.findDiagnosticsByItemIDsAndCityID?.diagnostics) {
        const diagnosticItems =
          getResponse?.data?.findDiagnosticsByItemIDsAndCityID?.diagnostics || [];
        if (source == 'fetchCartPageRecommendations') {
          const getRecommendationsArray = createRecommendationsObject(diagnosticItems, widgetsData);
          setRecommendationsData(getRecommendationsArray);
          props.recommendationCount(getRecommendationsArray?.length);
          setLoading?.(false);
        } else if (source == 'fetchTestReportGenDetails') {
          const getTopBookedObject = createRecommendationsObject(diagnosticItems, widgetsData);
          setTopBookedTests(getTopBookedObject);
          setLoading?.(false);
        }
        //for normal cart items
        else {
          updatePricesInCart(diagnosticItems);
        }
      } else {
        setLoading?.(false);
      }
    } catch (error) {
      setLoading?.(false);
      CommonBugFender('fetchPricesforItem_CartSummaryView', error);
    }
  };

  async function fetchReportTat(_cartItemId: number[], source?: string) {
    try {
      const result = await getReportTAT(
        client,
        null,
        Number(cityId),
        Number(zipCode),
        _cartItemId!,
        REPORT_TAT_SOURCE.CART_PAGE
      );
      if (result?.data?.getConfigurableReportTAT) {
        const getMaxReportTat = result?.data?.getConfigurableReportTAT?.itemLevelReportTATs || [];
        if (!!source) {
          const combinedTAT = recommendationsTat?.concat(getMaxReportTat);
          setRecommendationsTat(combinedTAT);
        } else {
          setReportTat(getMaxReportTat);
        }
      } else {
        resetReportTat(source);
      }
    } catch (error) {
      CommonBugFender('fetchReportTat_CartSummaryView', error);
    }
  }

  function resetReportTat(source?: string) {
    if (!!source) {
      setRecommendationsTat([]);
    } else {
      setReportTat([]);
    }
  }

  const fetchCartPageRecommendations = async (_cartItemId: string | number[]) => {
    try {
      const listOfIds = _cartItemId;
      const recommedationResponse: any = await getDiagnosticCartRecommendations(
        client,
        listOfIds || [Number(_cartItemId)],
        10
      );
      if (recommedationResponse?.data?.getDiagnosticItemRecommendations) {
        const getRecommendationItems =
          recommedationResponse?.data?.getDiagnosticItemRecommendations?.itemsData;
        if (getRecommendationItems?.length > 0) {
          const _itemIds = getRecommendationItems?.map((item: any) => Number(item?.itemId));
          const _filterItemIds = _itemIds?.filter(
            (val: any) => !!cartItemIds && cartItemIds?.length && !cartItemIds?.includes(val)
          );
          fetchReportTat(_filterItemIds, 'fetchCartPageRecommendations');
          fetchPricesForItems(
            _filterItemIds, //all item id's which are not already part of cartItems
            getRecommendationItems, //widgets data
            listOfIds,
            'fetchCartPageRecommendations'
          );
        } else {
          //in case no results are there, or less than 2 -> show top booked test as result in case of test
          setRecommendationsData([]);
        }
      } else {
        setRecommendationsData([]); //show top booked tests
      }
    } catch (error) {
      CommonBugFender('CartPage_fetchCartPageRecommendations', error);
      setRecommendationsData([]);
      //show top booked tests
    }
  };

  const fetchTestReportGenDetails = async (_cartItemId: string | number[]) => {
    try {
      const listOfIds = _cartItemId;

      const res: any = await getDiagnosticCartItemReportGenDetails(listOfIds?.toString(), cityId);
      if (res?.data?.success) {
        const widgetsData = res?.data?.widget_data?.[0]?.diagnosticWidgetData;
        const _itemIds = widgetsData?.map((item: any) => Number(item?.itemId));
        const _filterItemIds = _itemIds?.filter((val: any) => !cartItemIds?.includes(val));
        fetchReportTat(_filterItemIds, 'fetchTestReportGenDetails');
        fetchPricesForItems(_filterItemIds, widgetsData, listOfIds, 'fetchTestReportGenDetails');
      } else {
        setTopBookedTests([]);
      }
    } catch (e) {
      CommonBugFender('CartPage_fetchTestReportGenDetails', e);
      setTopBookedTests([]);
    }
  };

  function onPressRemoveFromCart(selectedItem: DiagnosticsCartItem) {
    removeCartItem?.(`${selectedItem?.id}`);
    removeMultiPatientCartItems?.(`${selectedItem?.id}`);
  }

  function onPressAddToCart(selectedItem: DiagnosticsCartItem) {
    addCartItem?.(selectedItem);
  }

  const renderAddToCartView = (selectedItem: DiagnosticsCartItem) => {
    const isAddedToCart = !!cartItems?.find((item) => Number(item?.id) == Number(selectedItem?.id));

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() =>
          isAddedToCart ? onPressRemoveFromCart(selectedItem) : onPressAddToCart(selectedItem)
        }
      >
        {isAddedToCart ? (
          <View style={styles.removeCtaView}>
            <Text style={styles.removeCta}>{string.diagnostics.removeFromCart}</Text>
          </View>
        ) : (
          <View style={styles.addCtaView}>
            <Text style={styles.addCta}>{string.diagnostics.addToCart}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderItemsCountView = () => {
    return (
      <View style={styles.topView}>
        {/**should be unique + selected */}
        <View>
          <Text style={styles.itemCountText}>
            {itemCountText} {itemCount > 1 ? 'Items' : 'Item'} added to your cart
          </Text>
          <Text style={styles.perPersonText}>Prices are for Per Person</Text>
        </View>
        <TouchableOpacity onPress={() => _onPressShowLess()} style={styles.rowStyle}>
          <Text style={styles.showLessText}>Show Less</Text>
          <BlackArrowDown style={styles.viewDetailsUpIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderMainPriceView = (slashedPrice: number | null | undefined, priceToShow: number) => {
    return (
      <View style={styles.priceView}>
        <Text style={styles.mainPriceText}>
          {!!slashedPrice && (
            <Text style={styles.packageSlashedPrice}>
              {string.common.Rs}
              <Text style={{ textDecorationLine: 'line-through' }}>{slashedPrice}</Text>
            </Text>
          )}{' '}
          {string.common.Rs}
          {priceToShow}
        </Text>
      </View>
    );
  };

  const renderItemType = (count: number | null) => {
    const itemType = !!count && count > 1 ? 'Package' : 'Test';
    return (
      <View
        style={[
          styles.itemTypeView,
          {
            width: itemType == 'Test' ? 40 : 60,
          },
        ]}
      >
        <Text style={styles.itemTypeText}>{itemType}</Text>
      </View>
    );
  };

  const renderInclusionPercentageView = (
    promoteCircle: boolean,
    circleDiscount: any,
    promoteDiscount: any,
    specialDiscount: any,
    discount: any,
    inclusionCount: number
  ) => {
    return (
      <View style={styles.inclusionPercentageView}>
        <Text style={styles.perPersonText}>
          {`${inclusionCount} ${inclusionCount > 1 ? 'tests' : 'test'}`} included
        </Text>
        {renderPercentageDiscount(
          promoteCircle && isCircleSubscribed
            ? circleDiscount
            : promoteDiscount
            ? specialDiscount
            : discount,
          promoteCircle && isCircleSubscribed ? true : false,
          promoteDiscount && specialDiscount > 0 ? specialDiscount : 0,
          discount > 0 ? discount : 0
        )}
      </View>
    );
  };

  const renderPercentageDiscount = (
    discount: string | number,
    isOnlyCircle: boolean,
    specialDiscount: number,
    hasOtherDiscount: number
  ) => {
    const discountPrice =
      specialDiscount > 0 ? specialDiscount : hasOtherDiscount > 0 ? hasOtherDiscount : 0;
    return (
      <View style={styles.discountPercentageView}>
        <DiscountPercentage
          discount={discount}
          isOnlyCircle={isOnlyCircle}
          discountPrice={discountPrice}
          discountViewStyle={styles.discountView}
        />
      </View>
    );
  };

  const renderReportTat = (getReportTatMsg: string) => {
    return (
      <View style={styles.rowStyle}>
        <ClockIcon style={styles.clockIcon} />
        <Text style={styles.reportTatText}>{getReportTatMsg}</Text>
      </View>
    );
  };

  const renderTATButtonView = (reportTat: itemReportTat, item: DiagnosticsCartItem) => {
    const getReportTatMsg = !!reportTat && reportTat?.preOrderReportTATMessage;
    return (
      <View
        style={[
          styles.reportTatButtonView,
          {
            justifyContent: !!reportTat ? 'space-between' : 'flex-end',
          },
        ]}
      >
        {!!reportTat ? renderReportTat(getReportTatMsg!) : null}
        {renderAddToCartView(item)}
      </View>
    );
  };

  const renderCartItem = (
    item: DiagnosticsCartItem,
    index: number,
    array: DiagnosticsCartItem[],
    source: string
  ) => {
    const inclusionCount = !!item?.inclusions ? item?.inclusions?.length : 1;
    const arrayToUseForTAT = source == 'recommendations' ? recommendationsTat : reportTat;
    const itemReportTAT = arrayToUseForTAT?.find(
      (res: itemReportTat) => Number(res?.itemId) == Number(item?.id)
    );
    const priceToShow = diagnosticsDisplayPrice(item, isCircleSubscribed)?.priceToShow;
    const slashedPrice = diagnosticsDisplayPrice(item, isCircleSubscribed)?.slashedPrice;
    const discount = calculatePackageDiscounts(item?.packageMrp!, item?.price, item?.specialPrice!);
    const circleDiscount = calculatePackageDiscounts(
      0, //itemPackageMrp is removed
      item?.circlePrice!,
      item?.circleSpecialPrice!
    );
    const specialDiscount = calculatePackageDiscounts(
      item?.packageMrp!,
      item?.discountPrice!,
      item?.discountSpecialPrice!
    );
    const promoteCircle = item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE; //if circle discount is more
    const promoteDiscount = promoteCircle ? false : discount < specialDiscount;

    return (
      <View
        style={[
          { marginLeft: 16 },
          source == 'recommendations' && styles.recommendationsOuterView,
          {
            marginTop: index == 0 ? 12 : 0,
          },
        ]}
      >
        <View
          style={[styles.cartItemsInnerView, { paddingTop: source == 'recommendations' ? 0 : 12 }]}
        >
          <View style={styles.nameTypeView}>
            <View style={styles.nameView}>
              <Text style={styles.itemNameText}>{nameFormater(item?.name, 'default')}</Text>
            </View>
            {renderItemType(inclusionCount)}
          </View>
          {renderMainPriceView(slashedPrice, priceToShow)}
        </View>
        {renderInclusionPercentageView(
          promoteCircle,
          circleDiscount,
          promoteDiscount,
          specialDiscount,
          discount,
          inclusionCount
        )}
        {renderTATButtonView(itemReportTAT, item)}
        {index == array?.length - 1
          ? null
          : source == 'cartItems' && <Spearator style={{ marginTop: 12 }} />}
      </View>
    );
  };

  const renderCartItems = () => {
    return (
      <View>
        {cartItems?.map((item, index) => {
          return renderCartItem(item, index, cartItems, 'cartItems');
        })}
      </View>
    );
  };

  const renderCartRecommendations = () => {
    const findPackageSKU = cartItems?.find((_item: any) => _item?.inclusions?.length > 1);
    const hasPackageSKU = !!findPackageSKU;
    var newArray: string | any[] = [];
    const dataToShow =
      recommendationsData?.length > 2
        ? recommendationsData
        : !hasPackageSKU
        ? newArray.concat(recommendationsData).concat(topBookedTests)
        : recommendationsData;

    return (
      <View style={styles.recommendationsView}>
        <Text style={styles.recommendedForText}>Recommended for you</Text>
        {dataToShow?.map((item: any, index: number) => {
          return renderCartItem(item, index, dataToShow, 'recommendations');
        })}
      </View>
    );
  };

  return (
    <View style={containerStyle}>
      {renderItemsCountView()}
      <Spearator style={{ marginTop: -8 }} />
      <ScrollView bounces={false}>
        {renderCartItems()}
        {recommendationsData?.length > 0 && renderCartRecommendations()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  priceView: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    marginTop: 2,
    marginRight: 4,
    flex: 1,
  },
  rightView: {
    flex: 1,
    marginLeft: 6,
    width: '70%',
  },
  mainPriceText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 12.5 : 14, theme.colors.SHERPA_BLUE, 1, 16),
    marginTop: 2,
  },
  packageSlashedPrice: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 9 : 10, theme.colors.SHERPA_BLUE, 0.6, 16),
    marginTop: 5,
    marginRight: 6,
  },
  discountPercentageView: { alignItems: 'flex-end' },
  discountView: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginHorizontal: 0,
    marginTop: 2,
  },
  viewDetailsText: {
    ...theme.viewStyles.text('M', 12, colors.APP_YELLOW, 1, 16),
  },
  viewDetailsUpIcon: {
    tintColor: theme.colors.APP_YELLOW,
    height: 12,
    width: 12,
    resizeMode: 'contain',
    marginHorizontal: 5,
    marginVertical: 3,
  },
  addCtaView: {
    backgroundColor: colors.WHITE,
    borderColor: colors.APP_YELLOW,
    borderRadius: 10,
    borderWidth: 1,
    padding: 6,
  },
  removeCtaView: {
    backgroundColor: colors.ORANGE,
    borderColor: colors.ORANGE,
    borderRadius: 10,
    borderWidth: 1,
    padding: 6,
  },
  addCta: {
    ...theme.viewStyles.text('B', isSmallDevice ? 12 : 13, colors.LIGHT_ORANGE_YELLOW, 1, 18, 0),
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  removeCta: {
    ...theme.viewStyles.text('B', isSmallDevice ? 12 : 13, colors.WHITE, 1, 18, 0),
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  perPersonText: { ...theme.viewStyles.text('R', 12, colors.LIGHT_BLUE, 1, 16) },
  topView: {
    flexDirection: 'row',
    backgroundColor: colors.BGK_GRAY,
    justifyContent: 'space-between',
    margin: 16,
  },
  itemCountText: { ...theme.viewStyles.text('M', 14, colors.SHERPA_BLUE, 1, 19) },
  showLessText: { ...theme.viewStyles.text('M', 14, colors.APP_YELLOW, 1, 19) },
  rowStyle: { flexDirection: 'row' },
  itemTypeView: {
    marginLeft: 6,
    backgroundColor: '#F4F4F4',
    justifyContent: 'center',
    alignItems: 'center',
    height: 28,
  },
  itemTypeText: { ...theme.viewStyles.text('M', 10, colors.LIGHT_BLUE, 1, 13) },
  inclusionPercentageView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 3,
  },
  clockIcon: { height: 16, width: 12, resizeMode: 'contain' },
  reportTatText: {
    ...theme.viewStyles.text('M', 10, colors.SHERPA_BLUE, 1, 16, 0.04),
    marginLeft: 6,
  },
  reportTatButtonView: { flexDirection: 'row', marginRight: 16, marginTop: 4 },
  recommendationsOuterView: {
    backgroundColor: colors.WHITE,
    marginBottom: 16,
    marginRight: 16,
    padding: 12,
  },
  cartItemsInnerView: { flexDirection: 'row', justifyContent: 'space-between', marginRight: 16 },
  nameTypeView: { flexDirection: 'row', width: '74%' },
  nameView: { maxWidth: '70%', justifyContent: 'center' },
  itemNameText: { ...theme.viewStyles.text('M', 14, colors.SHERPA_BLUE, 1, 22) },
  recommendationsView: { backgroundColor: '#F2FBFF', marginTop: 12 },
  recommendedForText: {
    ...theme.viewStyles.text('M', 14, colors.CHAT_TILE_BG, 1, 19),
    marginTop: 16,
    marginLeft: 16,
  },
});
