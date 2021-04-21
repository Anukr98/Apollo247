import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  useShoppingCart,
  ShoppingCartItem,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Up, Down, SearchSendIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { g, postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { useAllCurrentPatients } from '../../hooks/authHooks';
import { useUIElements } from '../UIElementsProvider';
import { WebEngageEvents, WebEngageEventName } from '../../helpers/webEngageEvents';
import {
  fetchConsultCoupons,
  validateConsultCoupon,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { couponViewShimmer } from '@aph/mobile-patients/src/components/ui/ShimmerFactory';

const styles = StyleSheet.create({
  bottonButtonContainer: {
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20, // statusBarHesight(),
    width: '66%',
    position: 'absolute',
    bottom: 0,
  },
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
  },
  separator: {
    height: 1,
    opacity: 0.1,
    backgroundColor: theme.colors.LIGHT_BLUE,
  },
  heading: {
    ...theme.viewStyles.text('SB', 13, theme.colors.SHERPA_BLUE),
    marginBottom: 4,
  },
  couponTitle: {
    ...theme.viewStyles.text('M', 16, theme.colors.SEARCH_UNDERLINE_COLOR),
    width: '82%',
  },
  couponSubTitle: {
    ...theme.viewStyles.text('M', 13, theme.colors.LIGHT_BLUE),
    marginBottom: 4,
  },
  couponDescription: {
    ...theme.viewStyles.text('R', 12, theme.colors.LIGHT_BLUE),
    opacity: 0.6,
  },
  applyBtnText: {
    ...theme.viewStyles.text('SB', 12, theme.colors.LIGHT_ORANGE),
  },
  itemSeperator: {
    width: '100%',
    height: 0.5,
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.2,
    marginTop: 8,
  },
  couponContainer: {
    paddingHorizontal: 16,
  },
  couponInputStyle: {
    ...theme.viewStyles.text('M', 16, theme.colors.SHERPA_BLUE),
  },
  inputValidationStyle: {
    ...theme.viewStyles.text('M', 12, theme.colors.INPUT_FAILURE_TEXT),
    lineHeight: 24,
    paddingTop: 2,
    letterSpacing: 0.04,
  },
  careMessageContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 10,
    flexDirection: 'row',
  },
  pendingIconStyle: {
    marginRight: 10,
    marginTop: 5,
  },
  careMessage: {
    ...theme.viewStyles.text('R', 13, '#01475B', 1, 20),
    width: '90%',
  },
  noCouponsAvailText: {
    ...theme.viewStyles.text('M', 13, theme.colors.FILTER_CARD_LABEL),
    margin: 20,
    textAlign: 'center',
    opacity: 0.3,
  },
  spaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
    marginTop: 16,
  },
  bottomViewCardBtn: {
    height: 45,
    ...theme.viewStyles.cardViewStyle,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  viewBtnText: {
    ...theme.viewStyles.text('M', 16, theme.colors.SHERPA_BLUE),
  },
});
export interface pharma_coupon {
  coupon: string;
  message: string;
  applicable?: string;
  textOffer?: string;
  frontendCategory?: string;
}

export interface ViewCouponsProps extends NavigationScreenProps {
  movedFrom: string;
}

export const ViewCoupons: React.FC<ViewCouponsProps> = (props) => {
  const isDiag = props.navigation.getParam('isDiag');
  const [couponText, setCouponText] = useState<string>('');
  const [couponError, setCouponError] = useState<string>('');
  const [couponListError, setCouponListError] = useState<string>('');
  const [disableCouponsList, setDisableCouponsList] = useState<string[]>([]);
  const [showAllProductOffers, setShowAllProductOffers] = useState<boolean>(false);
  const [showAllCircleCoupons, setShowAllCircleCoupons] = useState<boolean>(false);
  const [showCouponsForYou, setShowCouponsForYou] = useState<boolean>(false);
  const [circleCoupons, setCircleCoupons] = useState<pharma_coupon[]>([]); // circle coupons => applicable === 'APOLLO:Circle...'
  const [productOffers, setProductOffers] = useState<pharma_coupon[]>([]); // product offer coupons => frontendCategory === 'ProductOffer'
  const [couponList, setCouponList] = useState<pharma_coupon[]>([]); // normal coupons
  const { currentPatient } = useAllCurrentPatients();
  const {
    setCoupon,
    coupon: cartCoupon,
    cartItems,
    cartTotal,
    setCouponProducts,
    pinCode,
    addresses,
    deliveryAddressId,
    circleSubscriptionId,
    hdfcSubscriptionId,
    setIsFreeDelivery,
  } = useShoppingCart();
  const { showAphAlert, setLoading } = useUIElements();
  const [shimmerLoading, setShimmerLoading] = useState<boolean>(true);
  const isEnableApplyBtn = couponText.length >= 4;
  const {
    locationDetails,
    pharmacyLocation,
    hdfcPlanId,
    circlePlanId,
    hdfcStatus,
    circleStatus,
  } = useAppCommonData();
  const selectedAddress = addresses?.find((item) => item.id == deliveryAddressId);
  const pharmacyPincode =
    selectedAddress?.zipcode || pharmacyLocation?.pincode || locationDetails?.pincode || pinCode;

  let packageId: string[] = [];
  if (hdfcSubscriptionId && hdfcStatus === 'active') {
    packageId.push(`HDFC:${hdfcPlanId}`);
  }
  if (circleSubscriptionId && circleStatus === 'active') {
    packageId.push(`APOLLO:${circlePlanId}`);
  }

  useEffect(() => {
    const data = {
      packageId: packageId?.join(),
      mobile: g(currentPatient, 'mobileNumber'),
      email: g(currentPatient, 'emailAddress'),
      type: isDiag ? 'Diag' : 'Pharmacy',
    };
    fetchConsultCoupons(data)
      .then((res: any) => {
        const coupons = res?.data?.response || [];
        const circleCoupons = coupons.filter((coupon: pharma_coupon) =>
          coupon?.applicable?.includes('APOLLO:Circle')
        );
        setCircleCoupons(circleCoupons || []);
        const nonCircleCoupons =
          coupons.filter((coupon: pharma_coupon) => !circleCoupons.includes(coupon)) || [];
        const productOfferCoupons = nonCircleCoupons?.filter(
          (coupon: pharma_coupon) => coupon?.frontendCategory === 'ProductOffer'
        );
        setProductOffers(productOfferCoupons || []);
        const nonSpecialOfferCoupons =
          coupons.filter(
            (coupon: pharma_coupon) =>
              !circleCoupons.includes(coupon) && !productOfferCoupons.includes(coupon)
          ) || [];
        setCouponList(nonSpecialOfferCoupons || []);
        setShimmerLoading(false);
      })
      .catch((error) => {
        CommonBugFender('fetchingConsultCoupons', error);
        props.navigation.goBack();
        showAphAlert!({
          title: string.common.uhOh,
          description: "Sorry, we're unable to fetch coupon codes right now. Please try again.",
        });
      });
  }, []);

  const applyCoupon = (
    coupon: string,
    cartItems: ShoppingCartItem[],
    applyingFromList?: boolean,
    listIndex?: number
  ) => {
    CommonLogEvent(AppRoutes.ViewCoupons, 'Select coupon');
    setLoading?.(true);
    const data = {
      mobile: g(currentPatient, 'mobileNumber'),
      billAmount: cartTotal.toFixed(2),
      coupon: coupon,
      pinCode: pharmacyPincode,
      products: cartItems?.map((item) => ({
        sku: item?.id,
        categoryId: item?.productType,
        mrp: item?.price,
        quantity: item?.quantity,
        specialPrice: item?.specialPrice || item?.price,
      })),
      packageIds: packageId,
      email: g(currentPatient, 'emailAddress'),
    };
    validateConsultCoupon(data)
      .then((resp: any) => {
        if (resp?.data?.errorCode == 0) {
          if (resp?.data?.response?.valid) {
            const successMessage = resp?.data?.response?.successMessage || '';
            setCoupon!({ ...g(resp?.data, 'response')!, successMessage: successMessage });
            setIsFreeDelivery?.(!!resp?.data?.response?.freeDelivery);
            props.navigation.goBack();
          } else {
            !applyingFromList && setCouponError(g(resp.data, 'response', 'reason'));
            applyingFromList && setCouponListError(g(resp.data, 'response', 'reason'));
            setDisableCouponsList([...disableCouponsList, coupon]);
            saveDisableCoupons(coupon);
          }

          const products = g(resp?.data, 'response', 'products');
          if (products?.length) {
            const freeProducts = products?.filter((product) => {
              return product?.couponFree === 1;
            });
            setCouponProducts!(freeProducts);
          }

          const eventAttributes: WebEngageEvents[WebEngageEventName.CART_COUPON_APPLIED] = {
            'Coupon Code': coupon,
            'Discounted amount': g(resp?.data, 'response', 'valid')
              ? g(resp.data, 'response', 'discount')
              : 'Not Applicable',
            'Customer ID': g(currentPatient, 'id'),
            'Cart Items': cartItems?.length ? JSON.stringify(cartItems) : '',
          };
          postWebEngageEvent(WebEngageEventName.CART_COUPON_APPLIED, eventAttributes);
        } else {
          CommonBugFender('validatingPharmaCoupon', g(resp?.data, 'errorMsg'));
          !applyingFromList && setCouponError(g(resp?.data, 'errorMsg'));
          applyingFromList && setCouponListError(g(resp?.data, 'errorMsg'));
          saveDisableCoupons(coupon);
        }
      })
      .catch((error) => {
        CommonBugFender('validatingPharmaCoupon', error);
        !applyingFromList && setCouponError('Sorry, unable to validate coupon right now.');
        applyingFromList && setCouponListError('Sorry, unable to validate coupon right now.');
        saveDisableCoupons(coupon);
      })
      .finally(() => setLoading?.(false));
  };

  const saveDisableCoupons = (couponName: string) => {
    if (couponName) {
      if (disableCouponsList?.indexOf(couponName) > -1) {
        const arr = disableCouponsList;
        const indexToRemove = arr?.indexOf(couponName);
        arr?.splice(indexToRemove, 1);
        setDisableCouponsList(arr);
      } else {
        setDisableCouponsList(disableCouponsList?.concat(couponName));
      }
    }
  };

  const renderInputWithValidation = () => {
    const rightIconView = () => {
      return (
        !couponError && (
          <View style={{ opacity: isEnableApplyBtn ? 1 : 0.5 }}>
            <TouchableOpacity
              activeOpacity={1}
              disabled={!isEnableApplyBtn}
              onPress={() => applyCoupon(couponText, cartItems)}
            >
              <SearchSendIcon />
            </TouchableOpacity>
          </View>
        )
      );
    };

    return (
      <View style={[styles.cardStyle, { padding: 16 }]}>
        <TextInputComponent
          value={couponText}
          onChangeText={(text) => {
            if (/^\S*$/.test(text)) {
              couponError && setCouponError('');
              setCouponText(text);
            }
          }}
          textInputprops={{
            ...(couponError ? { selectionColor: '#e50000' } : {}),
            maxLength: 20,
          }}
          inputStyle={[
            styles.couponInputStyle,
            couponError ? { borderBottomColor: '#e50000' } : {},
          ]}
          conatinerstyles={{ paddingBottom: 0 }}
          placeholder={'Enter coupon code'}
          icon={rightIconView()}
        />
        {renderCouponError(couponError)}
      </View>
    );
  };

  const renderCouponError = (error: string) => {
    return !!error ? (
      <Text style={styles.inputValidationStyle}>{couponError || 'Invalid Coupon Code'}</Text>
    ) : null;
  };

  const renderNoCouponsFound = () => {
    return (
      <View style={styles.cardStyle}>
        <View>
          {!shimmerLoading && couponList.length == 0 && (
            <Text style={styles.noCouponsAvailText}>No coupons available</Text>
          )}
        </View>
      </View>
    );
  };

  const renderGeneralCoupons = (
    coupons: pharma_coupon[],
    category: string,
    showAllCoupons: boolean,
    showMoreLessButton: boolean
  ) => {
    const couponsForYou = coupons;
    return couponsForYou?.map((coupon, i) => {
      const disableList = disableCouponsList?.indexOf(coupon?.coupon) > -1;
      return (
        <TouchableOpacity
          key={i}
          disabled={disableList}
          onPress={() => {
            couponApply(coupon?.coupon, i);
          }}
        >
          <View
            style={[
              styles.couponContainer,
              i === couponsForYou?.length - 1 && !showMoreLessButton ? { paddingBottom: 15 } : {},
            ]}
          >
            <View style={styles.spaceRow}>
              <Text style={styles.couponTitle}>{coupon?.coupon}</Text>
              <Text style={[styles.applyBtnText, { opacity: disableList ? 0.5 : 1 }]}>APPLY</Text>
            </View>
            {!!coupon?.textOffer && <Text style={styles.couponSubTitle}>{coupon?.textOffer}</Text>}
            <Text style={styles.couponDescription}>{coupon?.message}</Text>
            {disableList && renderCouponError(couponListError)}
            {i !== coupons?.length - 1 && <View style={styles.itemSeperator} />}
          </View>
          {showMoreLessButton && i === couponsForYou?.length - 1 ? (
            <TouchableOpacity
              style={styles.bottomViewCardBtn}
              onPress={() => {
                if (category === 'general') {
                  setShowCouponsForYou(!showCouponsForYou);
                } else if (category === 'productOffers') {
                  setShowAllProductOffers(!showAllProductOffers);
                } else if (category === 'circle') {
                  setShowAllCircleCoupons(!showAllCircleCoupons);
                }
              }}
            >
              <Text style={styles.viewBtnText}>View{showAllCoupons ? ' less' : ' more'}</Text>
              {showAllCoupons ? <Up /> : <Down />}
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
      );
    });
  };

  const couponApply = (couponText: string, index: number) => {
    CommonLogEvent(AppRoutes.ViewCoupons, 'Apply Coupon');
    applyCoupon(couponText, cartItems, true, index);
  };

  const renderCouponList = () => (
    <View>
      {renderCardTitle('COUPONS FOR YOU')}
      <View style={styles.cardStyle}>
        {renderGeneralCoupons(
          showCouponsForYou ? couponList : couponList?.slice(0, 2),
          'general',
          showCouponsForYou,
          couponList?.length > 2
        )}
      </View>
    </View>
  );

  const renderProductOffers = () => (
    <View>
      {renderCardTitle('PRODUCT OFFERS')}
      <View style={styles.cardStyle}>
        {renderGeneralCoupons(
          showAllProductOffers ? productOffers : productOffers?.slice(0, 2),
          'productOffers',
          showAllProductOffers,
          productOffers?.length > 2
        )}
      </View>
    </View>
  );

  const renderCircleCoupons = () => (
    <View>
      {renderCardTitle('APPLICABLE WITH CIRCLE BENEFITS')}
      <View style={styles.cardStyle}>
        {renderGeneralCoupons(
          showAllCircleCoupons ? circleCoupons : circleCoupons?.slice(0, 2),
          'circle',
          showAllCircleCoupons,
          circleCoupons?.length > 2
        )}
      </View>
    </View>
  );

  const renderCardTitle = (title: string) => {
    return (
      <View style={{ marginVertical: 16 }}>
        <Text style={styles.heading}>{title}</Text>
        <View style={styles.separator} />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          leftIcon="backArrow"
          title={'APPLY COUPON'}
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <ScrollView bounces={false} contentContainerStyle={{ padding: 15 }}>
          {renderInputWithValidation()}
          {shimmerLoading && couponViewShimmer()}
          {renderNoCouponsFound()}
          {!!couponList?.length && renderCouponList()}
          {!!productOffers?.length && renderProductOffers()}
          {!!circleCoupons?.length && renderCircleCoupons()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
