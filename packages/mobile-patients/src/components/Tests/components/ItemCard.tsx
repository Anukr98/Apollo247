import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { WidgetLiverIcon, CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { renderItemPriceShimmer } from '@aph/mobile-patients/src/components/ui/ShimmerFactory';
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
import { Image } from 'react-native-elements';
import { isEmptyObject, isSmallDevice } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  convertNumberToDecimal,
  DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE,
  getPricesForItem,
} from '@aph/mobile-patients/src/utils/commonUtils';
import { TEST_COLLECTION_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { NavigationRoute, NavigationScreenProp } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { TestPackageForDetails } from '@aph/mobile-patients/src/components/Tests/TestDetails';
import {
  DiagnosticHomePageWidgetClicked,
  DiagnosticAddToCartEvent,
} from '@aph/mobile-patients/src/components/Tests/Events';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
const screenWidth = Dimensions.get('window').width;
const CARD_WIDTH = screenWidth > 350 ? screenWidth * 0.44 : screenWidth * 0.5;
const CARD_HEIGHT = 230; //210
export interface ItemCardProps {
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
}

const ItemCard: React.FC<ItemCardProps> = (props) => {
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
  } = props;
  const { currentPatient } = useAllCurrentPatients();
  const { isDiagnosticCircleSubscription } = useDiagnosticsCart();

  const isModifyFlow = !!modifiedOrder && !isEmptyObject(modifiedOrder);
  let actualItemsToShow =
    source === 'Cart page'
      ? data?.length > 0 && data
      : diagnosticWidgetData?.length > 0 && diagnosticWidgetData;

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

      const imageUrl = !!getItem?.itemImageUrl
        ? getItem?.itemImageUrl
        : AppConfig.Configuration.DIAGNOSTIC_DEFAULT_ICON;
      const name = getItem?.itemTitle || getItem?.itemName;
      const inclusions = getItem?.inclusionData;

      const getMandatoryParamter =
        !!inclusions &&
        inclusions?.length > 0 &&
        inclusions?.map((inclusion: any) =>
          inclusion?.incObservationData?.filter((item: any) => item?.mandatoryValue === '1')
        );

      const getMandatoryParameterCount =
        !!getMandatoryParamter &&
        getMandatoryParamter?.reduce((prevVal: any, curr: any) => prevVal + curr?.length, 0);

      const isAddedToCart = !!cartItems?.find(
        (items) => Number(items?.id) == Number(getItem?.itemId)
      );

      return (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => onPress(getItem, packageMrpForItem, pricesForItem)}
          key={item?.item?.itemId}
        >
          <View
            style={[
              styles.itemCardView,
              { minHeight: isCircleSubscribed ? CARD_HEIGHT - 10 : CARD_HEIGHT },
              props?.isVertical ? {} : { marginLeft: item?.index == 0 ? 20 : 6 },
            ]}
          >
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: screenWidth < 340 ? '60%' : '69%' }}>
                {imageUrl == '' ? (
                  <WidgetLiverIcon style={styles.imageStyle} resizeMode={'contain'} />
                ) : (
                  <Image
                    resizeMode={'contain'}
                    placeholderStyle={styles.imagePlaceholderStyle}
                    source={{ uri: imageUrl }}
                    style={styles.imageStyle}
                  />
                )}
              </View>
            </View>
            <View style={{ minHeight: 40 }}>
              <Text style={styles.itemNameText} numberOfLines={2}>
                {name}
              </Text>
            </View>
            <View style={{ minHeight: isSmallDevice ? 20 : 25 }}>
              {getMandatoryParameterCount > 0 ? (
                <Text style={styles.parameterText}>
                  {getMandatoryParameterCount} {getMandatoryParameterCount == 1 ? 'test' : 'tests'}{' '}
                  included
                </Text>
              ) : null}
            </View>
            <Spearator
              style={[styles.horizontalSeparator, { marginTop: isCircleSubscribed ? '6%' : '4%' }]}
            />

            {renderPricesView(pricesForItem, packageMrpForItem)}
            {renderAddToCart(isAddedToCart, getItem, pricesForItem, packageMrpForItem)}
          </View>
        </TouchableOpacity>
      );
    },
    [cartItems, patientCartItems]
  );

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

  const renderAnyDiscountView = (pricesForItem: any, packageMrpForItem: any) => {
    const promoteDiscount = pricesForItem?.promoteDiscount;
    const promoteCircle = pricesForItem?.promoteCircle;
    const circleDiscountSaving = pricesForItem?.circleDiscountDiffPrice;
    const specialDiscountSaving = pricesForItem?.specialDiscountDiffPrice;
    const nonCircleDiscountSaving = pricesForItem?.discountDiffPrice;

    return (
      <View>
        {isCircleSubscribed && circleDiscountSaving > 0 && !promoteDiscount ? (
          <View style={styles.flexRow}>
            {renderSavingView(
              'savings',
              circleDiscountSaving,
              { marginHorizontal: '5%' },
              styles.savingTextStyle
            )}
          </View>
        ) : promoteDiscount && specialDiscountSaving > 0 && !promoteCircle ? (
          <View style={styles.flexRow}>
            {renderSavingView(
              'savings',
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
              { marginHorizontal: '7%' },
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
      <View style={mainViewStyle}>
        <Text style={textStyle}>
          {text} {string.common.Rs}
          {convertNumberToDecimal(price)}
        </Text>
      </View>
    );
  };

  const renderFallBackHeight = () => {
    return !isCircleSubscribed ? <View style={{ height: 18 }} /> : null;
  };

  //38 for circle
  const renderSlashedPriceFallBackHeight = () => {
    return <View style={{ height: 23 }} />;
  };

  const renderMainPriceView = (pricesForItem: any, packageMrpForItem: any) => {
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
        ) : (
          renderFallBackHeight()
        )}
        {/** packageCalMrp/mrp*/}
        <View style={{ flexDirection: 'row' }}>
          {hasSlashedPrice ? (
            <View style={styles.slashedPriceView}>
              <Text style={styles.slashedPriceText}>
                MRP {string.common.Rs}
                <Text style={{ textDecorationLine: 'line-through' }}>
                  {`${convertNumberToDecimal(slashedPrice)}`}
                </Text>
              </Text>
            </View>
          ) : (
            renderSlashedPriceFallBackHeight()
          )}
          {/**percentage dicount (main price discount + circle discount separately) */}
          <View style={{ marginHorizontal: 5, justifyContent: 'center' }}>
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
        </View>
        {/** effective price + total savings */}
        <View
          style={{
            flexDirection: 'row',
            marginVertical: hasSlashedPrice ? '1%' : '0%',
          }}
        >
          {priceToShow ? (
            <Text style={styles.mainPriceText}>
              {`${string.common.Rs}${convertNumberToDecimal(priceToShow)}`}
            </Text>
          ) : (
            renderItemPriceShimmer()
          )}
          {promoteCircle || promoteDiscount
            ? renderAnyDiscountView(pricesForItem, packageMrpForItem)
            : null}
        </View>
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
    const discountToDisplay = pricesForItem?.discountToDisplay;
    const mrpToDisplay = pricesForItem?.mrpToDisplay;
    const widgetType = Array.isArray(data)
      ? sourceScreen === AppRoutes.CartPage
        ? string.diagnosticCategoryTitle.item
        : data?.[0]?.diagnosticWidgetType
      : data?.diagnosticWidgetType?.toLowerCase();
    const inclusions =
      !!item?.inclusionData && item.inclusionData.map((item: any) => Number(item?.incItemId));

    const originalItemIds = sourceScreen === AppRoutes.CartPage && Array.isArray(data)
      ? data?.map((item) => {
          return item?.itemId;
        }) : null;
    DiagnosticAddToCartEvent(
      item?.itemTitle || item?.itemName,
      `${item?.itemId}`,
      mrpToDisplay,
      discountToDisplay,
      source,
      recommedationDataSource
        ? recommedationDataSource
        : widgetType === string.diagnosticCategoryTitle.categoryGrid ||
          widgetType == string.diagnosticCategoryTitle.category
        ? 'Category page'
        : data?.diagnosticWidgetTitle,
      currentPatient,
      isDiagnosticCircleSubscription,
      originalItemIds
    );

    const addedItems = {
      id: `${item?.itemId}`,
      mou: 1,
      name: item?.itemTitle! || item?.itemName,
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

  function postHomePageWidgetClicked(name: string, id: string, section: string) {
    DiagnosticHomePageWidgetClicked(
      currentPatient,
      section,
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
    const widgetTitle = data?.diagnosticWidgetTitle;
    const widgetType = data?.diagnosticWidgetType;
    const inclusions =
      !!item?.inclusionData && item?.inclusionData?.map((item: any) => Number(item?.incItemId));

    postHomePageWidgetClicked(item?.itemTitle! || item?.itemName, `${item?.itemId}`, widgetTitle);
    if (sourceScreen == AppRoutes.TestDetails) {
      navigation.replace(AppRoutes.TestDetails, {
        itemId: item?.itemId,
        comingFrom: sourceScreen,
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
      <Text
        style={[
          styles.addToCartText,
          {
            ...theme.viewStyles.text('B', isSmallDevice ? 13 : 14, '#fc9916', 1, 24),
            width: isAlreadyPartOfOrder ? '80%' : '70%',
          },
        ]}
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
        {isAlreadyPartOfOrder ? 'ALREADY ADDED' : isAddedToCart ? 'REMOVE' : 'ADD TO CART'}
      </Text>
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
      length: props.isVertical ? CARD_WIDTH : CARD_HEIGHT,
      offset: props.isVertical ? CARD_WIDTH * index : CARD_HEIGHT * index,
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
            getItemLayout={getItemLayout}
          />
        ) : (
          renderError()
        )}
      </View>
    </>
  );
};

export default React.memo(ItemCard);

const styles = StyleSheet.create({
  itemCardView: {
    ...theme.viewStyles.card(12, 0),
    elevation: 10,
    maxHeight: CARD_HEIGHT,
    minHeight: CARD_HEIGHT,
    width: CARD_WIDTH,
    marginHorizontal: 4,
    marginRight: 10,
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 16,
  },
  imagePlaceholderStyle: { backgroundColor: '#f7f8f5', opacity: 0.5, borderRadius: 5 },
  imageStyle: { height: 27, width: 27, marginBottom: 8 },
  itemNameText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 15 : 16, theme.colors.SHERPA_BLUE, 1, 20),
    textAlign: 'left',
  },
  parameterText: {
    ...theme.viewStyles.text('R', 11, theme.colors.SHERPA_BLUE, 1, 16),
    textAlign: 'left',
    marginTop: '5%',
  },
  horizontalSeparator: { marginBottom: 7.5, marginTop: '4%' },
  flexRow: {
    flexDirection: 'row',
  },
  testNameText: {
    ...theme.viewStyles.text('M', 16, theme.colors.SHERPA_BLUE, 1, 24, 0),
    width: '95%',
  },
  imageIcon: { height: 40, width: 40 },
  savingTextStyle: {
    ...theme.viewStyles.text('M', isSmallDevice ? 10.5 : 11, theme.colors.SHERPA_BLUE, 0.6, 18),
    textAlign: 'center',
    alignSelf: 'center',
  },
  nonCirclePriceText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 12.5 : 13, theme.colors.SHERPA_BLUE),
    lineHeight: 16,
    textAlign: 'center',
    alignSelf: 'center',
  },
  mainPriceText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 15 : 16, theme.colors.SHERPA_BLUE),
    lineHeight: 21,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  slashedPriceText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 13 : 14, theme.colors.SHERPA_BLUE),
    lineHeight: 21,
    textAlign: 'center',
    opacity: 0.6,
  },
  circleLogoIcon: {
    height: 15,
    width: isSmallDevice ? 26 : 28,
    resizeMode: 'contain',
  },
  addToCartText: {
    textAlign: 'left',
    position: 'absolute',
    left: 16,
    bottom: 6,
    width: '70%',
    height: 30,
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
});
