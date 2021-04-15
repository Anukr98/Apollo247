import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
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
import { Image } from 'react-native-elements';
import { isSmallDevice } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  convertNumberToDecimal,
  getPricesForItem,
} from '@aph/mobile-patients/src/utils/commonUtils';
import { CircleHeading } from '@aph/mobile-patients/src/components/ui/CircleHeading';
import { SpecialDiscountText } from '@aph/mobile-patients/src/components/Tests/components/SpecialDiscountText';
import { TEST_COLLECTION_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { NavigationRoute, NavigationScreenProp } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { TestPackageForDetails } from '@aph/mobile-patients/src/components/Tests/TestDetails';
import {
  DiagnosticHomePageWidgetClicked,
  DiagnosticAddToCartEvent,
} from '@aph/mobile-patients/src/components/Tests/Events';
import { colors } from '@aph/mobile-patients/src/theme/colors';

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
  source: string;
  sourceScreen: string;
  onPressAddToCartFromCart?: (item: any) => void;
  onPressRemoveItemFromCart?: (item: any) => void;
}

export const ItemCard: React.FC<ItemCardProps> = (props) => {
  const { cartItems, addCartItem, removeCartItem } = useDiagnosticsCart();
  const {
    data,
    isCircleSubscribed,
    navigation,
    source,
    sourceScreen,
    onPressAddToCartFromCart,
    onPressRemoveItemFromCart,
  } = props;

  const actualItemsToShow =
    source === 'Cart Page'
      ? data?.length > 0 && data?.filter((item: any) => item?.diagnosticPricing)
      : data?.diagnosticWidgetData?.length > 0 &&
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

    const imageUrl =
      getItem?.itemImageUrl || 'https://apolloaphstorage.blob.core.windows.net/organs/ic_liver.png';
    const name = getItem?.itemTitle;
    const inclusions = getItem?.inclusionData;

    const promoteCircle = pricesForItem?.promoteCircle;
    const promoteDiscount = pricesForItem?.promoteDiscount;
    const circleDiscount = pricesForItem?.circleDiscount;
    const specialDiscount = pricesForItem?.specialDiscount;
    const discount = pricesForItem?.discount;

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
            props?.isVertical ? {} : { marginLeft: item?.index == 0 ? 20 : 6 },
          ]}
        >
          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: '69%' }}>
              <Image
                placeholderStyle={styles.imagePlaceholderStyle}
                source={{ uri: imageUrl }}
                style={styles.imageStyle}
              />
            </View>
            {renderPercentageDiscount(
              promoteCircle && isCircleSubscribed
                ? circleDiscount
                : promoteDiscount
                ? specialDiscount
                : discount
            )}
          </View>
          <View style={{ minHeight: isSmallDevice ? 40 : 35 }}>
            <Text style={styles.itemNameText} numberOfLines={2}>
              {name}
            </Text>
          </View>
          <View style={{ minHeight: isSmallDevice ? 25 : 30 }}>
            {getMandatoryParameterCount > 0 ? (
              <Text style={styles.parameterText}>
                {getMandatoryParameterCount} {getMandatoryParameterCount == 1 ? 'test' : 'tests'}{' '}
                included
              </Text>
            ) : null}
          </View>
          <Spearator style={styles.horizontalSeparator} />

          {renderPricesView(pricesForItem, packageMrpForItem)}
          {renderAddToCart(isAddedToCart, getItem, pricesForItem, packageMrpForItem)}
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

  const renderPricesView = (pricesForItem: any, packageMrpForItem: any) => {
    const promoteCircle = pricesForItem?.promoteCircle; //if circle discount is more
    const promoteDiscount = pricesForItem?.promoteDiscount; // if special discount is more than others.

    return (
      <View>
        {promoteCircle || promoteDiscount ? (
          renderAnyDiscountView(pricesForItem, packageMrpForItem)
        ) : (
          <View style={{ height: 20 }}></View>
        )}
        {renderMainPriceView(pricesForItem, packageMrpForItem)}
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
              { marginHorizontal: '3%' },
              styles.savingTextStyle
            )}
          </View>
        ) : promoteDiscount && specialDiscountSaving > 0 && !promoteCircle ? (
          <View style={styles.flexRow}>
            <SpecialDiscountText isImage={true} text={'TEST 247'} />
            {renderSavingView(
              'Savings',
              specialDiscountSaving,
              { marginHorizontal: '3%' },
              styles.savingTextStyle
            )}
          </View>
        ) : circleDiscountSaving > 0 ? (
          <View style={styles.flexRow}>
            <CircleHeading isSubscribed={false} />
            {renderSavingView(
              '',
              circleSpecialPrice,
              { marginHorizontal: isSmallDevice ? '1.5%' : '2.5%', alignSelf: 'center' },
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

  const renderMainPriceView = (pricesForItem: any, packageMrpForItem: any) => {
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
    return (
      <View style={{ flexDirection: 'row', marginVertical: '5%' }}>
        <Text style={styles.mainPriceText}>
          {string.common.Rs} {convertNumberToDecimal(priceToShow)}
        </Text>
        {(!isCircleSubscribed && promoteCircle && priceToShow == slashedPrice) ||
        priceToShow == slashedPrice ? null : (
          <Text style={styles.slashedPriceText}>
            {string.common.Rs} {convertNumberToDecimal(slashedPrice)}
          </Text>
        )}
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

    DiagnosticAddToCartEvent(
      item?.itemTitle,
      `${item?.itemId}`,
      mrpToDisplay,
      discountToDisplay,
      data?.diagnosticWidgetTitle
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
    onPressAddToCartFromCart?.(item);
  }

  function onPressRemoveFromCart(item: any) {
    removeCartItem!(`${item?.itemId}`);
    onPressRemoveItemFromCart?.(item);
  }

  function postHomePageWidgetClicked(name: string, id: string, section: string) {
    DiagnosticHomePageWidgetClicked(name, id, section);
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

    if (sourceScreen == AppRoutes.TestDetails) {
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
    return (
      <Text
        style={[
          styles.addToCartText,
          {
            ...theme.viewStyles.text('B', isSmallDevice ? 13 : 14, '#fc9916', 1, 24),
          },
        ]}
        onPress={() =>
          isAddedToCart
            ? onPressRemoveFromCart(item)
            : onPressAddToCart(item, pricesForItem, packageCalculatedMrp)
        }
      >
        {isAddedToCart ? 'REMOVE' : 'ADD TO CART'}
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
      <View
        style={
          props.isVertical
            ? {
                alignSelf: actualItemsToShow?.length > 1 ? 'center' : 'flex-start',
                marginLeft: '1.5%',
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
  itemCardView: {
    ...theme.viewStyles.card(12, 0),
    elevation: 10,
    height: 230, //210
    width: Dimensions.get('window').width * 0.45,
    marginHorizontal: 4,
    marginRight: 10,
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 20,
  },
  imagePlaceholderStyle: { backgroundColor: '#f7f8f5', opacity: 0.5, borderRadius: 5 },
  imageStyle: { height: 40, width: 40, marginBottom: 8 },
  itemNameText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 15 : 16, theme.colors.SHERPA_BLUE, 1, 20),
    textAlign: 'left',
    textTransform: 'capitalize',
  },
  parameterText: {
    ...theme.viewStyles.text('R', 11, theme.colors.SHERPA_BLUE, 1, 16),
    textAlign: 'left',
    marginTop: '5%',
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
  addToCartText: {
    textAlign: 'left',
    position: 'absolute',
    left: 16,
    bottom: 10,
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
