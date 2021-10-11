import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList, Dimensions } from 'react-native';
import { isEmptyObject, nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { NavigationScreenProps, SafeAreaView } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { fetchDiagnosticCoupons } from '@aph/mobile-patients/src/helpers/apiCalls';

import { colors } from '@aph/mobile-patients/src/theme/colors';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  DiagnosticsCartItem,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { createPatientObjLineItems } from '@aph/mobile-patients/src/utils/commonUtils';

const screenHeight = Dimensions.get('window').height;
export interface CouponScreenProps
  extends NavigationScreenProps<{
    pincode: number;
    // applyCouponCallback: (appliedCoupon: any) => void;
  }> {}

export const CouponScreen: React.FC<CouponScreenProps> = (props) => {
  const {
    cartItems,
    modifiedOrder,
    modifiedPatientCart,
    totalPriceExcludingAnyDiscounts,
  } = useDiagnosticsCart();
  const { currentPatient } = useAllCurrentPatients();
  const { showAphAlert, setLoading, loading } = useUIElements();
  const getPincode = props.navigation.getParam('pincode');
  const [couponsList, setCouponsList] = useState([] as any);
  const [couponListError, setCouponListError] = useState<boolean>(false);
  const [couponError, setCouponError] = useState<string>('');
  const [couponText, setCouponText] = useState<string>('');
  const isModifyFlow = !!modifiedOrder && !isEmptyObject(modifiedOrder);

  const isEnableApplyBtn = couponText.length >= 4;

  useEffect(() => {
    getDiagnosticCoupons();
  }, []);

  async function getDiagnosticCoupons() {
    setLoading?.(true);
    try {
      const result = await fetchDiagnosticCoupons('Diag');
      console.log({ result });
      if (!!result?.data?.response && result?.data?.response?.length > 0) {
        const getCoupons = result?.data?.response;
        setLoading?.(false);
        setCouponsList(getCoupons);
      } else {
        setCouponsList([]);
        setCouponListError(true);
      }
    } catch (error) {
      setCouponsList([]);
      renderErrorInFetching();
      console.log({ error });
      CommonBugFender('getDiagnosticCoupons_CouponScreen', error);
    }
  }

  const renderNoCouponsFound = () => {
    return (
      <View style={styles.cardStyle}>
        <View>
          {!loading && couponsList?.length == 0 && (
            <Text style={styles.noCouponsAvailText}>{string.diagnosticsCoupons.noCouponsText}</Text>
          )}
        </View>
      </View>
    );
  };

  const renderErrorInFetching = () => {
    setLoading?.(false);
    props.navigation.goBack();
    showAphAlert?.({
      title: string.common.uhOh,
      description: string.diagnosticsCoupons.couponFetchError,
    });
  };

  function handleBack() {
    props.navigation.goBack();
    return true;
  }

  //this will differ in modify flow.
  // const validateAppliedCoupon = (
  //   coupon: string,
  //   cartItems: DiagnosticsCartItem[],
  //   applyingFromList?: boolean
  // ) => {

  //   CommonLogEvent(AppRoutes.CouponScreen, 'Select coupon');
  //   console.log({ coupon });
  //   console.log({ cartItems });
  //   console.log({ applyingFromList });
  //   setLoading?.(true);
  //   const createLineItems = createPatientObjLineItems(
  //     patientCartItems,
  //     isDiagnosticCircleSubscription ? true : isCircleAddedToCart,
  //     reportGenDetails
  //   ) as (patientObjWithLineItems | null)[];
  //   let data = {
  //     mobile: currentPatient?.mobileNumber,
  //     billAmount: totalPriceExcludingAnyDiscounts,
  //     coupon: coupon,
  //     pinCode: getPincode,
  //     products: cartItems?.map((item) => ({
  //       sku: item?.id,
  //       categoryId: "",
  //       mrp: item?.price,
  //       quantity: item?.quantity,
  //       specialPrice: item?.specialPrice || item?.price,
  //     })),
  //     packageIds: packageId,
  //     email: g(currentPatient, 'emailAddress'),
  //   };
  //   if (isFromSubscription && circlePlanSelected?.subPlanId) {
  //     data['subscriptionType'] = `APOLLO:${circlePlanSelected?.subPlanId}`;
  //   }
  //   console.log('validateConsultCoupon data >> ', data);
  //   validateConsultCoupon(data)
  //     .then((resp: any) => {
  //       console.log({ resp });
  //       if (resp?.data?.errorCode == 0) {
  //         if (resp?.data?.response?.valid) {
  //           const successMessage = resp?.data?.response?.successMessage || '';
  //           setCoupon!({
  //             ...resp?.data?.response,
  //             successMessage: successMessage,
  //           });
  //           if (isFromSubscription) {
  //             setSubscriptionCoupon?.({
  //               ...g(resp?.data, 'response')!,
  //               successMessage: successMessage,
  //             });
  //           }
  //           setIsFreeDelivery?.(!!resp?.data?.response?.freeDelivery);
  //           props.navigation.goBack();
  //         } else {
  //           console.log('in else');
  //           console.log({ resp });
  //           !applyingFromList && setCouponError(g(resp.data, 'response', 'reason'));
  //           applyingFromList && setCouponListError(g(resp.data, 'response', 'reason'));
  //           setDisableCouponsList([...disableCouponsList, coupon]);
  //           saveDisableCoupons(coupon);
  //         }

  //         const products = g(resp?.data, 'response', 'products');
  //         if (products?.length) {
  //           const freeProducts = products?.filter((product) => {
  //             return product?.couponFree === 1;
  //           });
  //           setCouponProducts!(freeProducts);
  //         }

  //         const eventAttributes: WebEngageEvents[WebEngageEventName.CART_COUPON_APPLIED] = {
  //           'Coupon Code': coupon,
  //           'Discounted amount': g(resp?.data, 'response', 'valid')
  //             ? g(resp.data, 'response', 'discount')
  //             : 'Not Applicable',
  //           'Customer ID': g(currentPatient, 'id'),
  //           'Cart Items': cartItems?.length ? JSON.stringify(cartItems) : '',
  //         };
  //         const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.CART_COUPON_APPLIED] = {
  //           'Coupon Code': coupon || undefined,
  //           'Discounted amount': g(resp?.data, 'response', 'valid')
  //             ? g(resp.data, 'response', 'discount')
  //             : 'Not Applicable',
  //           'Customer ID': g(currentPatient, 'id'),
  //           'Cart Items': cartItems?.length ? JSON.stringify(cartItems) : undefined,
  //         };
  //         // postCleverTapEvent(CleverTapEventName.CART_COUPON_APPLIED, cleverTapEventAttributes);
  //         postWebEngageEvent(WebEngageEventName.CART_COUPON_APPLIED, eventAttributes);
  //       } else {
  //         console.log('error in validatetion');
  //         console.log(resp);
  //         CommonBugFender('validatingPharmaCoupon', g(resp?.data, 'errorMsg'));
  //         !applyingFromList && setCouponError(g(resp?.data, 'errorMsg'));
  //         applyingFromList && setCouponListError(g(resp?.data, 'errorMsg'));
  //         saveDisableCoupons(coupon);
  //       }
  //     })
  //     .catch((error) => {
  //       console.log('in catch fo validate');
  //       console.log({ error });
  //       CommonBugFender('validatingPharmaCoupon', error);
  //       !applyingFromList && setCouponError('Sorry, unable to validate coupon right now.');
  //       applyingFromList && setCouponListError('Sorry, unable to validate coupon right now.');
  //       saveDisableCoupons(coupon);
  //     })
  //     .finally(() => setLoading?.(false));
  // };

  function _onPressApplyCoupon(coupon: string, appliedFromList: boolean) {
    // validateAppliedCoupon(coupon, cartItems, appliedFromList);
  }

  const renderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        title={'APPLY COUPON'}
        onPressLeftIcon={() => handleBack()}
      />
    );
  };

  const renderLabel = (label: string, rightText?: string) => {
    return (
      <View style={styles.labelView}>
        <Text style={styles.labelTextStyle}>{label}</Text>
        {rightText && <Text style={styles.labelTextStyle}>{rightText}</Text>}
      </View>
    );
  };

  const renderCouponTextBox = () => {
    const rightIconView = () => {
      return (
        !couponError && (
          <View
            style={[
              styles.rightView,
              {
                opacity: isEnableApplyBtn ? 1 : 0.5,
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={1}
              disabled={!isEnableApplyBtn}
              onPress={() => {
                _onPressApplyCoupon(couponText, false);
              }}
            >
              <Text style={styles.applyText}>
                {nameFormater(string.diagnosticsCoupons.apply, 'upper')}
              </Text>
            </TouchableOpacity>
          </View>
        )
      );
    };

    return (
      <View style={styles.textInputContainer}>
        <View style={{ flexDirection: 'row' }}>
          <TextInputComponent
            value={couponText}
            onChangeText={(text) => {
              if (/^\S*$/.test(text)) {
                couponError && setCouponError('');
                setCouponText(text);
              }
            }}
            textInputprops={{
              ...(couponError ? { selectionColor: colors.INPUT_BORDER_FAILURE } : {}),
              maxLength: 20,
              autoCapitalize: 'characters',
            }}
            inputStyle={[
              styles.searchValueStyle,
              couponError ? { borderBottomColor: colors.INPUT_BORDER_FAILURE } : {},
            ]}
            conatinerstyles={{ paddingBottom: 0 }}
            placeholder={string.diagnosticsCoupons.couponPlcaholder}
          />
          {rightIconView()}
        </View>

        {renderCouponError(couponError)}
      </View>
    );
  };

  const renderCouponError = (error: string) => {
    return !!error ? (
      <Text style={styles.inputValidationStyle}>
        {error || string.diagnosticsCoupons.invalidCouponCode}
      </Text>
    ) : null;
  };

  const renderCouponView = (item: any, index: number) => {
    return (
      <View style={styles.couponOuterView}>
        <View style={styles.couponCodeView}>
          <Text style={styles.couponCodeText}>{item?.coupon}</Text>
        </View>
        <TouchableOpacity onPress={() => _onPressApplyCoupon(item?.coupon, true)}>
          <Text style={styles.applyText}>
            {nameFormater(string.diagnosticsCoupons.apply, 'upper')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCouponHeadingView = (item: any, index: number) => {
    return (
      <>
        {!!item?.textOffer && item?.textOffer != '' ? (
          <View style={styles.headingView}>
            <Text style={styles.headingText}>{item?.textOffer}</Text>
          </View>
        ) : null}
      </>
    );
  };

  const renderCouponDescriptionView = (item: any, index: number) => {
    return (
      <>
        {!!item?.message && item?.message != '' ? (
          <View style={styles.descView}>
            <Text style={styles.descText}>
              {item?.message} <Text style={styles.tncText}>TnC Apply</Text>
            </Text>
          </View>
        ) : null}
      </>
    );
  };

  const renderCouponItems = ({ item, index }) => {
    return (
      <View style={{ padding: 16 }}>
        {renderCouponView(item, index)}
        <View style={{ width: '85%' }}>
          {renderCouponHeadingView(item, index)}
          {renderCouponDescriptionView(item, index)}
        </View>
      </View>
    );
  };

  const keyExtractor = useCallback((item: any, index: number) => `${index}`, []);

  const renderSeparator = () => {
    return <Spearator />;
  };

  const renderApplicableCouponsList = () => {
    return (
      <View style={styles.listOuterView}>
        <FlatList
          keyExtractor={keyExtractor}
          bounces={false}
          data={couponsList}
          renderItem={renderCouponItems}
          ListEmptyComponent={renderNoCouponsFound}
          ItemSeparatorComponent={renderSeparator}
        />
      </View>
    );
  };

  const renderMainView = () => {
    return (
      <View>
        {renderLabel(nameFormater(string.diagnosticsCoupons.applyCouponText, 'title'))}
        {renderCouponTextBox()}
        {renderLabel(string.diagnosticsCoupons.couponForYou)}
        {renderApplicableCouponsList()}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'red' }}>
      <SafeAreaView style={[{ ...theme.viewStyles.container }]}>
        {renderHeader()}
        {renderMainView()}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  labelView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 10,
    marginRight: 16,
  },
  labelTextStyle: {
    ...theme.viewStyles.text('R', 12, colors.SHERPA_BLUE, 1, 20),
    marginBottom: 6,
    marginLeft: 16,
  },
  couponCodeView: {
    padding: 14,
    paddingTop: 4,
    paddingBottom: 4,
    borderColor: colors.CONSULT_SUCCESS_TEXT,
    backgroundColor: colors.TEST_CARD_BUTTOM_BG,
    borderWidth: 1,
    borderRadius: 5,
    borderStyle: 'dashed',
  },
  couponCodeText: {
    ...theme.viewStyles.text('M', 16, colors.CONSULT_SUCCESS_TEXT, 1, 24),
  },
  headingView: {
    marginTop: 12,
  },
  headingText: {
    ...theme.viewStyles.text('M', 14, colors.SHERPA_BLUE, 1, 20),
  },
  descView: {
    marginTop: 6,
  },
  descText: {
    ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 0.4, 20),
  },
  tncText: {
    ...theme.viewStyles.text('M', 12, colors.APP_YELLOW, 1, 20),
  },
  applyText: {
    ...theme.viewStyles.text('SB', 14, colors.TANGERINE_YELLOW, 1, 19),
  },
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    marginVertical: 8,
  },
  noCouponsAvailText: {
    ...theme.viewStyles.text('M', 13, theme.colors.FILTER_CARD_LABEL),
    margin: 20,
    textAlign: 'center',
    opacity: 0.3,
  },
  textInputContainer: {
    backgroundColor: theme.colors.WHITE,
    padding: 16,
    paddingTop: 12,
    paddingBottom: 12,
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
  searchValueStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SHERPA_BLUE,
    backgroundColor: '#F7F8F5',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 5,
    width: '100%',
    height: 48,
    paddingLeft: 10,
  },
  rightView: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    right: 0,
    height: 48,
    paddingRight: 16,
  },
  couponOuterView: { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' },
  listOuterView: { backgroundColor: colors.WHITE, flexGrow: 1, maxHeight: screenHeight / 1.55 },
});
