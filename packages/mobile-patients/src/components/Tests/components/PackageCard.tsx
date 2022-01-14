import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
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
import {
  isEmptyObject,
  isSmallDevice,
  nameFormater,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  convertNumberToDecimal,
  DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE,
  getPricesForItem,
} from '@aph/mobile-patients/src/utils/commonUtils';
import { TEST_COLLECTION_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { TestPackageForDetails } from '@aph/mobile-patients/src/components/Tests/TestDetails';
import {
  DiagnosticHomePageWidgetClicked,
  DiagnosticAddToCartEvent,
} from '@aph/mobile-patients/src/components/Tests/Events';
import { NavigationRoute, NavigationScreenProp } from 'react-navigation';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { renderPackageItemPriceShimmer } from '@aph/mobile-patients/src/components/ui/ShimmerFactory';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import DiscountPercentage from '@aph/mobile-patients/src/components/Tests/components/DiscountPercentage';
import { CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
import { DIAGNOSTICS_ITEM_TYPE } from '@aph/mobile-patients/src/helpers/CleverTapEvents';
const screenWidth = Dimensions.get('window').width;
const CARD_WIDTH = screenWidth * 0.8; //0.86

export interface PackageCardProps {
  onPress?: () => void;
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
  onEndReached?: any;
  diagnosticWidgetData?: any;
  isPriceAvailable?: boolean;
  widgetHeading?: string;
}

export const PackageCard: React.FC<PackageCardProps> = (props) => {
  const {
    cartItems,
    addCartItem,
    removeCartItem,
    modifiedOrderItemIds,
    setModifiedPatientCart,
    modifiedOrder,
    patientCartItems,
    removeMultiPatientCartItems,
  } = useDiagnosticsCart();
  const {
    data,
    isCircleSubscribed,
    source,
    navigation,
    sourceScreen,
    diagnosticWidgetData,
    widgetHeading,
  } = props;

  const isModifyFlow = !!modifiedOrder && !isEmptyObject(modifiedOrder);
  let actualItemsToShow = diagnosticWidgetData?.length > 0 && diagnosticWidgetData;
  const { currentPatient } = useAllCurrentPatients();
  const { isDiagnosticCircleSubscription } = useDiagnosticsCart();

  function getCount(array: any) {
    return array?.reduce((prevVal: any, curr: any) => prevVal + curr?.length, 0);
  }

  function getMandatoryParamterResults(arr: any) {
    return arr?.filter((item: any) => item?.mandatoryValue === '1');
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

      const imageUrl = getItem?.itemImageUrl;
      const name = getItem?.itemTitle;
      const isFromRecommendendation =
        sourceScreen == AppRoutes.TestListing &&
        props.widgetHeading?.toLowerCase() ==
          string.diagnostics.homepagePastOrderRecommendations?.toLowerCase();
      const inclusions = isFromRecommendendation ? getItem?.inclusions : getItem?.inclusionData;
      const numberOfParametersToShow = isDiagnosticCircleSubscription ? 3 : 2;
      var getMandatoryParamter = [] as any;

      if (sourceScreen == AppRoutes.TestDetails || isFromRecommendendation) {
        getMandatoryParamter =
          !!inclusions &&
          inclusions?.length > 0 &&
          inclusions?.map((inclusion: any) => getMandatoryParamterResults(inclusion?.observations));
      } else {
        getMandatoryParamter =
          !!inclusions &&
          inclusions?.length > 0 &&
          inclusions?.map((inclusion: any) =>
            getMandatoryParamterResults(inclusion?.incObservationData)
          );
      }

      const getMandatoryParameterCount = !!getMandatoryParamter && getCount(getMandatoryParamter);

      const getParamterData =
        !!getMandatoryParamter && getMandatoryParamter?.length > 0 && getMandatoryParamter?.flat(1);

      const dataToShow = getMandatoryParameterCount > 0 ? getParamterData : inclusions;
      const nonInclusionTests =
        !!inclusions && inclusions?.length > 0
          ? inclusions?.filter((inclusion: any) => inclusion?.incObservationData?.length == 0)
          : [];
      return (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => onPress(getItem, packageMrpForItem, pricesForItem)}
          key={getItem?.itemId.toString()}
          style={[
            styles.packageCardTouch,
            { width: Dimensions.get('window').width * (props.isVertical ? 0.9 : 0.8) },
            props?.isVertical ? {} : { marginLeft: item?.index == 0 ? 20 : 6 },
          ]}
        >
          <View key={getItem?.itemId.toString()}>
            <View style={{ minHeight: !!inclusions && inclusions?.length > 0 ? 100 : 0 }}>
              <View style={styles.topPackageView}>
                <View style={{ width: '82%' }}>
                  <Text style={styles.itemNameText} numberOfLines={2}>
                    {name}
                  </Text>
                </View>
              </View>
              {!!inclusions && inclusions?.length > 0 ? (
                <View
                  style={{
                    minHeight: isSmallDevice
                      ? isCircleSubscribed
                        ? 90
                        : 85
                      : isCircleSubscribed
                      ? 95
                      : 90,
                  }}
                >
                  <Text style={styles.inclusionsText}>
                    {getMandatoryParameterCount > 0
                      ? `Total Tests : ${getMandatoryParameterCount + nonInclusionTests?.length}`
                      : `Total Tests : ${inclusions?.length}`}{' '}
                  </Text>

                  {dataToShow?.map((item: any, index: number) =>
                    index < numberOfParametersToShow ? (
                      <Text style={styles.inclusionName}>
                        {nameFormater(
                          getMandatoryParameterCount > 0 ? item?.observationName : item?.incTitle,
                          'title'
                        )}{' '}
                        {index == numberOfParametersToShow - 1 &&
                          dataToShow?.length - numberOfParametersToShow > 0 && (
                            <Text style={styles.moreText}>
                              {'   '}+{dataToShow?.length - numberOfParametersToShow} more
                            </Text>
                          )}
                      </Text>
                    ) : null
                  )}
                </View>
              ) : null}
            </View>
            <Spearator
              style={[
                styles.horizontalSeparator,
                {
                  marginTop: isCircleSubscribed ? -6 : -12,
                },
              ]}
            />
            {renderPricesView(pricesForItem, packageMrpForItem, getItem)}
          </View>
        </TouchableOpacity>
      );
    },
    [cartItems, patientCartItems]
  );

  const renderPercentageDiscount = (
    discount: string | number,
    isOnlyCircle: boolean,
    specialDiscount: number,
    hasOtherDiscount: number
  ) => {
    const discountPrice =
      specialDiscount > 0 ? specialDiscount : hasOtherDiscount > 0 ? hasOtherDiscount : 0;
    return (
      <View
        style={[
          styles.discountPercentageView,
          isCircleSubscribed && isOnlyCircle && { marginHorizontal: -6 },
        ]}
      >
        <DiscountPercentage
          discount={discount}
          isOnlyCircle={isOnlyCircle}
          discountPrice={discountPrice}
        />
      </View>
    );
  };

  const renderFallBackHeight = () => {
    return <>{!isCircleSubscribed ? <View style={{ height: 18 }} /> : null}</>;
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

    //1. circle sub + promote circle -> circleSpecialPrice
    //2. circle sub + discount -> dicount Price
    //3. circle sub + none -> special price | price
    //4. non-circle + promote circle -> special price | price
    //5. non-circle + promte disocunt -> discount price
    //6. non-circle + none -> special price | price

    let priceToShow;
    if (isCircleSubscribed) {
      if (promoteDiscount) {
        priceToShow = discountSpecialPrice;
      } else if (promoteCircle) {
        priceToShow = circleSpecialPrice;
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
      priceToShow,
    };
  }

  const renderPricesView = (pricesForItem: any, packageMrpForItem: any, getItem: any) => {
    const {
      priceToShow,
      promoteCircle,
      promoteDiscount,
      price,
      circleSpecialPrice,
      circleDiscount,
      specialDiscount,
      discount,
    } = calculatePriceToShow(pricesForItem, packageMrpForItem);

    const slashedPrice =
      !!packageMrpForItem && packageMrpForItem > price ? packageMrpForItem : price;
    const hasCirclePrice = promoteCircle && !promoteDiscount && priceToShow != circleSpecialPrice;
    return pricesForItem || packageMrpForItem ? (
      <View>
        {/** show circle price for non-circle user */}
        {!isCircleSubscribed && hasCirclePrice ? (
          <View style={styles.centerRow}>
            <CircleLogo style={[styles.circleLogoIcon, { height: 18 }]} />
            <Text style={styles.circlePriceText}>
              Price {string.common.Rs}
              {circleSpecialPrice}
            </Text>
          </View>
        ) : (
          renderFallBackHeight()
        )}
        <View style={{ flexDirection: 'row' }}>
          {/**slashed price */}
          {(!isCircleSubscribed && promoteCircle && priceToShow == slashedPrice) ||
          priceToShow == slashedPrice ? (
            <View style={{ height: 20 }} />
          ) : (
            <View style={{ alignItems: 'flex-start' }}>
              <Text style={styles.slashedPriceText}>
                MRP{' '}
                <Text style={{ textDecorationLine: 'line-through' }}>
                  {string.common.Rs}
                  {`${convertNumberToDecimal(slashedPrice)}`}
                </Text>
              </Text>
            </View>
          )}
          {/**show percentage discount */}
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
        {renderMainPriceView(pricesForItem, packageMrpForItem, getItem, priceToShow)}
      </View>
    ) : (
      renderPackageItemPriceShimmer()
    );
  };

  const renderAnyDiscountView = (pricesForItem: any, packageMrpForItem: any) => {
    const circleSpecialPrice = pricesForItem?.circleSpecialPrice!;
    const promoteDiscount = pricesForItem?.promoteDiscount;
    const promoteCircle = pricesForItem?.promoteCircle;
    const circleDiscountSaving = pricesForItem?.circleDiscountDiffPrice;
    const specialDiscountSaving = pricesForItem?.specialDiscountDiffPrice;
    const nonCircleDiscountSaving = pricesForItem?.discountDiffPrice;

    return (
      <View style={{ justifyContent: 'center', height: 20 }}>
        {isCircleSubscribed && circleDiscountSaving > 0 && !promoteDiscount ? (
          <View style={[styles.flexRow, !isCircleSubscribed && { marginTop: -10 }]}>
            {renderSavingView(
              'save',
              circleDiscountSaving,
              { marginHorizontal: '5%' },
              styles.savingTextStyle
            )}
          </View>
        ) : promoteDiscount && specialDiscountSaving > 0 && !promoteCircle ? (
          <View style={styles.flexRow}>
            {renderSavingView(
              'save',
              specialDiscountSaving,
              { marginHorizontal: '5%' },
              styles.savingTextStyle
            )}
          </View>
        ) : nonCircleDiscountSaving > 0 ? (
          <View style={styles.flexRow}>
            {renderSavingView(
              'save',
              nonCircleDiscountSaving,
              { marginHorizontal: '5%' },
              styles.savingTextStyle
            )}
          </View>
        ) : null}
      </View>
    );
  };

  const renderSavingView = (
    text: string,
    price: number | string,
    mainViewStyle: any,
    textStyle: any
  ) => {
    return (
      <View style={[mainViewStyle]}>
        <Text style={textStyle}>
          {text} {string.common.Rs}
          {convertNumberToDecimal(price)}
        </Text>
      </View>
    );
  };

  const renderMainPriceView = (
    pricesForItem: any,
    packageMrpForItem: any,
    getItem: any,
    priceToShow: number
  ) => {
    const promoteCircle = pricesForItem?.promoteCircle;
    const promoteDiscount = pricesForItem?.promoteDiscount;

    const hasItem =
      !!cartItems && cartItems?.find((items) => Number(items?.id) == Number(getItem?.itemId));
    const isAddedToCart = !!hasItem ? true : false;

    //1. circle sub + promote -> packageMrp/price
    //2. non-circle + circle -> no slashing
    return (
      <View style={{ flexDirection: 'row', marginVertical: '2%' }}>
        {priceToShow ? (
          <Text style={styles.mainPriceText}>
            {string.common.Rs}
            {convertNumberToDecimal(priceToShow)}
          </Text>
        ) : (
          renderPackageItemPriceShimmer()
        )}
        {/**savings view */}
        {promoteCircle || promoteDiscount ? (
          renderAnyDiscountView(pricesForItem, packageMrpForItem)
        ) : (
          <View style={{ height: 20 }} />
        )}
        {renderAddToCart(isAddedToCart, getItem, pricesForItem, packageMrpForItem)}
      </View>
    );
  };

  function onPressAddToCart(item: any, pricesForItem: any, packageCalculatedMrp: number) {
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
    data?.diagnosticWidgetType?.toLowerCase();

    const inclusions =
      !!item?.inclusionData && item.inclusionData.map((item: any) => Number(item?.incItemId));

    DiagnosticAddToCartEvent(
      item?.itemTitle || item?.itemName,
      `${item?.itemId}`,
      mrpToDisplay, //mrp
      calculatePriceToShow(pricesForItem, packageCalculatedMrp)?.priceToShow, //actual selling price
      source,
      item?.inclusionData == null || (!!inclusions && inclusions?.length < 2)
        ? DIAGNOSTICS_ITEM_TYPE.TEST
        : DIAGNOSTICS_ITEM_TYPE.PACKAGE,
      widgetType === string.diagnosticCategoryTitle.categoryGrid ||
        widgetType == string.diagnosticCategoryTitle.category
        ? 'Category page'
        : data?.diagnosticWidgetTitle || widgetHeading,
      currentPatient,
      isDiagnosticCircleSubscription
    );

    const addedItems = {
      id: `${item?.itemId}`,
      mou: 1,
      name: item?.itemTitle!,
      price: price,
      specialPrice: specialPrice! | price,
      circlePrice: circlePrice,
      circleSpecialPrice: circleSpecialPrice,
      discountPrice: discountPrice,
      discountSpecialPrice: discountSpecialPrice,
      thumbnail: item?.itemImageUrl,
      collectionMethod: TEST_COLLECTION_TYPE.HC,
      groupPlan: planToConsider?.groupPlan,
      packageMrp: packageCalculatedMrp,
      inclusions: item?.inclusionData == null ? [Number(item?.itemId)] : inclusions,
      isSelected: AppConfig.Configuration.DEFAULT_ITEM_SELECTION_FLAG,
    };

    addCartItem?.(addedItems);
    isModifyFlow &&
      setModifiedPatientCart?.([
        {
          patientId: modifiedOrder?.patientId,
          cartItems: cartItems?.concat(addedItems),
        },
      ]);
  }

  function onPressRemoveFromCart(item: any) {
    removeCartItem?.(`${item?.itemId}`);
    removeMultiPatientCartItems?.(`${item?.itemId}`);
  }

  function postHomePageWidgetClicked(name: string, id: string, section: string) {
    DiagnosticHomePageWidgetClicked(
      currentPatient,
      section,
      id,
      name,
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
    const inclusions =
      !!item?.inclusionData && item?.inclusionData?.map((item: any) => Number(item?.incItemId));

    postHomePageWidgetClicked(item?.itemTitle!, `${item?.itemId}`, widgetTitle);
    if (sourceScreen === AppRoutes.TestDetails) {
      navigation.replace(AppRoutes.TestDetails, {
        itemId: item?.itemId,
        comingFrom: sourceScreen,
        widgetTitle: widgetTitle,
        testDetails: ({
          Rate: price,
          specialPrice: specialPrice! || price,
          circleRate: circlePrice,
          circleSpecialPrice: circleSpecialPrice,
          discountPrice: discountPrice,
          discountSpecialPrice: discountSpecialPrice,
          ItemID: `${item?.itemId}`,
          ItemName: item?.itemTitle!,
          collectionType: TEST_COLLECTION_TYPE.HC,
          packageMrp: packageCalculatedMrp,
          mrpToDisplay: mrpToDisplay,
          source: source,
          type: data?.diagnosticWidgetType,
          inclusions: item?.inclusionData == null ? [Number(item?.itemId)] : inclusions,
        } as unknown) as TestPackageForDetails,
      });
    } else {
      navigation.navigate(AppRoutes.TestDetails, {
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
          ItemName: item?.itemTitle!,
          collectionType: TEST_COLLECTION_TYPE.HC,
          packageMrp: packageCalculatedMrp,
          mrpToDisplay: mrpToDisplay,
          source: source,
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
      <Text
        style={[
          styles.addToCartText,
          {
            ...theme.viewStyles.text('B', isSmallDevice ? 13 : 14, colors.APP_YELLOW, 1, 20),
          },
        ]}
        onPress={() =>
          isAlreadyPartOfOrder
            ? {}
            : isAddedToCart
            ? onPressRemoveFromCart(item)
            : onPressAddToCart(item, pricesForItem, packageCalculatedMrp)
        }
      >
        {isAlreadyPartOfOrder ? 'ALREADY ADDED' : isAddedToCart ? 'REMOVE' : 'ADD TO CART'}
      </Text>
    );
  };

  const renderError = () => {
    if (props.isVertical)
      return (
        <Card
          cardContainer={styles.errorCardContainer}
          heading={string.common.uhOh}
          description={string.common.somethingWentWrong}
          descriptionTextStyle={{ fontSize: 14 }}
          headingTextStyle={{ fontSize: 14 }}
        />
      );
    else {
      return null;
    }
  };

  const getItemLayout = useCallback(
    (data, index) => ({
      length: CARD_WIDTH,
      offset: CARD_WIDTH * index,
      index,
    }),
    []
  );

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
      <View style={props.isVertical ? { flex: 1, alignSelf: 'center', marginLeft: '1.5%' } : {}}>
        {actualItemsToShow?.length > 0 ? (
          <FlatList
            numColumns={props.isVertical ? props.columns : undefined}
            bounces={false}
            keyExtractor={keyExtractor}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            horizontal={!props.isVertical}
            data={actualItemsToShow}
            renderItem={renderItemCard}
            onEndReached={props.onEndReached}
            onEndReachedThreshold={0.1}
            initialNumToRender={2}
            maxToRenderPerBatch={5}
            getItemLayout={getItemLayout}
          />
        ) : (
          renderError()
        )}
      </View>
    </>
  );
};

export default React.memo(PackageCard);

const styles = StyleSheet.create({
  packageCardTouch: {
    width: CARD_WIDTH,
    ...theme.viewStyles.card(16, 4, 10, '#fff', 10),
    paddingVertical: 12,
    marginRight: 10,
    elevation: 10,
    marginTop: 16,
    marginBottom: 16,
  },
  topPackageView: {
    minHeight: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imagePlaceholderStyle: { backgroundColor: '#f7f8f5', opacity: 0.5, borderRadius: 5 },
  imageStyle: { height: 40, width: 40, marginBottom: 8 },
  itemNameText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 15 : 16, theme.colors.SHERPA_BLUE, 1, 24),
    textAlign: 'left',
  },
  inclusionsText: {
    ...theme.viewStyles.text('SB', 12, theme.colors.SHERPA_BLUE, 1, 13),
    textAlign: 'left',
    marginTop: '4%',
    letterSpacing: 0.25,
    marginBottom: '2%',
  },
  horizontalSeparator: { marginBottom: 7.5 },
  flexRow: {
    flexDirection: 'row',
  },
  testNameText: {
    ...theme.viewStyles.text('M', 16, theme.colors.SHERPA_BLUE, 1, 24, 0),
    width: '95%',
  },
  imageIcon: { height: 40, width: 40 },
  savingTextStyle: {
    ...theme.viewStyles.text('M', isSmallDevice ? 10.5 : 11, colors.SHERPA_BLUE, 1, 18),
    alignSelf: 'flex-end',
  },
  nonCirclePriceText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 12.5 : 13, colors.SHERPA_BLUE),
    lineHeight: 16,
    textAlign: 'center',
    alignSelf: 'center',
  },
  mainPriceText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 15 : 16, colors.SHERPA_BLUE),
    lineHeight: 18,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  slashedPriceText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 12.5 : 13.5, colors.SHERPA_BLUE, 0.6, 21),
    textAlign: 'center',
  },
  inclusionName: {
    ...theme.viewStyles.text('R', isSmallDevice ? 10.5 : 11, theme.colors.SHERPA_BLUE, 1, 13),
    letterSpacing: 0.25,
    marginBottom: '1.5%',
  },
  moreText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 11 : 12, theme.colors.APP_YELLOW, 1, 13),
    letterSpacing: 0.25,
    marginBottom: '1.5%',
  },
  addToCartText: {
    textAlign: 'right',
    right: 0,
    position: 'absolute',
  },
  offerIconStyle: {
    height: 45,
    width: 45,
  },
  errorCardContainer: {
    height: 'auto',
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'white',
    elevation: 0,
  },
  circleLogoIcon: {
    height: 15,
    width: isSmallDevice ? 26 : 28,
    resizeMode: 'contain',
  },
  circlePriceText: {
    marginHorizontal: 4,
    ...theme.viewStyles.text('M', isSmallDevice ? 11 : 12, theme.colors.SHERPA_BLUE, 0.8, 16),
    textAlign: 'center',
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountPercentageView: { justifyContent: 'center' },
});
