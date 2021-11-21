import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  useShoppingCart,
  ShoppingCartItem,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Up, Down, SearchSendIcon, CircleLogo } from '@aph/mobile-patients/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  g,
  postWebEngageEvent,
  getPackageIds,
  postCleverTapEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
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
import { renderCouponViewShimmer } from '@aph/mobile-patients/src/components/ui/ShimmerFactory';
import { ListItem } from 'react-native-elements';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';

const styles = StyleSheet.create({
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    marginVertical: 8,
  },
  textInputContainer: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    padding: 16,
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
    height: 40,
    ...theme.viewStyles.cardViewStyle,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  viewBtnText: {
    ...theme.viewStyles.text('M', 15, theme.colors.SHERPA_BLUE),
  },
  titleContainer: {
    padding: 0,
    paddingLeft: 12,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  chipView1: {
    backgroundColor: 'rgba(252, 183, 22, 0.1)',
    padding: 4,
  },
  chipView2: {
    backgroundColor: 'rgba(216, 216, 216, 0.4)',
    padding: 4,
  },
  circleBenefitsView: {
    flexDirection: 'row',
  },
  circleBenefits: {
    ...theme.viewStyles.text('L', 11, '#373737', 1, 20),
  },
  circleLogo: {
    resizeMode: 'contain',
    width: 40,
    height: 20,
  },
});
export interface pharma_coupon {
  coupon: string;
  message: string;
  applicable?: string;
  textOffer?: string;
  frontEndCategory?: string;
  circleBenefits?: boolean;
}

export interface ViewCouponsProps extends NavigationScreenProps {
  movedFrom: 'consult' | 'pharma' | 'diagnostic' | 'subscription';
  onApplyCoupon: (value: string) => Promise<void>;
  coupon: string;
}

export const ViewCoupons: React.FC<ViewCouponsProps> = (props) => {
  const onApplyCoupon = props.navigation.getParam('onApplyCoupon');
  const movedFrom = props.navigation.getParam('movedFrom');
  const isFromConsult = movedFrom === 'consult';
  const isFromSubscription = movedFrom === 'subscription';
  const couponFromConsult = props.navigation.getParam('coupon');
  const [couponText, setCouponText] = useState<string>(couponFromConsult || '');
  const [couponError, setCouponError] = useState<string>('');
  const [couponListError, setCouponListError] = useState<string>('');
  const [disableCouponsList, setDisableCouponsList] = useState<string[]>([]);
  const [showAllProductOffers, setShowAllProductOffers] = useState<boolean>(false);
  const [showAllCouponList, setShowAllCouponList] = useState<boolean>(false);
  const [showAllCircleCoupons, setShowAllCircleCoupons] = useState<boolean>(false);
  const [circleCoupons, setCircleCoupons] = useState<pharma_coupon[]>([]); // circle coupons => applicable === 'APOLLO:Circle...'
  const [productOffers, setProductOffers] = useState<pharma_coupon[]>([]); // product offer coupons => frontendCategory === 'productOffers'
  const [couponList, setCouponList] = useState<pharma_coupon[]>([]); // normal coupons
  const [appliedCouponName, setAppliedCouponName] = useState<string>('');
  const { currentPatient } = useAllCurrentPatients();
  const [couponTextApplied, setCouponTextApplied] = useState<boolean>(false);
  const {
    circleSubscriptionId,
    hdfcSubscriptionId,
    circlePlanSelected,
    cartCoupon,
    serverCartItems,
    serverCartAmount,
    isCircleCart,
    cartCircleSubscriptionId,
  } = useShoppingCart();
  const { showAphAlert, setLoading } = useUIElements();
  const [shimmerLoading, setShimmerLoading] = useState<boolean>(true);
  const isEnableApplyBtn = couponText.length >= 4;
  const {
    hdfcPlanId,
    circlePlanId,
    hdfcStatus,
    circleStatus,
    activeUserSubscriptions,
  } = useAppCommonData();
  const { setUserActionPayload } = useServerCart();

  let packageId: string[] = [];
  if (hdfcSubscriptionId && hdfcStatus === 'active') {
    packageId.push(`HDFC:${hdfcPlanId}`);
  }
  if (circleSubscriptionId && circleStatus === 'active') {
    packageId.push(`APOLLO:${circlePlanId}`);
  }

  useEffect(() => {
    const data = {
      packageId: getPackageIds(activeUserSubscriptions)?.join(),
      mobile: g(currentPatient, 'mobileNumber'),
      email: g(currentPatient, 'emailAddress'),
      type: isFromConsult ? 'Consult' : isFromSubscription ? 'Subs' : 'Pharmacy',
    };

    fetchConsultCoupons(data)
      .then((res: any) => {
        const coupons: pharma_coupon[] = res?.data?.response || [];
        const circleCoupons = coupons.filter(isCircleCoupon);
        setCircleCoupons(circleCoupons || []);
        const productOfferCoupons = !isFromConsult ? coupons?.filter(isProductOfferCoupon) : [];
        setProductOffers(productOfferCoupons || []);
        const nonSpecialOfferCoupons =
          coupons.filter((coupon) => !isProductOfferCoupon(coupon) && !isCircleCoupon(coupon)) ||
          [];
        setCouponList(nonSpecialOfferCoupons || []);
        setShimmerLoading(false);
      })
      .catch((error) => {
        CommonBugFender('fetchingConsultCoupons', error);
        goBackToPreviousScreen();
        showAphAlert!({
          title: string.common.uhOh,
          description: "Sorry, we're unable to fetch coupon codes right now. Please try again.",
        });
      });
  }, []);

  useEffect(() => {
    // server cart coupon flow
    if (!isFromConsult) {
      if (cartCoupon?.valid) {
        fireCouponAppliedEvents(cartCoupon?.coupon || '', cartCoupon?.valid);
        props.navigation.goBack();
      } else if (cartCoupon?.valid == false && cartCoupon?.reason) {
        fireCouponAppliedEvents(cartCoupon?.coupon || '', cartCoupon?.valid);
        const error = cartCoupon?.reason || 'Coupon not applicable';
        const couponName = cartCoupon?.coupon || '';
        if (couponTextApplied) {
          setCouponError(error);
        } else {
          setCouponListError(error);
        }
        setDisableCouponsList([...disableCouponsList, couponName]);
        saveDisableCoupons(couponName);
      }
    }
  }, [cartCoupon]);

  const fireCouponAppliedEvents = (couponName: string, isValid: boolean) => {
    try {
      const couponSavings = serverCartAmount?.couponSavings || 0;
      const eventAttributes: WebEngageEvents[WebEngageEventName.CART_COUPON_APPLIED] = {
        'Coupon Code': couponName,
        'Discounted amount': isValid ? couponSavings : 'Not Applicable',
        'Customer ID': currentPatient?.id,
        'Cart Items': serverCartItems?.length ? JSON.stringify(serverCartItems) : '',
      };
      const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.CART_COUPON_APPLIED] = {
        'Coupon code': couponName || undefined,
        'Discounted amount': isValid ? couponSavings : 'Not Applicable',
        'Customer ID': currentPatient?.id,
        'Cart items': serverCartItems?.length ? JSON.stringify(serverCartItems) : undefined,
      };
      const cleverTapAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_COUPON_ACTION] = {
        'Coupon code': couponName || undefined,
        Action: 'Applied',
      };
      postCleverTapEvent(CleverTapEventName.PHARMACY_COUPON_ACTION, cleverTapAttributes);
      postCleverTapEvent(CleverTapEventName.CART_COUPON_APPLIED, cleverTapEventAttributes);
      postWebEngageEvent(WebEngageEventName.CART_COUPON_APPLIED, eventAttributes);
    } catch (error) {}
  };

  const isCircleCoupon = (coupon: pharma_coupon) => {
    return !!coupon?.circleBenefits;
  };

  const isProductOfferCoupon = (coupon: pharma_coupon) => {
    return coupon?.frontEndCategory?.toLowerCase() === 'productOffers'.toLowerCase();
  };

  const saveDisableCoupons = (couponName: string) => {
    if (couponName) {
      setAppliedCouponName(couponName);
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

  const applyConsultCoupon = (coupon: string, applyingFromList?: boolean) => {
    setLoading?.(true);
    onApplyCoupon(coupon)
      .then(() => {
        props.navigation.goBack();
      })
      .catch((reason: string) => {
        setLoading?.(false);
        !applyingFromList && setCouponError(reason);
        applyingFromList && setCouponListError(reason);
        saveDisableCoupons(coupon);
      })
      .finally(() => setLoading?.(false));
  };

  const renderInputWithValidation = () => {
    const rightIconView = () => {
      return (
        !couponError && (
          <View style={{ opacity: isEnableApplyBtn ? 1 : 0.5 }}>
            <TouchableOpacity
              activeOpacity={1}
              disabled={!isEnableApplyBtn}
              onPress={() => {
                if (isFromConsult) {
                  applyConsultCoupon(couponText, false);
                } else {
                  setCouponTextApplied(true);
                  setUserActionPayload?.({
                    coupon: couponText || '',
                  });
                }
              }}
            >
              <SearchSendIcon />
            </TouchableOpacity>
          </View>
        )
      );
    };

    return (
      <View style={styles.textInputContainer}>
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
            autoCapitalize: 'characters',
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
      <Text style={styles.inputValidationStyle}>{error || 'Invalid Coupon Code'}</Text>
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

  const renderCircleBenefitsChipView = (applicable: boolean) => {
    return (
      <View style={applicable ? styles.chipView1 : styles.chipView2}>
        {applicable ? (
          <View style={styles.circleBenefitsView}>
            <CircleLogo style={styles.circleLogo} />
            <Text style={styles.circleBenefits}>{'benefits applicable'}</Text>
          </View>
        ) : (
          <Text style={styles.circleBenefits}>{'Circle benefits not applicable'}</Text>
        )}
      </View>
    );
  };

  const renderGeneralCoupons = (
    coupons: pharma_coupon[],
    showAllCoupons: boolean,
    showMoreLessButton: boolean,
    onPressMoreLessButton: () => void
  ) => {
    const couponsForYou = coupons;
    return couponsForYou?.map((coupon, i) => {
      const disableList = disableCouponsList?.indexOf(coupon?.coupon) > -1;
      return (
        <TouchableOpacity
          key={i}
          disabled={disableList}
          onPress={() => {
            couponApply(coupon?.coupon);
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
            {disableList &&
              appliedCouponName === coupon?.coupon &&
              renderCouponError(couponListError)}
            {i !== coupons?.length - 1 && <View style={styles.itemSeperator} />}
          </View>
          {showMoreLessButton && i === couponsForYou?.length - 1 ? (
            <TouchableOpacity style={styles.bottomViewCardBtn} onPress={onPressMoreLessButton}>
              <Text style={styles.viewBtnText}>View{showAllCoupons ? ' less' : ' more'}</Text>
              {showAllCoupons ? <Up /> : <Down />}
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
      );
    });
  };

  const couponApply = (couponText: string) => {
    CommonLogEvent(AppRoutes.ViewCoupons, 'Apply Coupon');
    if (isFromConsult) {
      applyConsultCoupon(couponText, true);
    } else {
      setCouponTextApplied(false);
      setUserActionPayload?.({
        coupon: couponText || '',
        subscription: {
          subscriptionApplied: cartCircleSubscriptionId && isCircleCart ? true : false,
        },
      });
    }
  };

  const renderCouponList = () => (
    <View style={styles.cardStyle}>
      {renderCardTitle('COUPONS FOR YOU', false)}
      {renderGeneralCoupons(
        showAllCouponList ? couponList : couponList?.slice(0, 2),
        showAllCouponList,
        couponList?.length > 2,
        () => setShowAllCouponList(!showAllCouponList)
      )}
    </View>
  );

  const renderProductOffers = () => (
    <View style={styles.cardStyle}>
      {renderCardTitle('PRODUCT OFFERS', false)}
      {renderGeneralCoupons(
        showAllProductOffers ? productOffers : productOffers?.slice(0, 2),
        showAllProductOffers,
        productOffers?.length > 2,
        () => setShowAllProductOffers(!showAllProductOffers)
      )}
    </View>
  );

  const renderCircleCoupons = () => (
    <View style={styles.cardStyle}>
      {renderCardTitle('COUPONS FOR YOU', true)}
      {renderGeneralCoupons(
        showAllCircleCoupons ? circleCoupons : circleCoupons?.slice(0, 2),
        showAllCircleCoupons,
        circleCoupons?.length > 2,
        () => setShowAllCircleCoupons(!showAllCircleCoupons)
      )}
    </View>
  );

  const renderCardTitle = (title: string, circleBenefitsApplicable: boolean) => {
    const showCircleBenefitsInfo =
      movedFrom === 'pharma' &&
      ((circleSubscriptionId && circleStatus === 'active') || circlePlanSelected?.subPlanId);
    return (
      <ListItem
        bottomDivider
        Component={TouchableOpacity}
        containerStyle={styles.titleContainer}
        titleStyle={styles.heading}
        title={title}
        rightElement={
          showCircleBenefitsInfo ? renderCircleBenefitsChipView(circleBenefitsApplicable) : <></>
        }
      />
    );
  };

  const goBackToPreviousScreen = () => {
    if (!isFromConsult) {
      setUserActionPayload?.({
        coupon: '',
        subscription: {
          subscriptionApplied: cartCircleSubscriptionId ? true : false,
        },
      });
    }
    props.navigation.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          leftIcon="backArrow"
          title={'APPLY COUPON'}
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={goBackToPreviousScreen}
        />
        <ScrollView bounces={false} contentContainerStyle={{ padding: 15 }}>
          {renderInputWithValidation()}
          {shimmerLoading && renderCouponViewShimmer()}
          {renderNoCouponsFound()}
          {!!circleCoupons?.length && renderCircleCoupons()}
          {!!couponList?.length && renderCouponList()}
          {!!productOffers?.length && renderProductOffers()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
