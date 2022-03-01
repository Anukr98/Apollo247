import { WidgetLiverIcon, CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  renderCircleShimmer,
  renderItemPriceShimmer,
} from '@aph/mobile-patients/src/components/ui/ShimmerFactory';
import React, { useCallback } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Image } from 'react-native-elements';
import { isEmptyObject, isSmallDevice } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';
import {
  DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE,
  DIAGNOSTIC_ITEM_GENDER,
  getPricesForItem,
  createDiagnosticAddToCartObject,
} from '@aph/mobile-patients/src/components/Tests/utils/helpers';
import { TEST_COLLECTION_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { NavigationRoute, NavigationScreenProp } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { TestPackageForDetails } from '@aph/mobile-patients/src/components/Tests/TestDetails';
import {
  DiagnosticHomePageWidgetClicked,
  DiagnosticAddToCartEvent,
} from '@aph/mobile-patients/src/components/Tests/utils/Events';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { DIAGNOSTICS_ITEM_TYPE } from '@aph/mobile-patients/src/helpers/CleverTapEvents';
const screenWidth = Dimensions.get('window').width;
const CARD_WIDTH = screenWidth - 32;
const CARD_HEIGHT = 95; //210
export interface FullWidthItemCardProps {
  onPress?: (item: any) => void;
  isCircleSubscribed: boolean;
  style?: ViewStyle;
  showSeparator?: boolean;
  loading?: boolean;
  data: any;
  isServiceable?: boolean;
  isVertical: boolean;
  columns?: number;
  navigation: NavigationScreenProp<NavigationRoute<object>, object>;
  source: DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE;
  sourceScreen: string;
  extraData?: any;
  changeCTA?: boolean;
  onEndReached?: any;
  diagnosticWidgetData?: any;
  isPriceAvailable?: boolean;
  onPressAddToCartFromCart?: (item: any, addedItems: any) => void;
  onPressRemoveItemFromCart?: (item: any) => void;
  recommedationDataSource?: string;
  widgetHeading?: string;
  isPackage?: boolean;
}

const FullWidthItemCard: React.FC<FullWidthItemCardProps> = (props) => {
  const {
    cartItems,
    addCartItem,
    removeCartItem,
    modifiedOrderItemIds,
    modifiedOrder,
    setModifiedPatientCart,
    removeMultiPatientCartItems,
    patientCartItems,
  } = useDiagnosticsCart();
  const {
    data,
    isCircleSubscribed,
    navigation,
    diagnosticWidgetData,
    source,
    changeCTA,
    sourceScreen,
    onPressAddToCartFromCart,
    onPressRemoveItemFromCart,
    recommedationDataSource,
    widgetHeading,
  } = props;
  const { currentPatient } = useAllCurrentPatients();
  const { isDiagnosticCircleSubscription } = useDiagnosticsCart();

  const isModifyFlow = !!modifiedOrder && !isEmptyObject(modifiedOrder);
  let actualItemsToShow =
    source === 'Cart page'
      ? data?.length > 0 && data
      : diagnosticWidgetData?.length > 0 && diagnosticWidgetData;

  function getCount(array: any) {
    return array?.reduce((prevVal: any, curr: any) => prevVal + curr?.length, 0);
  }

  function getMandatoryParamterResults(arr: any) {
    return arr?.filter((item: any) => item?.mandatoryValue === '1');
  }

  function inclusionParameterLogic(getItem: any) {
    const inclusions = getItem?.inclusionData || getItem?.diagnosticInclusions;

    const getMandatoryParamter =
      !!inclusions && inclusions?.length > 0
        ? inclusions?.map((inclusion: any) =>
            getMandatoryParamterResults(
              sourceScreen == AppRoutes.TestDetails
                ? inclusion?.observations
                : inclusion?.incObservationData
            )
          )
        : [];

    const getInclusionCount = !!inclusions && inclusions?.length > 0 ? inclusions?.length : 1;

    const getRecommendationTestOberservations =
      (!!!inclusions || inclusions?.length == 0) && getItem?.observations;

    const getMandatoryObervations =
      !!getRecommendationTestOberservations && getRecommendationTestOberservations?.length > 0
        ? getMandatoryParamterResults(getItem?.observations)
        : [];

    const getObervationCount =
      !!getMandatoryObervations &&
      getMandatoryObervations?.length > 0 &&
      getMandatoryObervations?.length;

    const getMandatoryParameterCount =
      !!getMandatoryParamter && getMandatoryParamter?.length > 0
        ? getCount(getMandatoryParamter)
        : !!getObervationCount
        ? getObervationCount
        : undefined;

    const nonInclusionTests =
      !!inclusions && inclusions?.length > 0
        ? inclusions?.filter((inclusion: any) => inclusion?.incObservationData?.length == 0)
        : [];

    const countToShow = getMandatoryParameterCount + nonInclusionTests?.length || getInclusionCount;

    return {
      getMandatoryParameterCount,
      getInclusionCount,
      countToShow,
    };
  }

  const renderItemCard = useCallback(
    (item: any) => {
      const getItem = item?.item;
      const getDiagnosticPricingForItem = getItem?.diagnosticPricing;
      // if (getDiagnosticPricingForItem == undefined || getDiagnosticPricingForItem == null) {
      //   return null;
      // }
      const packageMrpForItem = getItem?.packageCalculatedMrp!;
      const pricesForItem = getPricesForItem(getDiagnosticPricingForItem, packageMrpForItem);
      if (props.isPriceAvailable && !pricesForItem?.itemActive) {
        return null;
      }

      const imageUrl = getItem?.itemImageUrl || getItem?.imageUrl;
      const name = getItem?.itemTitle || getItem?.itemName;
      const {
        priceToShow,
        promoteCircle,
        promoteDiscount,
        price,
        circleSpecialPrice,
      } = calculatePriceToShow(pricesForItem, packageMrpForItem);

      const slashedPrice =
        !!packageMrpForItem && packageMrpForItem > price ? packageMrpForItem : price;

      const hasSlashedPrice =
        (!isCircleSubscribed && promoteCircle && priceToShow == slashedPrice) ||
        priceToShow == slashedPrice
          ? null
          : slashedPrice;
      const hasCirclePrice = promoteCircle && !promoteDiscount && priceToShow != circleSpecialPrice;
      const changeStyle = !isCircleSubscribed && hasSlashedPrice && hasCirclePrice;
      return (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => onPress(getItem, packageMrpForItem, pricesForItem)}
          key={item?.item?.itemId}
        >
          <View
            style={[
              styles.itemCardView,
              {
                minHeight: changeStyle ? CARD_HEIGHT + 10 : CARD_HEIGHT,
              },
              props?.isVertical ? {} : { marginLeft: item?.index == 0 ? 22 : 6 },
            ]}
          >
            <View style={styles.topView}>
              <View style={styles.topLeftView}>
                {!!imageUrl && imageUrl != '' ? renderIconView(imageUrl) : null}
                {renderSkuName(name, getItem)}
              </View>
              <View style={styles.topRightView}>
                {renderPricesView(pricesForItem, packageMrpForItem)}
              </View>
            </View>
            {renderBottomView(pricesForItem, packageMrpForItem, getItem, changeStyle)}
          </View>
        </TouchableOpacity>
      );
    },
    [cartItems, patientCartItems]
  );

  const renderBottomView = (
    pricesForItem: any,
    packageMrpForItem: any,
    getItem: any,
    changeStyle: boolean
  ) => {
    const isAddedToCart = !!cartItems?.find(
      (items) => Number(items?.id) == Number(getItem?.itemId)
    );
    const hasPrice = pricesForItem || packageMrpForItem;

    return (
      <View
        style={[
          styles.bottomView,
          {
            marginTop: changeStyle ? 18 : 8,
            justifyContent: hasPrice ? 'space-between' : 'flex-end',
          },
        ]}
      >
        {hasPrice
          ? renderPercentageDiscountView(pricesForItem, packageMrpForItem, getItem)
          : renderCircleShimmer()}
        {renderAddToCart(isAddedToCart, getItem, pricesForItem, packageMrpForItem)}
      </View>
    );
  };

  const renderIconView = (imageUrl: string | any) => {
    const resizedImageUrl = !!imageUrl && imageUrl != '' && imageUrl + '?imwidth=' + 40;
    return (
      <View style={styles.imageView}>
        {imageUrl == '' ? (
          <WidgetLiverIcon style={styles.imageStyle} resizeMode={'contain'} />
        ) : (
          <Image
            placeholderStyle={styles.imagePlaceholderStyle}
            source={{ uri: resizedImageUrl || imageUrl }}
            style={styles.imageStyle}
          />
        )}
      </View>
    );
  };

  const renderSkuName = (name: string, getItem: any) => {
    return (
      <View style={{ minHeight: 40 }}>
        <Text style={[styles.itemNameText]} numberOfLines={2}>
          {name}
        </Text>
        {renderParameterInclusionCount(getItem)}
      </View>
    );
  };

  const renderParameterInclusionCount = (getItem: any) => {
    const { getMandatoryParameterCount, getInclusionCount, countToShow } = inclusionParameterLogic(
      getItem
    );
    return (
      <View style={styles.parameterCountView}>
        {getMandatoryParameterCount > 0 || !!getInclusionCount ? (
          <Text style={styles.parameterText}>
            {`${countToShow} ${countToShow == 1 ? 'test' : 'tests'} included`}
          </Text>
        ) : null}
      </View>
    );
  };

  const renderCircleSubscribeTotalPercentageOff = (
    discount: string | number,
    totalDiscount: number
  ) => {
    return (
      <>
        {!!totalDiscount && totalDiscount > 0 ? (
          <View style={styles.percentageDiscountView}>
            <Text style={styles.percentageDiscountText}>
              {Number(totalDiscount).toFixed(0)}% off
            </Text>
          </View>
        ) : null}
      </>
    );
  };

  const renderPercentageDiscount = (
    discount: string | number,
    isOnlyCircle: boolean,
    specialDiscount: number,
    hasOtherDiscount: number,
    totalDiscount: number
  ) => {
    const discountPrice =
      specialDiscount > 0 ? specialDiscount : hasOtherDiscount > 0 ? hasOtherDiscount : 0;
    const doubleDiscount = !!discount && discount > 0 && discountPrice > 0 && isOnlyCircle;

    return (
      <>
        {isCircleSubscribed && doubleDiscount ? (
          renderCircleSubscribeTotalPercentageOff(discount, totalDiscount)
        ) : (
          <>
            {!!discount && discount > 0 ? (
              <View style={styles.percentageDiscountView}>
                {discountPrice > 0 && (
                  <Text style={styles.percentageDiscountText}>
                    {Number(discountPrice).toFixed(0)}% off {isOnlyCircle && '+ '}
                  </Text>
                )}
                {isOnlyCircle && (
                  <View style={styles.percentageDiscountView}>
                    <CircleLogo style={styles.circleLogoIcon} />
                    <Text style={styles.percentageDiscountText}>
                      {Number(discount).toFixed(0)}% off
                    </Text>
                  </View>
                )}
              </View>
            ) : null}
          </>
        )}
      </>
    );
  };

  const renderPricesView = (pricesForItem: any, packageMrpForItem: any) => {
    return pricesForItem || packageMrpForItem ? (
      <View>{renderMainPriceView(pricesForItem, packageMrpForItem)}</View>
    ) : (
      renderItemPriceShimmer()
    );
  };

  function calculatePriceToShow(pricesForItem: any, packageMrpForItem: any) {
    const promoteCircle = pricesForItem?.promoteCircle;
    const promoteDiscount = pricesForItem?.promoteDiscount;
    const specialPrice = pricesForItem?.specialPrice!;
    const price = pricesForItem?.price!;
    const circleSpecialPrice = pricesForItem?.circleSpecialPrice!;
    const discountSpecialPrice = pricesForItem?.discountSpecialPrice!;

    const circleDiscount = pricesForItem?.circleDiscount;
    const specialDiscount = pricesForItem?.specialDiscount;
    const discount = pricesForItem?.discount;
    const totalDiscount = pricesForItem?.totalDiscount;

    //1. circle sub + promote circle -> circleSpecialPrice
    //2. circle sub + discount -> dicount Price
    //3. circle sub + none -> special price | price
    //4. non-circle + promote circle -> special price | price
    //5. non-circle + promte disocunt -> discount price
    //6. non-circle + none -> special price | price
    let priceToShow;
    if (isCircleSubscribed) {
      if (promoteCircle) {
        priceToShow = circleSpecialPrice;
      } else if (promoteDiscount) {
        priceToShow = discountSpecialPrice;
      } else {
        priceToShow = specialPrice || price;
      }
    } else {
      if (promoteDiscount) {
        priceToShow = discountSpecialPrice;
      } else {
        priceToShow = specialPrice || price;
      }
    }
    return {
      promoteCircle,
      promoteDiscount,
      price,
      circleSpecialPrice,
      circleDiscount,
      specialDiscount,
      discount,
      totalDiscount,
      priceToShow,
    };
  }

  const renderMainPriceView = (pricesForItem: any, packageMrpForItem: any) => {
    const {
      priceToShow,
      promoteCircle,
      promoteDiscount,
      price,
      circleSpecialPrice,
    } = calculatePriceToShow(pricesForItem, packageMrpForItem);

    const slashedPrice =
      !!packageMrpForItem && packageMrpForItem > price ? packageMrpForItem : price;
    //1. circle sub + promote -> packageMrp/price
    //2. non-circle + circle -> no slashing
    const hasSlashedPrice =
      (!isCircleSubscribed && promoteCircle && priceToShow == slashedPrice) ||
      priceToShow == slashedPrice
        ? null
        : slashedPrice;
    const hasCirclePrice = promoteCircle && !promoteDiscount && priceToShow != circleSpecialPrice;

    return (
      <View style={{ height: 40 }}>
        {/** show circle price for non-circle user */}
        {!isCircleSubscribed && hasCirclePrice ? (
          <View style={styles.centerRow}>
            <CircleLogo style={[styles.circleLogoIcon, { height: 18 }]} />
            <Text style={styles.circlePriceText}>
              Price {string.common.Rs}
              {circleSpecialPrice}
            </Text>
          </View>
        ) : null}
        {/** packageCalMrp/mrp*/}
        <View style={{ alignItems: 'flex-end' }}>
          {hasSlashedPrice ? (
            <View style={styles.slashedPriceView}>
              <Text style={styles.slashedPriceText}>
                MRP{' '}
                <Text style={{ textDecorationLine: 'line-through' }}>
                  {string.common.Rs}
                  {`${convertNumberToDecimal(slashedPrice)}`}
                </Text>
              </Text>
            </View>
          ) : null}
        </View>
        {/** effective price + total savings */}
        <View
          style={{
            flexDirection: 'row',
            marginVertical: hasSlashedPrice ? '1%' : '0%',
            justifyContent: 'flex-end',
          }}
        >
          {priceToShow ? (
            <Text style={styles.mainPriceText}>
              {`${string.common.Rs}${convertNumberToDecimal(priceToShow)}`}
            </Text>
          ) : (
            renderItemPriceShimmer()
          )}
        </View>
      </View>
    );
  };

  /**percentage dicount (main price discount + circle discount separately) */

  const renderPercentageDiscountView = (
    pricesForItem: any,
    packageMrpForItem: any,
    getItem: any
  ) => {
    const {
      promoteCircle,
      promoteDiscount,
      circleDiscount,
      specialDiscount,
      discount,
      totalDiscount,
    } = calculatePriceToShow(pricesForItem, packageMrpForItem);

    const imageUrl = getItem?.imageUrl;
    const hasImageUrl = !!imageUrl;
    return (
      <View style={{ marginHorizontal: hasImageUrl ? 32 : 0, justifyContent: 'center' }}>
        {renderPercentageDiscount(
          promoteCircle && isCircleSubscribed
            ? circleDiscount
            : promoteDiscount
            ? specialDiscount
            : discount,
          promoteCircle && isCircleSubscribed ? true : false,
          promoteDiscount && specialDiscount > 0 ? specialDiscount : 0,
          discount > 0 ? discount : 0,
          totalDiscount > 0 ? totalDiscount : 0
        )}
      </View>
    );
  };

  function onPressAddToCart(item: any, pricesForItem: any, packageCalculatedMrp: number) {
    const { countToShow } = inclusionParameterLogic(item);
    const specialPrice = pricesForItem?.specialPrice!;
    const price = pricesForItem?.price!;
    const circlePrice = pricesForItem?.circlePrice!;
    const circleSpecialPrice = pricesForItem?.circleSpecialPrice!;
    const discountPrice = pricesForItem?.discountPrice!;
    const discountSpecialPrice = pricesForItem?.discountSpecialPrice!;
    const planToConsider = pricesForItem?.planToConsider;
    const mrpToDisplay = pricesForItem?.mrpToDisplay;
    const widgetType = Array.isArray(data)
      ? sourceScreen === AppRoutes.CartPage
        ? string.diagnosticCategoryTitle.item
        : data?.[0]?.diagnosticWidgetType
      : data?.diagnosticWidgetType?.toLowerCase();
    const inclusions =
      !!item?.inclusionData && item.inclusionData.map((item: any) => Number(item?.incItemId));

    const originalItemIds =
      sourceScreen === AppRoutes.CartPage && Array.isArray(cartItems)
        ? cartItems?.map((item) => {
            return item?.id;
          })
        : null;
    DiagnosticAddToCartEvent(
      item?.itemTitle || item?.itemName,
      `${item?.itemId}`,
      mrpToDisplay, //mrp
      calculatePriceToShow(pricesForItem, packageCalculatedMrp)?.priceToShow, //actual selling price
      source,
      item?.inclusionData == null || (!!inclusions && inclusions?.length < 2)
        ? DIAGNOSTICS_ITEM_TYPE.TEST
        : DIAGNOSTICS_ITEM_TYPE.PACKAGE,
      recommedationDataSource
        ? recommedationDataSource
        : widgetType === string.diagnosticCategoryTitle.categoryGrid ||
          widgetType == string.diagnosticCategoryTitle.category
        ? 'Category page'
        : data?.diagnosticWidgetTitle || widgetHeading,
      currentPatient,
      isDiagnosticCircleSubscription,
      originalItemIds
    );

    const addedItems = createDiagnosticAddToCartObject(
      Number(item?.itemId),
      item?.itemTitle! || item?.itemName,
      item?.gender! || DIAGNOSTIC_ITEM_GENDER.B,
      price,
      specialPrice! | price,
      circlePrice,
      circleSpecialPrice,
      discountPrice,
      discountSpecialPrice,
      TEST_COLLECTION_TYPE.HC,
      planToConsider?.groupPlan,
      packageCalculatedMrp,
      item?.inclusionData == null ? [Number(item?.itemId)] : inclusions,
      AppConfig.Configuration.DEFAULT_ITEM_SELECTION_FLAG,
      item?.itemImageUrl,
      countToShow
    );

    if (sourceScreen === AppRoutes.CartPage) {
      onPressAddToCartFromCart?.(item, addedItems);
    } else {
      addCartItem?.(addedItems);
      isModifyFlow &&
        setModifiedPatientCart?.([
          {
            patientId: modifiedOrder?.patientId,
            cartItems: cartItems?.concat(addedItems),
          },
        ]);
    }
  }

  const onPressRemoveFromCart = (item: any) => {
    if (sourceScreen === AppRoutes.CartPage) {
      onPressRemoveItemFromCart?.(item);
    } else {
      removeCartItem?.(`${item?.itemId}`);
      removeMultiPatientCartItems?.(`${item?.itemId}`);
    }
  };

  function postHomePageWidgetClicked(
    name: string,
    id: string,
    section: string,
    sourceScreen?: string
  ) {
    DiagnosticHomePageWidgetClicked(
      currentPatient,
      sourceScreen == 'Recommendations' ? sourceScreen : section,
      name,
      id,
      '',
      isDiagnosticCircleSubscription
    );
  }

  function onPress(item: any, packageCalculatedMrp: number, pricesForItem: any) {
    const specialPrice = pricesForItem?.specialPrice!;
    const price = pricesForItem?.price!; //more than price (black)
    const circlePrice = pricesForItem?.circlePrice!;
    const circleSpecialPrice = pricesForItem?.circleSpecialPrice!;
    const discountPrice = pricesForItem?.discountPrice!;
    const discountSpecialPrice = pricesForItem?.discountSpecialPrice!;
    const mrpToDisplay = pricesForItem?.mrpToDisplay;
    const widgetTitle = data?.diagnosticWidgetTitle || widgetHeading;
    const widgetType = data?.diagnosticWidgetType;
    const inclusions =
      !!item?.inclusionData && item?.inclusionData?.map((item: any) => Number(item?.incItemId));
    //only for homepage widgets
    source == DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.HOME &&
      postHomePageWidgetClicked(
        item?.itemTitle! || item?.itemName,
        `${item?.itemId}`,
        widgetTitle,
        sourceScreen
      );

    if (sourceScreen == AppRoutes.TestDetails) {
      navigation.replace(AppRoutes.TestDetails, {
        itemId: item?.itemId,
        comingFrom: sourceScreen,
        widgetTitle: widgetTitle,
        testDetails: {
          Rate: price,
          specialPrice: specialPrice! || price,
          circleRate: circlePrice,
          circleSpecialPrice: circleSpecialPrice,
          discountPrice: discountPrice,
          discountSpecialPrice: discountSpecialPrice,
          ItemID: `${item?.itemId}`,
          ItemName: item?.itemTitle! || item?.itemName,
          collectionType: TEST_COLLECTION_TYPE.HC,
          packageMrp: packageCalculatedMrp,
          mrpToDisplay: mrpToDisplay,
          source:
            widgetType == string.diagnosticCategoryTitle.categoryGrid ||
            widgetType == string.diagnosticCategoryTitle.category
              ? 'Category page'
              : source,
          type: data?.diagnosticWidgetType,
          inclusions: item?.inclusionData == null ? [Number(item?.itemId)] : inclusions,
        } as TestPackageForDetails,
      });
    } else {
      navigation.navigate(AppRoutes.TestDetails, {
        itemId: item?.itemId,
        comingFrom: sourceScreen,
        widgetTitle: widgetTitle,
        changeCTA: changeCTA,
        testDetails: {
          Rate: price,
          specialPrice: specialPrice! || price,
          circleRate: circlePrice,
          circleSpecialPrice: circleSpecialPrice,
          discountPrice: discountPrice,
          discountSpecialPrice: discountSpecialPrice,
          ItemID: `${item?.itemId}`,
          ItemName: item?.itemTitle! || item?.itemName,
          collectionType: TEST_COLLECTION_TYPE.HC,
          packageMrp: packageCalculatedMrp,
          mrpToDisplay: mrpToDisplay,
          source:
            widgetType == string.diagnosticCategoryTitle.categoryGrid ||
            widgetType == string.diagnosticCategoryTitle.category
              ? 'Category page'
              : source,
          type: data?.diagnosticWidgetType,
          inclusions: item?.inclusionData == null ? [Number(item?.itemId)] : inclusions,
        } as TestPackageForDetails,
      });
    }
  }

  const renderAddToCart = (
    isAddedToCart: boolean,
    item: any,
    pricesForItem: any,
    packageCalculatedMrp: number
  ) => {
    const isAlreadyPartOfOrder =
      !!modifiedOrderItemIds &&
      modifiedOrderItemIds?.length &&
      modifiedOrderItemIds?.find((id: number) => Number(id) == Number(item?.itemId || item?.id));
    return (
      <View style={{ alignSelf: 'flex-end' }}>
        <Text
          style={styles.addToCartText}
          onPress={() => {
            _onPressFunction(
              isAlreadyPartOfOrder,
              isAddedToCart,
              item,
              pricesForItem,
              packageCalculatedMrp
            );
          }}
        >
          {isAlreadyPartOfOrder
            ? string.diagnostics.alreadyAdded
            : isAddedToCart
            ? string.diagnostics.removeFromCart
            : string.circleDoctors.addToCart}
        </Text>
      </View>
    );
  };

  function _onPressFunction(
    isAlreadyPartOfOrder: any,
    isAddedToCart: boolean,
    item: any,
    pricesForItem: any,
    packageCalculatedMrp: number
  ) {
    if (isAlreadyPartOfOrder) {
    } else if (isAddedToCart) {
      onPressRemoveFromCart(item);
    } else {
      onPressAddToCart(item, pricesForItem, packageCalculatedMrp);
    }
  }

  const keyExtractor = useCallback((item: any, index: number) => `${index}`, []);
  if (props.isPriceAvailable) {
    actualItemsToShow =
      source === 'Cart page'
        ? data?.length > 0 && data?.filter((item: any) => item?.diagnosticPricing)
        : diagnosticWidgetData?.length > 0 &&
          diagnosticWidgetData?.filter((item: any) => item?.diagnosticPricing);
  }

  return (
    <>
      <View
        style={
          props.isVertical
            ? {
                alignSelf: actualItemsToShow?.length > 1 ? 'center' : 'flex-start',
                marginLeft: '1.5%',
                flex: 1,
              }
            : {}
        }
      >
        {actualItemsToShow?.length > 0 ? (
          <FlatList
            numColumns={props.isVertical ? props.columns : undefined}
            bounces={false}
            keyExtractor={keyExtractor}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            horizontal={!props.isVertical}
            data={actualItemsToShow}
            onEndReached={props.onEndReached}
            onEndReachedThreshold={0.1}
            renderItem={renderItemCard}
            maxToRenderPerBatch={8}
            initialNumToRender={3}
          />
        ) : null}
      </View>
    </>
  );
};

export default React.memo(FullWidthItemCard);

const styles = StyleSheet.create({
  itemCardView: {
    ...theme.viewStyles.card(12, 0),
    elevation: 10,
    maxHeight: CARD_HEIGHT + 20,
    minHeight: CARD_HEIGHT,
    width: CARD_WIDTH,
    marginHorizontal: 4,
    marginRight: 10,
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 8,
  },
  imagePlaceholderStyle: { backgroundColor: colors.CARD_BG, opacity: 0.5, borderRadius: 5 },
  imageStyle: { height: 25, width: 25, resizeMode: 'contain' },
  itemNameText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 13 : 14, theme.colors.SHERPA_BLUE, 1, 18),
    textAlign: 'left',
  },
  parameterText: {
    ...theme.viewStyles.text('SB', 10, theme.colors.SHERPA_BLUE, 1, 13),
    textAlign: 'left',
    marginTop: '3%',
  },
  mainPriceText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 15 : 16, theme.colors.SHERPA_BLUE),
    lineHeight: 18,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  slashedPriceText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 12.5 : 13.5, colors.SHERPA_BLUE, 0.6, 21),
    textAlign: 'center',
  },
  circleLogoIcon: {
    height: 15,
    width: isSmallDevice ? 26 : 28,
    resizeMode: 'contain',
  },
  addToCartText: {
    textAlign: 'right',
    ...theme.viewStyles.text('B', isSmallDevice ? 13 : 14, colors.APP_YELLOW, 1, 20),
  },
  errorCardContainer: {
    height: 'auto',
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'white',
    elevation: 0,
  },
  percentageDiscountView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentageDiscountText: {
    ...theme.viewStyles.text('B', 10, colors.DISCOUNT_GREEN, 1, 13),
    textAlign: 'center',
  },
  priceView: {
    flexDirection: 'row',
    marginVertical: '2%',
    height: 45,
  },
  slashedPriceView: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  circlePriceText: {
    marginHorizontal: 4,
    ...theme.viewStyles.text('M', isSmallDevice ? 11 : 12, theme.colors.SHERPA_BLUE, 0.8, 16),
    textAlign: 'center',
  },
  centerRow: { flexDirection: 'row', alignItems: 'center' },
  imageView: { marginRight: 8 },
  parameterCountView: { minHeight: isSmallDevice ? 20 : 25 },
  topView: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  topLeftView: { flexDirection: 'row', width: '70%' },
  topRightView: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  bottomView: {
    flexDirection: 'row',
    width: '100%',
  },
});
