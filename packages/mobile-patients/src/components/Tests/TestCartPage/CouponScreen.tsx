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
import {
  DIAGNOSTIC_GROUP_PLAN,
  fetchDiagnosticCoupons,
  validateConsultCoupon,
} from '@aph/mobile-patients/src/helpers/apiCalls';

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
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { Overlay } from 'react-native-elements';
import { createDiagnosticValidateCouponLineItems } from '@aph/mobile-patients/src/utils/commonUtils';

const screenHeight = Dimensions.get('window').height;
export interface CouponScreenProps
  extends NavigationScreenProps<{
    pincode: number;
    lineItemWithQuantity: any[];
    toPayPrice: number;
    // applyCouponCallback: (appliedCoupon: any) => void;
  }> {}

export const CouponScreen: React.FC<CouponScreenProps> = (props) => {
  const {
    modifiedOrder,
    isDiagnosticCircleSubscription,
    isCircleAddedToCart,
    setCoupon,
    couponDiscount,
    setCouponDiscount,
    setCouponCircleBenefits,
    circleSaving,
    setCouponOnMrp,
  } = useDiagnosticsCart();
  const { circleSubscriptionId, hdfcSubscriptionId } = useShoppingCart();
  const { hdfcPlanId, circlePlanId, hdfcStatus, circleStatus } = useAppCommonData();
  const { currentPatient } = useAllCurrentPatients();
  const { showAphAlert, setLoading, loading } = useUIElements();
  const getPincode = props.navigation.getParam('pincode');
  const lineItemWithQuantity = props.navigation.getParam('lineItemWithQuantity');
  const toPayPrice = props.navigation.getParam('toPayPrice');
  const [couponsList, setCouponsList] = useState([] as any);
  const [couponListError, setCouponListError] = useState<string>('');
  const [couponError, setCouponError] = useState<string>('');
  const [couponText, setCouponText] = useState<string>('');
  const [appliedCouponName, setAppliedCouponName] = useState<string>('');
  const [disableCouponsList, setDisableCouponsList] = useState<string[]>([]);
  const [loadingOverlay, setLoadingOverlay] = useState<boolean>(false);
  const isModifyFlow = !!modifiedOrder && !isEmptyObject(modifiedOrder);

  const isEnableApplyBtn = couponText.length >= 4;

  let packageId: string[] = [];
  if (hdfcSubscriptionId && hdfcStatus === 'active') {
    packageId.push(`HDFC:${hdfcPlanId}`);
  }
  if (isCircleAddedToCart || (circleSubscriptionId && circleStatus === 'active')) {
    packageId.push(`APOLLO:${circlePlanId}`);
  }

  useEffect(() => {
    getDiagnosticCoupons();
  }, []);

  async function getDiagnosticCoupons() {
    setLoading?.(true);
    try {
      const result = await fetchDiagnosticCoupons('Diag', packageId);
      if (!!result?.data?.response && result?.data?.response?.length > 0) {
        const getCoupons = result?.data?.response;
        setLoading?.(false);
        setCouponsList(getCoupons);
      } else {
        setLoading?.(false);
        setCouponsList([]);
      }
    } catch (error) {
      setCouponsList([]);
      renderErrorInFetching();
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

  //this will differ in modify flow.
  const validateAppliedCoupon = (
    coupon: string,
    cartItemsWithQuan: DiagnosticsCartItem[], //with quantity
    applyingFromList?: boolean,
    discountedItems?: any,
    setSubscription?: boolean //used to set the circle sub to false, so that circle benefits are not applied against it
  ) => {
    CommonLogEvent(AppRoutes.CouponScreen, 'Select coupon');
    setLoadingOverlay?.(true);
    const createLineItemsForPayload = createDiagnosticValidateCouponLineItems(
      cartItemsWithQuan,
      setSubscription != undefined
        ? false
        : isDiagnosticCircleSubscription
        ? true
        : isCircleAddedToCart,
      discountedItems
    );
    const totalBillAmt = createLineItemsForPayload?.pricesForItemArray?.map(
      (item: any) => item?.specialPrice * item?.quantity
    );
    const totalAmountToPass = totalBillAmt?.reduce((curr: number, prev: number) => curr + prev, 0);
    let data = {
      mobile: currentPatient?.mobileNumber,
      billAmount: totalAmountToPass,
      coupon: coupon,
      pinCode: String(getPincode),
      diagnostics: createLineItemsForPayload?.pricesForItemArray?.map((item: any) => item), //define type
      packageIds: setSubscription != undefined ? [] : packageId, //array of all subscriptions of user
    };
    validateConsultCoupon(data)
      .then((resp: any) => {
        if (resp?.data?.errorCode == 0) {
          if (resp?.data?.response?.valid) {
            const responseData = resp?.data?.response;
            const getCircleBenefits = responseData?.circleBenefits;
            const hasOnMrpTrue = responseData?.diagnostics?.filter((item: any) => item?.onMrp);
            /**
             * case for if user is claiming circle benefits, but coupon => circleBenefits as false
             */
            if (
              ((isDiagnosticCircleSubscription || isCircleAddedToCart) &&
                !responseData?.circleBenefits &&
                setSubscription == undefined) ||
              (hasOnMrpTrue?.length > 0 && setSubscription == undefined)
            ) {
              validateAppliedCoupon(
                coupon,
                cartItemsWithQuan,
                applyingFromList,
                responseData?.diagnostics,
                false
              );
            } else {
              const successMessage = responseData?.successMessage || '';
              setCoupon?.({
                ...responseData,
                successMessage: successMessage,
              });
              const getAllApplicableItems = responseData?.diagnostics?.map(
                (item: any) => item?.applicable && item?.discountAmt * item?.quantity
              );
              const getAllDiscounts = getAllApplicableItems?.reduce(
                (currentItem: any, prevItem: any) => currentItem + prevItem,
                0
              );
              const getItemsWithMrpTrue = responseData?.diagnostics?.filter(
                (item: any) => item?.applicable && item?.onMrp
              );
              setCouponOnMrp?.(getItemsWithMrpTrue);
              setCouponDiscount?.(getAllDiscounts); //not using response?.discount since amount was varying
              setCouponCircleBenefits?.(getCircleBenefits);
              setLoadingOverlay?.(false);
              props.navigation.goBack();
            }
          } else {
            const getErrorResponseReason = resp?.data?.response?.reason;
            !applyingFromList && setCouponError(getErrorResponseReason);
            applyingFromList && setCouponListError(getErrorResponseReason);
            setLoadingOverlay?.(false);
            setCouponOnMrp?.(null);
            setCouponDiscount?.(0);
            setDisableCouponsList([...disableCouponsList, coupon]);
            saveDisableCoupons(coupon);
            setCouponCircleBenefits?.(false); //reset it to default value
          }
          //add event here
        } else {
          const getCouponErrorMsg = resp?.data?.errorMsg;
          CommonBugFender('validateAppliedCoupon_CouponScreen', getCouponErrorMsg);
          !applyingFromList && setCouponError(getCouponErrorMsg);
          applyingFromList && setCouponListError(getCouponErrorMsg);
          setCouponOnMrp?.(null);
          setLoadingOverlay?.(false);
          setCouponDiscount?.(0);
          saveDisableCoupons(coupon);
          setCouponCircleBenefits?.(false); //reset it to default value
        }
      })
      .catch((error) => {
        CommonBugFender('validateAppliedCoupon_CouponScreen', error);
        !applyingFromList && setCouponError(string.diagnosticsCoupons.unableToValidate);
        applyingFromList && setCouponListError(string.diagnosticsCoupons.unableToValidate);
        setCouponOnMrp?.(null);
        setLoadingOverlay?.(false);
        setCouponDiscount?.(0);
        saveDisableCoupons(coupon);
        setCouponCircleBenefits?.(false); //reset it to default value
      });
  };

  function _onPressApplyCoupon(coupon: string, appliedFromList: boolean) {
    validateAppliedCoupon(coupon, lineItemWithQuantity, appliedFromList);
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
                setCouponText(text?.toUpperCase());
              }
            }}
            textInputprops={{
              ...(couponError ? { selectionColor: colors.INPUT_BORDER_FAILURE } : {}),
              maxLength: 20,
              autoCapitalize: 'characters',
            }}
            inputStyle={[
              styles.searchValueStyle,
              couponError ? { borderColor: colors.INPUT_BORDER_FAILURE, borderWidth: 2 } : {},
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

  const renderCouponView = (item: any, index: number, isDisabled: boolean) => {
    return (
      <View style={[styles.couponOuterView, isDisabled && { opacity: 0.5 }]}>
        <View style={[styles.couponCodeView, isDisabled && { backgroundColor: 'transparent' }]}>
          <Text style={styles.couponCodeText}>{item?.coupon}</Text>
        </View>
        <TouchableOpacity
          onPress={() => _onPressApplyCoupon(item?.coupon, true)}
          disabled={isDisabled}
        >
          <Text style={styles.applyText}>
            {nameFormater(string.diagnosticsCoupons.apply, 'upper')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCouponHeadingView = (item: any, index: number, isDisabled: boolean) => {
    return (
      <>
        {!!item?.textOffer && item?.textOffer != '' ? (
          <View style={[styles.headingView, isDisabled && { opacity: 0.5 }]}>
            <Text style={styles.headingText}>{item?.textOffer}</Text>
          </View>
        ) : null}
      </>
    );
  };

  const renderCouponDescriptionView = (item: any, index: number, isDisabled: boolean) => {
    return (
      <>
        {!!item?.message && item?.message != '' ? (
          <View style={[styles.descView, isDisabled && { opacity: 0.5 }]}>
            <Text style={styles.descText}>
              {item?.message} <Text style={styles.tncText}>TnC Apply</Text>
            </Text>
          </View>
        ) : null}
      </>
    );
  };

  const renderCouponItems = ({ item, index }) => {
    const disableList = disableCouponsList?.indexOf(item?.coupon) > -1;
    return (
      <View style={{ padding: 16 }}>
        {renderCouponView(item, index, disableList)}
        <View style={{ width: '85%' }}>
          {renderCouponHeadingView(item, index, disableList)}
          {renderCouponDescriptionView(item, index, disableList)}
        </View>
        {/**show error message for invalid coupon */}
        {disableList && appliedCouponName === item?.coupon && renderCouponError(couponListError)}
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

  const renderLoadingOverlay = () => {
    return (
      <Overlay
        isVisible={loadingOverlay}
        windowBackgroundColor={'rgba(0, 0, 0, 0.6)'}
        containerStyle={{ marginBottom: 0 }}
        fullScreen
        transparent
        overlayStyle={styles.loadingOverlay}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[{ ...theme.viewStyles.container }]}>
        {renderHeader()}
        {renderMainView()}
      </SafeAreaView>
      {renderLoadingOverlay()}
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
  loadingOverlay: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    backgroundColor: colors.CLEAR,
    overflow: 'hidden',
    elevation: 0,
    bottom: 0,
    position: 'absolute',
  },
});
