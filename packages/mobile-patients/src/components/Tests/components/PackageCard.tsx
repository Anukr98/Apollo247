import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { CircleLogo, OfferIcon } from '@aph/mobile-patients/src/components/ui/Icons';
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
import { isSmallDevice, nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  convertNumberToDecimal,
  getPricesForItem,
} from '@aph/mobile-patients/src/utils/commonUtils';
import { CircleHeading } from '@aph/mobile-patients/src/components/ui/CircleHeading';
import { SpecialDiscountText } from '@aph/mobile-patients/src/components/Tests/components/SpecialDiscountText';
import { TEST_COLLECTION_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { TestPackageForDetails } from '@aph/mobile-patients/src/components/Tests/TestDetails';
import {
  DiagnosticHomePageWidgetClicked,
  DiagnosticAddToCartEvent,
} from '@aph/mobile-patients/src/components/Tests/Events';
import { NavigationRoute, NavigationScreenProp } from 'react-navigation';
import { colors } from '@aph/mobile-patients/src/theme/colors';

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
  source:
    | 'Home page'
    | 'Full search'
    | 'Details page'
    | 'Partial search'
    | 'Listing page'
    | 'Category page'
    | 'Prescription';
  sourceScreen: string;
}

export const PackageCard: React.FC<PackageCardProps> = (props) => {
  const { cartItems, addCartItem, removeCartItem, modifiedOrderItemIds } = useDiagnosticsCart();
  const { data, isCircleSubscribed, source, navigation, sourceScreen } = props;
  const actualItemsToShow =
    data?.diagnosticWidgetData?.length > 0 &&
    data?.diagnosticWidgetData?.filter((item: any) => item?.diagnosticPricing);

  const renderItemCard = (item: any) => {
    const getItem = item?.item;
    const getDiagnosticPricingForItem = getItem?.diagnosticPricing;

    if (getDiagnosticPricingForItem == undefined || getDiagnosticPricingForItem == null) {
      return null;
    }
    const packageMrpForItem = getItem?.packageCalculatedMrp!;
    const pricesForItem = getPricesForItem(getDiagnosticPricingForItem, packageMrpForItem);

    if (!pricesForItem?.itemActive) {
      return null;
    }

    const imageUrl = getItem?.itemImageUrl;
    const name = getItem?.itemTitle;
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

    const getParamterData =
      !!getMandatoryParamter && getMandatoryParamter?.length > 0 && getMandatoryParamter?.flat(1);
    const dataToShow = getMandatoryParameterCount > 0 ? getParamterData : inclusions;

    const promoteCircle = pricesForItem?.promoteCircle;
    const promoteDiscount = pricesForItem?.promoteDiscount;
    const circleDiscount = pricesForItem?.circleDiscount;
    const specialDiscount = pricesForItem?.specialDiscount;
    const discount = pricesForItem?.discount;

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onPress(getItem, packageMrpForItem, pricesForItem)}
        key={getItem.itemId}
        style={[
          styles.packageCardTouch,
          { width: Dimensions.get('window').width * (props.isVertical ? 0.9 : 0.8) },
          props?.isVertical ? {} : { marginLeft: item?.index == 0 ? 20 : 6 },
        ]}
      >
        <View>
          <View style={{ minHeight: !!inclusions && inclusions?.length > 0 ? 100 : 0 }}>
            <View style={styles.topPackageView}>
              <View style={{ width: '75%' }}>
                <Text style={styles.itemNameText} numberOfLines={2}>
                  {name}
                </Text>
              </View>
              {renderPercentageDiscount(
                promoteCircle && isCircleSubscribed
                  ? circleDiscount
                  : promoteDiscount
                  ? specialDiscount
                  : discount
              )}
            </View>
            {!!inclusions && inclusions?.length > 0 ? (
              <View style={{ minHeight: isSmallDevice ? 90 : 95 }}>
                <Text style={styles.inclusionsText}>
                  {getMandatoryParameterCount > 0
                    ? `TOTAL PARAMETERS : ${getMandatoryParameterCount}`
                    : `TOTAL INCLUSIONS : ${inclusions?.length}`}{' '}
                </Text>

                {dataToShow?.map((item: any, index: number) =>
                  index < 3 ? (
                    <Text style={styles.inclusionName}>
                      {nameFormater(
                        getMandatoryParameterCount > 0 ? item?.observationName : item?.incTitle,
                        'title'
                      )}{' '}
                      {index == 2 && dataToShow?.length - 3 > 0 && (
                        <Text style={styles.moreText}>
                          {'   '}+{dataToShow?.length - 3} more
                        </Text>
                      )}
                    </Text>
                  ) : null
                )}
              </View>
            ) : null}
          </View>
          <Spearator style={styles.horizontalSeparator} />
          {renderPricesView(pricesForItem, packageMrpForItem, getItem)}
        </View>
      </TouchableOpacity>
    );
  };

  const renderPercentageDiscount = (discount: string | number) => {
    return (
      <>
        {!!discount && discount > 0 ? (
          <View style={styles.percentageDiscountView}>
            <Text style={styles.percentageDiscountText}>{Number(discount).toFixed(0)}% off</Text>
          </View>
        ) : null}
      </>
    );
  };

  const renderPricesView = (pricesForItem: any, packageMrpForItem: any, getItem: any) => {
    const promoteCircle = pricesForItem?.promoteCircle;
    const promoteDiscount = pricesForItem?.promoteDiscount;

    return (
      <View>
        {promoteCircle || promoteDiscount ? (
          renderAnyDiscountView(pricesForItem, packageMrpForItem)
        ) : (
          <View style={{ height: 20 }} />
        )}
        {renderMainPriceView(pricesForItem, packageMrpForItem, getItem)}
      </View>
    );
  };

  const renderAnyDiscountView = (pricesForItem: any, packageMrpForItem: any) => {
    const circleSpecialPrice = pricesForItem?.circleSpecialPrice!;
    const promoteDiscount = pricesForItem?.promoteDiscount;
    const promoteCircle = pricesForItem?.promoteCircle;
    const circleDiscountSaving = pricesForItem?.circleDiscountDiffPrice;
    const specialDiscountSaving = pricesForItem?.specialDiscountDiffPrice;

    return (
      <View>
        {isCircleSubscribed && circleDiscountSaving > 0 && !promoteDiscount ? (
          <View style={styles.flexRow}>
            <CircleLogo style={styles.circleLogoIcon} />
            {renderSavingView(
              'Savings',
              circleDiscountSaving,
              { marginHorizontal: '1%' },
              styles.savingTextStyle
            )}
          </View>
        ) : promoteDiscount && specialDiscountSaving > 0 && !promoteCircle ? (
          <View style={styles.flexRow}>
            <SpecialDiscountText isImage={true} text={'TEST 247'} />
            {renderSavingView(
              'Savings',
              specialDiscountSaving,
              { marginHorizontal: '1%' },
              styles.savingTextStyle
            )}
          </View>
        ) : circleDiscountSaving > 0 ? (
          <View style={styles.flexRow}>
            <CircleHeading isSubscribed={false} />
            {renderSavingView(
              '',
              circleSpecialPrice,
              { marginHorizontal: isSmallDevice ? '1%' : '2%', alignSelf: 'center' },
              [styles.nonCirclePriceText]
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
          {text} {string.common.Rs} {convertNumberToDecimal(price)}
        </Text>
      </View>
    );
  };

  const renderMainPriceView = (pricesForItem: any, packageMrpForItem: any, getItem: any) => {
    const promoteCircle = pricesForItem?.promoteCircle;
    const promoteDiscount = pricesForItem?.promoteDiscount;
    const specialPrice = pricesForItem?.specialPrice!;
    const price = pricesForItem?.price!;
    const circleSpecialPrice = pricesForItem?.circleSpecialPrice!;
    const discountSpecialPrice = pricesForItem?.discountSpecialPrice!;

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
    const slashedPrice =
      !!packageMrpForItem && packageMrpForItem > price ? packageMrpForItem : price;
    const isAddedToCart = !!cartItems?.find(
      (items) => Number(items?.id) == Number(getItem?.itemId)
    );
    //1. circle sub + promote -> packageMrp/price
    //2. non-circle + circle -> no slashing
    return (
      <View style={{ flexDirection: 'row', marginVertical: '2%' }}>
        <Text style={styles.mainPriceText}>
          {string.common.Rs} {convertNumberToDecimal(priceToShow)}
        </Text>
        {/**slashed price */}
        {(!isCircleSubscribed && promoteCircle && priceToShow == slashedPrice) ||
        priceToShow == slashedPrice ? null : (
          <Text style={styles.slashedPriceText}>
            ({string.common.Rs} {convertNumberToDecimal(slashedPrice)})
          </Text>
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
    const discountToDisplay = pricesForItem?.discountToDisplay;
    const mrpToDisplay = pricesForItem?.mrpToDisplay;
    const widgetType = data?.diagnosticWidgetType;

    DiagnosticAddToCartEvent(
      item?.itemTitle,
      `${item?.itemId}`,
      mrpToDisplay,
      discountToDisplay,
      source,
      widgetType === string.diagnosticCategoryTitle.categoryGrid ||
        widgetType == string.diagnosticCategoryTitle.category
        ? 'Category page'
        : data?.diagnosticWidgetTitle
    );

    addCartItem!({
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
      inclusions: [Number(item?.itemId)], // since it's a test
    });
  }

  function onPressRemoveFromCart(item: any) {
    removeCartItem!(`${item?.itemId}`);
  }

  function postHomePageWidgetClicked(name: string, id: string, section: string) {
    DiagnosticHomePageWidgetClicked(section, id, name);
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

    postHomePageWidgetClicked(item?.itemTitle!, `${item?.itemId}`, widgetTitle);
    if (sourceScreen === AppRoutes.TestDetails) {
      navigation.replace(AppRoutes.TestDetails, {
        itemId: item?.itemId,
        comingFrom: sourceScreen,
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
          inclusions: [Number(item?.itemId)],
        } as unknown) as TestPackageForDetails,
      });
    } else {
      navigation.navigate(AppRoutes.TestDetails, {
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
          ItemName: item?.itemTitle!,
          collectionType: TEST_COLLECTION_TYPE.HC,
          packageMrp: packageCalculatedMrp,
          mrpToDisplay: mrpToDisplay,
          source: source,
          type: data?.diagnosticWidgetType,
          inclusions: [Number(item?.itemId)],
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
      modifiedOrderItemIds?.find((id: number) => Number(id) == Number(item?.id));
    return (
      <Text
        style={[
          styles.addToCartText,
          {
            ...theme.viewStyles.text('B', isSmallDevice ? 13 : 14, '#fc9916', 1, 24),
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

  const keyExtractor = useCallback((item: any, index: number) => `${index}`, []);

  return (
    <>
      <View style={props.isVertical ? { alignSelf: 'center', marginLeft: '1.5%' } : {}}>
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
            maxToRenderPerBatch={3}
          />
        ) : (
          renderError()
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  packageCardTouch: {
    width: Dimensions.get('window').width * 0.8, //0.86
    ...theme.viewStyles.card(16, 4, 10, '#fff', 10),
    paddingVertical: 12,
    marginRight: 10,
    elevation: 10,
    marginTop: 16,
    marginBottom: 20,
  },
  topPackageView: {
    minHeight: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imagePlaceholderStyle: { backgroundColor: '#f7f8f5', opacity: 0.5, borderRadius: 5 },
  imageStyle: { height: 40, width: 40, marginBottom: 8 },
  itemNameText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 16.5 : 18, theme.colors.SHERPA_BLUE, 1, 24),
    textAlign: 'left',
    textTransform: 'capitalize',
  },
  inclusionsText: {
    ...theme.viewStyles.text('M', 12.5, theme.colors.SHERPA_BLUE, 1, 13),
    textAlign: 'left',
    marginTop: '5%',
    letterSpacing: 0.25,
    marginBottom: '4%',
  },
  horizontalSeparator: { marginBottom: 7.5, marginTop: '6%' },
  flexRow: {
    flexDirection: 'row',
  },
  testNameText: {
    ...theme.viewStyles.text('M', 16, theme.colors.SHERPA_BLUE, 1, 24, 0),
    width: '95%',
  },
  imageIcon: { height: 40, width: 40 },
  savingTextStyle: {
    ...theme.viewStyles.text('M', isSmallDevice ? 10.5 : 11, theme.colors.APP_GREEN),
    lineHeight: 18,
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
    opacity: 0.5,
    textDecorationLine: 'line-through',
    marginHorizontal: '5%',
  },
  circleLogoIcon: {
    height: 20,
    width: isSmallDevice ? 32 : 36,
    resizeMode: 'contain',
  },
  inclusionName: {
    ...theme.viewStyles.text('R', isSmallDevice ? 10.5 : 11, theme.colors.SHERPA_BLUE, 1, 13),
    letterSpacing: 0.25,
    marginBottom: '2%',
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
  percentageDiscountView: {
    backgroundColor: colors.DISCOUNT_LIGHT_BLUE,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: colors.DISCOUNT_BLUE_COLOR,
    height: 30,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageDiscountText: {
    ...theme.viewStyles.text('M', 10, colors.DISCOUNT_BLUE_COLOR, 1, 12),
    textAlign: 'center',
  },
});
