import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  ImageBackground,
  Dimensions,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useApolloClient } from 'react-apollo-hooks';
import {
  GET_PLAN_DETAILS_BY_PLAN_ID,
  CREATE_USER_SUBSCRIPTION,
  CREATE_INTERNAL_ORDER,
  CREATE_ORDER,
} from '@aph/mobile-patients/src/graphql/profiles';
import { GetPlanDetailsByPlanId } from '@aph/mobile-patients/src/graphql/types/GetPlanDetailsByPlanId';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import ContentLoader from 'react-native-easy-content-loader';
import { CircleLogo, BlueTick, CrossPopup } from '@aph/mobile-patients/src/components/ui/Icons';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import AsyncStorage from '@react-native-community/async-storage';
import { Overlay } from 'react-native-elements';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { g, postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  CreateUserSubscription,
  CreateUserSubscriptionVariables,
} from '@aph/mobile-patients/src/graphql/types/CreateUserSubscription';
import {
  one_apollo_store_code,
  PaymentStatus,
  OrderCreate,
  OrderVerticals,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import moment from 'moment';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { postCircleWEGEvent } from '@aph/mobile-patients/src/components/CirclePlan/Events';
import {
  createOrderInternal,
  createOrderInternalVariables,
} from '@aph/mobile-patients/src/graphql/types/createOrderInternal';
import {
  initiateSDK,
  createHyperServiceObject,
  terminateSDK,
} from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { isSDKInitialised } from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { useGetJuspayId } from '@aph/mobile-patients/src/hooks/useGetJuspayId';

const { width } = Dimensions.get('window');
interface CircleMembershipPlansProps extends NavigationScreenProps {
  style?: StyleProp<ViewStyle>;
  onSelectMembershipPlan?: (plan?: any) => void;
  isConsultJourney?: boolean;
  isDiagnosticJourney?: boolean;
  careDiscountPrice?: number;
  isModal?: boolean;
  closeModal?: (() => void) | null;
  membershipPlans?: any;
  doctorFees?: number;
  onEndApiCall?: (() => void) | null;
  buyNow?: boolean;
  source?: 'Pharma' | 'Product Detail' | 'Pharma Cart' | 'Diagnostic' | 'Consult';
  from?: string;
  healthCredits?: number;
  onPurchaseWithHCCallback?: (res: any) => void;
  screenName?: string;
}

export const CircleMembershipPlans: React.FC<CircleMembershipPlansProps> = (props) => {
  const { isRenew, circleSubscription } = useAppCommonData();

  const [membershipPlans, setMembershipPlans] = useState<any>(props.membershipPlans || []);
  const [spinning, setSpinning] = useState<boolean>(true);
  const {
    isConsultJourney,
    isDiagnosticJourney,
    careDiscountPrice,
    onSelectMembershipPlan,
    isModal,
    closeModal,
    doctorFees,
    onEndApiCall,
    buyNow,
    source,
    from,
    healthCredits,
    onPurchaseWithHCCallback,
    screenName,
  } = props;
  const client = useApolloClient();
  const planId = AppConfig.Configuration.CIRCLE_PLAN_ID;
  const circleStaticMonthlySavings = AppConfig.Configuration.CIRCLE_STATIC_MONTHLY_SAVINGS;
  const {
    circlePlanSelected,
    setCirclePlanSelected,
    setDefaultCirclePlan,
    defaultCirclePlan,
    selectDefaultPlan,
    cartTotalCashback,
    setIsCircleSubscription,
    setCircleMembershipCharges,
    setAutoCirlcePlanAdded,
    autoCirlcePlanAdded,
    circleMembershipCharges,
    setCircleSubPlanId,
    circleSubscriptionId,
    cartItems,
  } = useShoppingCart();
  const { setIsDiagnosticCircleSubscription } = useDiagnosticsCart();
  const { currentPatient } = useAllCurrentPatients();
  const { setLoading } = useUIElements();
  const storeCode =
    Platform.OS === 'ios' ? one_apollo_store_code.IOSCUS : one_apollo_store_code.ANDCUS;
  const amountToPay = defaultCirclePlan
    ? defaultCirclePlan?.currentSellingPrice
    : circlePlanSelected?.currentSellingPrice;
  const purchaseWithHC = healthCredits && healthCredits >= amountToPay;
  const planDimension = isModal ? 100 : 120;
  const defaultPlanDimension = isModal ? 130 : 120;
  const isIos = Platform.OS === 'ios';
  const CircleEventAttributes: WebEngageEvents[WebEngageEventName.PHARMA_HOME_KNOW_MORE_CLICKED_CIRCLE_POPUP] = {
    'Patient UHID': currentPatient?.uhid,
    'Mobile Number': currentPatient?.mobileNumber,
    'Customer ID': currentPatient?.id,
    'Circle Member': circleSubscriptionId ? 'Yes' : 'No',
  };
  const { cusId, isfetchingId } = useGetJuspayId();

  useEffect(() => {
    if (!props.membershipPlans || props.membershipPlans?.length === 0) {
      fetchCarePlans();
    } else {
      setSpinning(false);
      onEndApiCall && onEndApiCall();
    }
    if (buyNow && props.membershipPlans?.length > 0) {
      setDefaultCirclePlan && setDefaultCirclePlan(null);
    }
  }, []);

  useEffect(() => {
    !isfetchingId ? (cusId ? initiateHyperSDK(cusId) : initiateHyperSDK(currentPatient?.id)) : null;
  }, [isfetchingId]);

  const initiateHyperSDK = async (cusId: any) => {
    try {
      const isInitiated: boolean = await isSDKInitialised();
      const merchantId = AppConfig.Configuration.merchantId;
      isInitiated
        ? (terminateSDK(),
          setTimeout(() => createHyperServiceObject(), 1000),
          setTimeout(() => initiateSDK(cusId, cusId, merchantId), 2000))
        : initiateSDK(cusId, cusId, merchantId);
    } catch (error) {
      CommonBugFender('ErrorWhileInitiatingHyperSDK', error);
    }
  };

  const fireMembershipPlanSelected = () => {
    const CircleEventAttributes: WebEngageEvents[WebEngageEventName.NON_CIRCLE_PLAN_SELECTED] = {
      'Patient UHID': currentPatient?.uhid,
      'Mobile Number': currentPatient?.mobileNumber,
      'Customer ID': currentPatient?.id,
      'Circle Member': circleSubscriptionId ? 'Yes' : 'No',
      from: props.source || 'HomePage',
    };
    postWebEngageEvent(WebEngageEventName.NON_CIRCLE_PLAN_SELECTED, CircleEventAttributes);
  };

  const fetchCarePlans = async () => {
    try {
      const res = await client.query<GetPlanDetailsByPlanId>({
        query: GET_PLAN_DETAILS_BY_PLAN_ID,
        fetchPolicy: 'no-cache',
        variables: {
          plan_id: planId,
        },
      });
      const circlePlans = res?.data?.GetPlanDetailsByPlanId?.response?.plan_summary;
      if (circlePlans) {
        setMembershipPlans(circlePlans);
        if ((doctorFees && doctorFees >= 400) || isModal) {
          if (!buyNow) {
            autoSelectDefaultPlan(circlePlans);
            if (!circlePlanSelected) {
              selectDefaultPlan && selectDefaultPlan(circlePlans);
              setAutoCirlcePlanAdded && setAutoCirlcePlanAdded(true);
            } else {
              setAutoCirlcePlanAdded && setAutoCirlcePlanAdded(false);
            }
          }
        } else {
          if (isConsultJourney || isDiagnosticJourney || !circleMembershipCharges) {
            setDefaultCirclePlan && setDefaultCirclePlan(null);
            defaultCirclePlan && setCirclePlanSelected && setCirclePlanSelected(null);
            setAutoCirlcePlanAdded && setAutoCirlcePlanAdded(false);
          } else {
            // pharma journey and circle membership charges
            const planSelected = circlePlans.filter(
              (value) => value?.currentSellingPrice == circleMembershipCharges
            );
            setIsCircleSubscription && setIsCircleSubscription(true);
            onSelectMembershipPlan && onSelectMembershipPlan(planSelected[0]);
            setDefaultCirclePlan && setDefaultCirclePlan(null);
            setAutoCirlcePlanAdded && setAutoCirlcePlanAdded(false);
          }
        }
      }
      setSpinning(false);
      onEndApiCall && onEndApiCall();
    } catch (error) {
      setSpinning(false);
      onEndApiCall && onEndApiCall();
      CommonBugFender('CareSelectPlans_GetPlanDetailsByPlanId', error);
    }
  };
  const onPressMembershipPlans = (index: number) => {
    fireMembershipPlanSelected();

    const membershipPlan = membershipPlans?.[index];
    setCirclePlanSelected && setCirclePlanSelected(membershipPlan);
    AsyncStorage.setItem('circlePlanSelected', JSON.stringify(membershipPlan));
    if (isConsultJourney) {
      !isModal &&
        circleWebEngageEventForAddToCart(
          WebEngageEventName.VC_NON_CIRCLE_ADDS_CART,
          membershipPlan
        );
      onSelectMembershipPlan && onSelectMembershipPlan();
    } else {
      setIsCircleSubscription && setIsCircleSubscription(true);
      setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(true);
      setCircleMembershipCharges && setCircleMembershipCharges(membershipPlan?.currentSellingPrice);
      onSelectMembershipPlan && onSelectMembershipPlan(membershipPlan);
    }
    setDefaultCirclePlan && setDefaultCirclePlan(null);
    setAutoCirlcePlanAdded && setAutoCirlcePlanAdded(false);
  };

  const fireCircleKnowMoreEvent = () => {
    source == 'Pharma' &&
      postWebEngageEvent(
        WebEngageEventName.PHARMA_HOME_KNOW_MORE_CLICKED_CIRCLE_POPUP,
        CircleEventAttributes
      );
    source == 'Product Detail' &&
      postWebEngageEvent(
        WebEngageEventName.PHARMA_PRODUCT_KNOW_MORE_CLICKED_CIRCLE_POPUP,
        CircleEventAttributes
      );
    source == 'Pharma Cart' &&
      postWebEngageEvent(
        WebEngageEventName.PHARMA_CART_KNOW_MORE_CLICKED_CIRCLE_POPUP,
        CircleEventAttributes
      );
    source == 'Diagnostic' &&
      postWebEngageEvent(
        WebEngageEventName.DIAGNOSTICS_KNOW_MORE_CLICKED_CIRCLE_POPUP,
        CircleEventAttributes
      );
  };

  const fireCircleBuyNowEvent = () => {
    source == 'Product Detail' &&
      postWebEngageEvent(
        WebEngageEventName.PHARMA_PRODUCT_ADD_TO_CART_CLICKED_CIRCLE_POPUP,
        CircleEventAttributes
      );
    source == 'Diagnostic' &&
      postWebEngageEvent(
        WebEngageEventName.DIAGNOSTICS_BUY_NOW_CLICKED_CIRCLE_POPUP,
        CircleEventAttributes
      );
  };

  const fireCirclePlanRemovedEvent = () => {
    source == 'Pharma Cart' &&
      postWebEngageEvent(
        WebEngageEventName.PHARMA_CART_CIRCLE_MEMBERSHIP_REMOVED,
        CircleEventAttributes
      );
    isConsultJourney && circleWebEngageEvent(WebEngageEventName.VC_NON_CIRCLE_REMOVES_CART);
  };

  const createOrderInternal = (subscriptionId: string) => {
    const orders: OrderVerticals = {
      subscription: [
        {
          order_id: subscriptionId,
          amount: amountToPay,
          patient_id: currentPatient?.id,
        },
      ],
    };
    const orderInput: OrderCreate = {
      orders: orders,
      total_amount: amountToPay,
      customer_id: currentPatient?.primaryPatientId || currentPatient?.id,
    };
    return client.mutate<createOrderInternal, createOrderInternalVariables>({
      mutation: CREATE_INTERNAL_ORDER,
      variables: { order: orderInput },
    });
  };

  const createJusPayOrder = (paymentId: string) => {
    const orderInput = {
      payment_order_id: paymentId,
      health_credits_used: amountToPay,
      cash_to_collect: 0,
      prepaid_amount: 0,
      store_code: storeCode,
      is_mobile_sdk: true,
      return_url: AppConfig.Configuration.baseUrl,
    };
    return client.mutate({
      mutation: CREATE_ORDER,
      variables: { order_input: orderInput },
      fetchPolicy: 'no-cache',
    });
  };

  const createUserSubscription = () => {
    const purchaseInput = {
      userSubscription: {
        mobile_number: currentPatient?.mobileNumber,
        plan_id: planId,
        sub_plan_id: defaultCirclePlan
          ? defaultCirclePlan?.subPlanId
          : circlePlanSelected?.subPlanId,
        storeCode,
        FirstName: currentPatient?.firstName,
        LastName: currentPatient?.lastName,
        payment_reference: {
          amount_paid: amountToPay,
          payment_status: PaymentStatus.PENDING,
          purchase_via_HC: false,
          HC_used: 0,
        },
        transaction_date_time: new Date().toISOString(),
      },
    };
    return client.mutate<CreateUserSubscription, CreateUserSubscriptionVariables>({
      mutation: CREATE_USER_SUBSCRIPTION,
      variables: purchaseInput,
      fetchPolicy: 'no-cache',
    });
  };

  const initiateCirclePurchase = async () => {
    try {
      setSpinning(true);
      const response = await createUserSubscription();
      const subscriptionId = g(response, 'data', 'CreateUserSubscription', 'response', '_id');
      const data = await createOrderInternal(subscriptionId);
      const orderInfo = {
        orderId: subscriptionId,
        circleParams: {
          circleActivated: true,
          circlePlanValidity: g(response, 'data', 'CreateUserSubscription', 'response', 'end_date'),
        },
      };
      setSpinning(false);
      closeModal && closeModal();
      if (data?.data?.createOrderInternal?.success) {
        props.navigation.navigate(AppRoutes.PaymentMethods, {
          paymentId: data?.data?.createOrderInternal?.payment_order_id!,
          amount: amountToPay,
          orderDetails: orderInfo,
          businessLine: 'subscription',
          customerId: cusId,
        });
      }
    } catch (error) {
      CommonBugFender('Circle_Purchase_Initiation_Failed', error);
    }
  };

  const renderCareSubscribeCard = (value: any, index: number) => {
    const duration = value?.durationInMonth;
    const isPlanActive =
      circlePlanSelected?.subPlanId === value?.subPlanId ||
      (isModal && defaultCirclePlan?.subPlanId === value?.subPlanId);
    const iconDimension = isPlanActive ? defaultPlanDimension : planDimension;
    return (
      <View>
        <View style={{ paddingBottom: 20 }}>
          <TouchableOpacity
            key={index}
            activeOpacity={1}
            onPress={() => onPressMembershipPlans(index)}
            style={[styles.subscriptionCard, { marginLeft: index === 0 ? 10 : 0 }]}
          >
            <ImageBackground
              source={{ uri: value?.icon }}
              style={[
                styles.planContainer,
                {
                  width: iconDimension,
                  height: iconDimension,
                },
              ]}
            >
              <Text
                style={[
                  styles.duration,
                  {
                    left:
                      `${duration}`.length === 1
                        ? !isIos
                          ? isPlanActive
                            ? 6
                            : isModal
                            ? 5
                            : 6
                          : isPlanActive
                          ? 7
                          : isModal
                          ? 6
                          : 7
                        : isPlanActive
                        ? 5
                        : isModal
                        ? 3
                        : 4,
                    top: `${duration}`.length === 1 ? iconDimension / 2 - 3 : iconDimension / 2 + 3,
                    transform:
                      `${duration}`.length === 1 ? [{ rotate: '-80deg' }] : [{ rotate: '-100deg' }],
                    color: index === 1 ? 'white' : theme.colors.APP_YELLOW,
                    fontSize: isPlanActive ? 16 : 14,
                  },
                ]}
              >
                {duration}
              </Text>
              <Text
                style={[
                  styles.price,
                  {
                    marginTop: isPlanActive ? iconDimension / 2 - 12 : iconDimension / 2 - 8,
                    fontSize: isPlanActive ? 22 : 16,
                    color: value?.defaultPack ? 'white' : theme.colors.SEARCH_UNDERLINE_COLOR,
                  },
                ]}
              >
                {string.common.Rs}
                {convertNumberToDecimal(value?.currentSellingPrice)}
              </Text>
            </ImageBackground>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => onPressMembershipPlans(index)} style={styles.radioBtn}>
          <View
            style={[
              styles.radioBtnIcon,
              {
                borderWidth: isPlanActive ? 3 : 1,
              },
            ]}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderSubscribeCareContainer = () => (
    <View>
      {isModal ? (
        <Overlay
          onRequestClose={() => closeModal && closeModal()}
          isVisible={isModal}
          windowBackgroundColor={'rgba(0, 0, 0, 0.31)'}
          overlayStyle={styles.overlayStyle}
        >
          <View>
            {renderCloseIcon()}
            {renderSubscriptionPlans()}
          </View>
        </Overlay>
      ) : (
        renderSubscriptionPlans()
      )}
    </View>
  );

  const renderCloseIcon = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (!buyNow && from !== string.banner_context.PHARMACY_HOME) {
            setIsCircleSubscription && setIsCircleSubscription(false);
            setCircleMembershipCharges && setCircleMembershipCharges(0);
            selectDefaultPlan && selectDefaultPlan(membershipPlans);
          } else {
            setDefaultCirclePlan && setDefaultCirclePlan(null);
            setAutoCirlcePlanAdded && setAutoCirlcePlanAdded(false);
          }
          setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(false);
          setCirclePlanSelected && setCirclePlanSelected(null);
          AsyncStorage.removeItem('circlePlanSelected');
          closeModal && closeModal();
        }}
        style={styles.closeIcon}
      >
        <CrossPopup style={styles.crossIconStyle} />
      </TouchableOpacity>
    );
  };

  const renderSubscriptionPlans = () => {
    return (
      <View style={styles.subscriptionContainer}>
        <ContentLoader loading={spinning} active containerStyles={{ marginTop: 10 }}>
          {isModal && renderHeaderTitle()}
          <View style={isModal ? [styles.careBannerView, { paddingBottom: 5 }] : {}}>
            <View style={styles.careTextContainer}>
              <CircleLogo style={styles.circleLogo} />
              {isConsultJourney ? (
                autoCirlcePlanAdded ? (
                  <Text style={styles.getCareText}>
                    Get{' '}
                    <Text style={theme.viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE)}>
                      {string.common.Rs}
                      {convertNumberToDecimal(careDiscountPrice)} off{' '}
                    </Text>{' '}
                    on this Consult with CIRCLE membership and a lot more benefits....
                  </Text>
                ) : (
                  <Text style={styles.getCareText}>
                    {string.circleDoctors.consultCircleOfferDescription}
                  </Text>
                )
              ) : isModal ? (
                <Text style={[styles.getCareText, { fontSize: 10.6 }]}>
                  {isConsultJourney
                    ? string.circleDoctors.getCircleMembershipOffersDescription
                    : string.circlePharmacy.modalDescription}
                </Text>
              ) : (
                <Text style={styles.getCareText}>
                  {string.circlePharmacy.enableCircleToGetBestOffers}
                </Text>
              )}
            </View>
            <ScrollView
              style={{ marginTop: 4 }}
              contentContainerStyle={{
                alignItems: 'center',
                justifyContent: 'space-around',
              }}
              horizontal={true}
              bounces={false}
              showsHorizontalScrollIndicator={false}
            >
              {membershipPlans?.map((value: any, index: number) =>
                renderCareSubscribeCard(value, index)
              )}
            </ScrollView>
            {!isModal &&
              isConsultJourney &&
              !autoCirlcePlanAdded &&
              renderCircleDiscountOnConsult()}
            {!isModal && !isConsultJourney && renderCircleDiscountOnPharmacy()}
            {!isModal && renderKnowMore('flex-end')}
          </View>
          {isModal && renderKnowMore('center')}
          {isModal && renderAddToCart()}
          {isModal && renderCircleFacts()}
        </ContentLoader>
      </View>
    );
  };

  const renderCircleDiscountOnConsult = () => {
    return (
      <View style={styles.circleDiscountContainer}>
        <BlueTick style={styles.tickIcon} />
        <Text style={[styles.getCareText, { marginRight: 0 }]}>
          Get{' '}
          <Text style={theme.viewStyles.text('SB', 12, theme.colors.LIGHT_BLUE)}>
            {string.common.Rs}
            {convertNumberToDecimal(careDiscountPrice)} off{' '}
          </Text>{' '}
          on this Consult
        </Text>
      </View>
    );
  };

  const renderKnowMore = (alignSelf: 'flex-end' | 'center') => {
    return (
      <View
        style={[
          styles.bottomBtnContainer,
          { alignSelf: alignSelf, marginTop: autoCirlcePlanAdded ? 0 : 12 },
        ]}
      >
        <TouchableOpacity
          style={styles.knowMoreBtn}
          onPress={() => {
            fireCircleKnowMoreEvent();
            openCircleWebView();
            closeModal && closeModal();
          }}
        >
          <Text style={{ ...theme.viewStyles.text('SB', 13, theme.colors.APP_YELLOW) }}>
            KNOW MORE
          </Text>
        </TouchableOpacity>
        {!isModal && defaultCirclePlan && <View style={styles.seperatorLine} />}
        {!isModal && defaultCirclePlan ? (
          <TouchableOpacity style={styles.knowMoreBtn} onPress={() => removeAutoAddedPlan()}>
            <Text style={{ ...theme.viewStyles.text('SB', 13, theme.colors.BORDER_BOTTOM_COLOR) }}>
              REMOVE
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const renderCircleDiscountOnPharmacy = () => {
    return (
      <View
        style={{
          marginLeft: 30,
          marginTop: 10,
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <BlueTick style={styles.blueTickIcon} />
          <Text style={theme.viewStyles.text('SB', 13, '#02475B')}>
            {string.circlePharmacy.instantCashback}
          </Text>
          <Text
            style={theme.viewStyles.text('R', 13, '#02475B')}
          >{` of ₹${cartTotalCashback} on this order`}</Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <BlueTick style={styles.blueTickIcon} />
          <Text style={theme.viewStyles.text('SB', 13, '#02475B')}>
            {string.circlePharmacy.freeDelivery}
          </Text>
          <Text style={theme.viewStyles.text('R', 13, '#02475B')}>{` on every order`}</Text>
        </View>
      </View>
    );
  };

  const openCircleWebView = () => {
    props.navigation.navigate(AppRoutes.CommonWebView, {
      url: isConsultJourney
        ? AppConfig.Configuration.CIRCLE_CONSULT_URL
        : from === string.banner_context.HOME
        ? AppConfig.Configuration.CIRCLE_LANDING_URL
        : from === string.banner_context.MEMBERSHIP_DETAILS
        ? AppConfig.Configuration.CIRCLE_LANDING_URL
        : isDiagnosticJourney || from === string.banner_context.DIAGNOSTIC_HOME
        ? AppConfig.Configuration.CIRCLE_TEST_URL
        : AppConfig.Configuration.CIRLCE_PHARMA_URL,
      source: source,
    });
  };

  const circleWebEngageEvent = (eventName: any) => {
    let eventAttributes = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
    };
    postWebEngageEvent(eventName, eventAttributes);
  };

  const circleWebEngageEventForAddToCart = (eventName: any, membershipPlan: any) => {
    const eventAttributes = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      'Membership Type': String(membershipPlan?.valid_duration) + ' days',
      'Membership End Date': moment(new Date())
        .add(membershipPlan?.valid_duration, 'days')
        .format('DD-MMM-YYYY'),
      'Circle Plan Price': membershipPlan?.currentSellingPrice,
    };
    postWebEngageEvent(eventName, eventAttributes);
  };

  const removeAutoAddedPlan = () => {
    setCirclePlanSelected && setCirclePlanSelected(null);
    setDefaultCirclePlan && setDefaultCirclePlan(null);
    setIsCircleSubscription && setIsCircleSubscription(false);
    setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(false);
    setCircleMembershipCharges && setCircleMembershipCharges(0);
    AsyncStorage.removeItem('circlePlanSelected');
    setAutoCirlcePlanAdded && setAutoCirlcePlanAdded(false);
    circleWebEngageEvent(WebEngageEventName.VC_NON_CIRCLE_REMOVES_CART);
  };

  const onPurchasePlanThroughHC = async () => {
    setLoading && setLoading(true);
    try {
      const response = await createUserSubscription();
      const subscriptionId = g(response, 'data', 'CreateUserSubscription', 'response', '_id');
      const data = await createOrderInternal(subscriptionId);
      const res = await createJusPayOrder(data?.data?.createOrderInternal?.payment_order_id!);
      setLoading?.(false);
      if (res?.data?.createOrderV2?.payment_status == 'TXN_SUCCESS') {
        onPurchaseWithHCCallback!(res);
        if (isRenew || circleSubscription?.status?.toLowerCase() === 'disabled') {
          const circlePlanValidity = {
            startDate: moment(new Date(), 'DD-MM-YYYY'),
            endDate: moment(new Date(), 'DD-MM-YYYY').add(
              circlePlanSelected?.valid_duration || defaultCirclePlan?.valid_duration,
              'days'
            ),
          };
          postCircleWEGEvent(
            currentPatient,
            isRenew ? 'About to Expire' : 'Expired',
            'renewed',
            circlePlanValidity,
            true,
            screenName || 'Homepage',
            'Direct by HC'
          );
        }
      } else {
        Alert.alert('Apollo', `${res?.data?.CreateUserSubscription?.message}`);
      }
    } catch (error) {
      setLoading && setLoading(false);
      CommonBugFender('ConsultRoom_createUserCircleSubscription', error);
    }
  };

  const renderAddToCart = () => {
    return (
      <Button
        disabled={!defaultCirclePlan && !circlePlanSelected}
        title={
          buyNow && from !== string.banner_context.PHARMACY_HOME
            ? purchaseWithHC
              ? string.circleDoctors.upgradeWithHC.replace(
                  '{hc}',
                  circlePlanSelected?.currentSellingPrice
                )
              : !circlePlanSelected
              ? string.circleDoctors.upgrade
              : string.circleDoctors.upgradeWithPrice.replace(
                  '{price}',
                  circlePlanSelected?.currentSellingPrice
                )
            : !cartItems?.length
            ? !circlePlanSelected
              ? string.circleDoctors.upgrade
              : string.circleDoctors.upgradeWithPrice.replace(
                  '{price}',
                  circlePlanSelected?.currentSellingPrice
                )
            : string.circleDoctors.addToCart
        }
        style={[
          styles.buyNowBtn,
          {
            width: purchaseWithHC ? 230 : 212,
          },
        ]}
        onPress={() => {
          fireCircleBuyNowEvent();
          isConsultJourney &&
            circleWebEngageEventForAddToCart(
              WebEngageEventName.VC_NON_CIRCLE_ADDS_CART,
              circlePlanSelected
            );
          setDefaultCirclePlan && setDefaultCirclePlan(null);
          setIsCircleSubscription && setIsCircleSubscription(true);
          autoSelectDefaultPlan(membershipPlans);
          if (buyNow && from !== string.banner_context.PHARMACY_HOME) {
            if (purchaseWithHC) {
              closeModal && closeModal();
              onPurchasePlanThroughHC();
            } else {
              initiateCirclePurchase();
            }
          } else if (from === string.banner_context.PHARMACY_HOME) {
            if (!cartItems?.length) {
              initiateCirclePurchase();
            } else {
              setCircleMembershipCharges &&
                setCircleMembershipCharges(circlePlanSelected?.currentSellingPrice);
              setCircleSubPlanId && setCircleSubPlanId(circlePlanSelected?.subPlanId);
            }
          } else {
            closeModal && closeModal();
            setDefaultCirclePlan && setDefaultCirclePlan(null);
          }
          setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(false);
        }}
      />
    );
  };

  const autoSelectDefaultPlan = (plans: any) => {
    if (!circlePlanSelected) {
      const defaultPlan = plans?.filter((item: any) => item.defaultPack === true);
      if (defaultPlan?.length > 0) {
        setCirclePlanSelected && setCirclePlanSelected(defaultPlan[0]);
        AsyncStorage.setItem('circlePlanSelected', JSON.stringify(defaultPlan[0]));
        setCircleSubPlanId && setCircleSubPlanId(defaultPlan[0].subPlanId);
        setCircleMembershipCharges &&
          setCircleMembershipCharges(defaultPlan[0]?.currentSellingPrice);
      }
    }
  };

  const renderCircleFacts = () => {
    return (
      <View>
        <Text style={styles.circleFactText}>
          #CircleFact:{' '}
          <Text style={theme.viewStyles.text('R', 10, theme.colors.BORDER_BOTTOM_COLOR)}>
            On an average Circle members{'\n'}
          </Text>
          save upto ₹{circleStaticMonthlySavings} every month
        </Text>
      </View>
    );
  };
  const renderHeaderTitle = () => {
    return (
      <View style={styles.headerContiner}>
        <Text style={styles.headerText}>{string.circleDoctors.circleMembershipPlans}</Text>
      </View>
    );
  };

  const renderCarePlanAdded = () => {
    return (
      <View style={styles.planAddedContainer}>
        <View style={styles.spaceRow}>
          <View style={styles.rowCenter}>
            <CircleLogo style={styles.careLogo} />
            <Text style={{ ...theme.viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE) }}>
              Plan added to cart!
            </Text>
          </View>
          <View style={styles.rowCenter}>
            <Text
              style={{ ...theme.viewStyles.text('SB', 17, theme.colors.SEARCH_UNDERLINE_COLOR) }}
            >
              {string.common.Rs}
              {convertNumberToDecimal(circlePlanSelected?.currentSellingPrice)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={{ marginTop: 7 }}
          onPress={() => {
            fireCirclePlanRemovedEvent();
            setCirclePlanSelected && setCirclePlanSelected(null);
            setIsCircleSubscription && setIsCircleSubscription(false);
            setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(false);
            setCircleMembershipCharges && setCircleMembershipCharges(0);
            AsyncStorage.removeItem('circlePlanSelected');
          }}
        >
          <Text style={styles.removeTxt}>REMOVE</Text>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View style={isModal ? {} : [styles.careBannerView, props.style]}>
      {circlePlanSelected && !isModal && !autoCirlcePlanAdded && !spinning && !defaultCirclePlan
        ? renderCarePlanAdded()
        : renderSubscribeCareContainer()}
    </View>
  );
};

const styles = StyleSheet.create({
  careBannerView: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 10,
    marginHorizontal: 13,
    borderRadius: 5,
    marginBottom: 0,
    borderColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  careTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  getCareText: {
    ...theme.viewStyles.text('R', 12, theme.colors.LIGHT_BLUE),
    flexWrap: 'wrap',
    marginRight: 60,
  },
  subscriptionCard: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 80,
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 12,
  },
  optionButton: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    borderWidth: 2,
  },
  banner: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: theme.colors.APP_YELLOW,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 21,
    justifyContent: 'center',
  },
  bannerText: {
    ...theme.viewStyles.text('M', 10, '#FFFFFF'),
    paddingHorizontal: 8,
  },
  price: {
    ...theme.viewStyles.text('SB', 20, theme.colors.SEARCH_UNDERLINE_COLOR),
    alignSelf: 'center',
  },
  oldPrice: {
    ...theme.viewStyles.text('R', 14, theme.colors.BORDER_BOTTOM_COLOR),
    textDecorationLine: 'line-through',
  },
  limitedPriceBanner: {
    backgroundColor: theme.colors.BUTTON_BG,
    paddingHorizontal: 5,
    marginLeft: 8,
    borderRadius: 1,
    height: 16,
    justifyContent: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    marginTop: 17,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spaceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  careLogo: {
    width: 45,
    height: 27,
    marginRight: 3,
  },
  careLogoTextStyle: {
    textTransform: 'lowercase',
    ...theme.fonts.IBMPlexSansMedium(9.5),
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slashedPrice: {
    ...theme.viewStyles.text('R', 10, theme.colors.BORDER_BOTTOM_COLOR),
    textDecorationLine: 'line-through',
  },
  removeTxt: {
    ...theme.viewStyles.text('SB', 13, theme.colors.BORDER_BOTTOM_COLOR),
    textAlign: 'right',
  },
  circleLogo: {
    width: 45,
    height: 27,
    marginRight: 5,
  },
  box: {
    height: 100,
    width: 100,
    borderRadius: 5,
    marginVertical: 40,
    backgroundColor: '#61dafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  duration: {
    position: 'absolute',
    transform: [{ rotate: '-90deg' }],
    ...theme.viewStyles.text('M', 16, theme.colors.APP_YELLOW),
  },
  planContainer: {
    alignSelf: 'center',
  },
  radioBtn: {
    width: 24,
    height: 24,
    alignSelf: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  radioBtnIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    alignSelf: 'center',
  },
  savingsText: {
    ...theme.viewStyles.text('M', 8, theme.colors.SHERPA_BLUE),
    alignSelf: 'center',
    position: 'absolute',
  },
  knowMoreBtn: {
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  planAddedContainer: {
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  overlayStyle: {
    padding: 0,
    width: width - 36,
    height: 'auto',
    backgroundColor: 'transparent',
    elevation: 0,
    flex: 1,
    justifyContent: 'center',
  },
  closeIcon: {
    alignSelf: 'flex-end',
    backgroundColor: 'transparent',
    marginBottom: 16,
    position: 'absolute',
    top: -45,
  },
  crossIconStyle: {
    width: 28,
    height: 28,
  },
  headerContiner: {
    ...theme.viewStyles.cardViewStyle,
    justifyContent: 'center',
    height: 45,
    alignItems: 'center',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 10,
  },
  headerText: {
    ...theme.viewStyles.text('SB', 14, theme.colors.LIGHT_BLUE),
  },
  buyNowBtn: {
    marginTop: 2,
    width: 212,
    backgroundColor: theme.colors.APP_YELLOW_COLOR,
    alignSelf: 'center',
  },
  circleFactText: {
    ...theme.viewStyles.text('SB', 10, theme.colors.BORDER_BOTTOM_COLOR),
    flexWrap: 'wrap',
    textAlign: 'center',
    marginTop: 8,
  },
  tickIcon: {
    width: 16,
    height: 16,
    marginRight: 10,
  },
  circleDiscountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
  seperatorLine: {
    width: 0.5,
    height: 15,
    backgroundColor: theme.colors.BORDER_BOTTOM_COLOR,
  },
  bottomBtnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  blueTickIcon: {
    resizeMode: 'contain',
    width: 20,
    height: 20,
    marginRight: 8,
  },
  subscriptionContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingBottom: 20,
  },
});
