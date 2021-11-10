import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  BackHandler,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { NavigationScreenProps } from 'react-navigation';
import { CircleTotalBill } from '@aph/mobile-patients/src/components/ui/CircleTotalBill';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  CircleEventSource,
  g,
  getCircleNoSubscriptionText,
  getUserType,
  navigateToHome,
  postCleverTapEvent,
  goToConsultRoom,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { Coupon } from '@aph/mobile-patients/src/components/MedicineCart/Components/Coupon';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { BottomButton } from '@aph/mobile-patients/src/components/CirclePlan/Components/BottomButton';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  one_apollo_store_code,
  PaymentStatus,
  OrderCreate,
  OrderVerticals,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useApolloClient } from 'react-apollo-hooks';
import {
  CreateUserSubscription,
  CreateUserSubscriptionVariables,
} from '@aph/mobile-patients/src/graphql/types/CreateUserSubscription';
import {
  GET_PLAN_DETAILS_BY_PLAN_ID,
  CREATE_USER_SUBSCRIPTION,
  CREATE_INTERNAL_ORDER,
  CREATE_ORDER,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  createOrderInternal,
  createOrderInternalVariables,
} from '@aph/mobile-patients/src/graphql/types/createOrderInternal';
import { useGetJuspayId } from '@aph/mobile-patients/src/hooks/useGetJuspayId';
import {
  initiateSDK,
  createHyperServiceObject,
  terminateSDK,
} from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { Decimal } from 'decimal.js';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { Spinner } from '../ui/Spinner';
import string from '@aph/mobile-patients/src/strings/strings.json';

interface SubscriptionCartProps extends NavigationScreenProps {
  action?: string;
  selectedPlan?: any;
  from?: string;
  screenName?: string;
  circleEventSource?: CircleEventSource;
}
export const SubscriptionCart: React.FC<SubscriptionCartProps> = (props) => {
  const action = props.navigation.getParam('action');
  const screenName = props.navigation.getParam('screenName');
  const selectedPlan = props.navigation.getParam('selectedPlan');
  const circleEventSource = props.navigation.getParam('circleEventSource');
  const {
    circlePlanSelected,
    setSubscriptionCoupon,
    defaultCirclePlan,
    subscriptionCoupon,
    circlePlanValidity,
  } = useShoppingCart();
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const { setLoading } = useUIElements();
  const planId = AppConfig.Configuration.CIRCLE_PLAN_ID;
  const storeCode =
    Platform.OS === 'ios' ? one_apollo_store_code.IOSCUS : one_apollo_store_code.ANDCUS;
  const client = useApolloClient();
  const { cusId, isfetchingId } = useGetJuspayId();
  const [hyperSdkInitialized, setHyperSdkInitialized] = useState<boolean>(false);
  const planSellingPrice = defaultCirclePlan
    ? defaultCirclePlan?.currentSellingPrice
    : circlePlanSelected?.currentSellingPrice;
  const amountToPay = subscriptionCoupon?.discount
    ? Number(Decimal.sub(planSellingPrice, Number(subscriptionCoupon?.discount)))
    : planSellingPrice;
  const { showAphAlert, hideAphAlert } = useUIElements();

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  useEffect(() => {
    !isfetchingId ? (cusId ? initiateHyperSDK(cusId) : initiateHyperSDK(currentPatient?.id)) : null;
  }, [isfetchingId]);

  const initiateHyperSDK = async (cusId: any) => {
    try {
      const merchantId = AppConfig.Configuration.merchantId;
      terminateSDK();
      createHyperServiceObject();
      initiateSDK(cusId, cusId, merchantId);
      setHyperSdkInitialized(true);
    } catch (error) {
      CommonBugFender('ErrorWhileInitiatingHyperSDK', error);
    }
  };

  const fireCirclePaymentPageViewedEvent = () => {
    const circleData = circlePlanSelected || selectedPlan;
    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.CIRCLE_PAYMENT_PAGE_VIEWED_STANDALONE_CIRCLE_PURCHASE_PAGE] = {
      navigation_source: circleEventSource,
      circle_end_date: circlePlanValidity?.endDate
        ? circlePlanValidity?.endDate
        : getCircleNoSubscriptionText(),
      circle_start_date: circlePlanValidity?.startDate
        ? circlePlanValidity?.startDate
        : getCircleNoSubscriptionText(),
      plan_id: circleData?.subPlanId,
      customer_id: currentPatient?.id,
      duration_in_months: circleData?.durationInMonth,
      user_type: getUserType(allCurrentPatients),
      price: circleData?.currentSellingPrice,
    };
    postCleverTapEvent(CleverTapEventName.CIRCLE_PLAN_TO_CART, cleverTapEventAttributes);
    setTimeout(() => {
      postCleverTapEvent(
        CleverTapEventName.CIRCLE_PAYMENT_PAGE_VIEWED_STANDALONE_CIRCLE_PURCHASE_PAGE,
        cleverTapEventAttributes
      );
    }, 1000);
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
    };
    return client.mutate<createOrderInternal, createOrderInternalVariables>({
      mutation: CREATE_INTERNAL_ORDER,
      variables: { order: orderInput },
    });
  };

  const createJusPayOrder = (paymentId: string) => {
    const orderInput = {
      payment_order_id: paymentId,
      health_credits_used: 0,
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
    const purchaseInput = subscriptionCoupon
      ? {
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
              coupon_used_details: {
                discount_amount: subscriptionCoupon?.discount || 0,
                bill_amount: subscriptionCoupon?.billAmount || planSellingPrice,
                coupon_code: subscriptionCoupon?.coupon || '',
              },
            },
            transaction_date_time: new Date().toISOString(),
          },
        }
      : {
          userSubscription: {
            mobile_number: currentPatient?.mobileNumber,
            plan_id: planId,
            sub_plan_id: defaultCirclePlan
              ? defaultCirclePlan?.subPlanId
              : circlePlanSelected?.subPlanId,
            storeCode,
            FirstName: currentPatient?.firstName,
            LastName: currentPatient?.lastName,
            transaction_date_time: new Date().toISOString(),
          },
        };

    return client.mutate<CreateUserSubscription, CreateUserSubscriptionVariables>({
      mutation: CREATE_USER_SUBSCRIPTION,
      variables: purchaseInput,
      fetchPolicy: 'no-cache',
    });
  };

  const renderErrorPopup = () => {
    setLoading?.(false);
    showAphAlert!({
      title: 'Uh oh! :(',
      description: string.genericError,
    });
  };

  const initiateCirclePurchase = async () => {
    try {
      setLoading?.(true);
      const response = await createUserSubscription();
      const subscriptionId = g(response, 'data', 'CreateUserSubscription', 'response', '_id');
      const data = await createOrderInternal(subscriptionId!);
      const orderInfo = {
        orderId: subscriptionId,
        circleParams: {
          circleActivated: true,
          circlePlanValidity: g(response, 'data', 'CreateUserSubscription', 'response', 'end_date'),
        },
      };
      setLoading?.(false);
      if (data?.data?.createOrderInternal?.success) {
        if (amountToPay == 0) {
          const res = await createJusPayOrder(data?.data?.createOrderInternal?.payment_order_id!);
          setLoading!(false);
          if (res?.data?.createOrderV2?.payment_status == 'TXN_SUCCESS') {
            goToConsultRoom(props.navigation, orderInfo?.circleParams);
          } else {
            renderErrorPopup();
          }
        } else {
          fireCirclePaymentPageViewedEvent();
          props.navigation.navigate(AppRoutes.PaymentMethods, {
            paymentId: data?.data?.createOrderInternal?.payment_order_id!,
            amount: amountToPay,
            orderDetails: orderInfo,
            businessLine: 'subscription',
            customerId: cusId,
          });
          setLoading!(false);
        }
      }
    } catch (error) {
      setLoading?.(false);
      renderErrorPopup();
      CommonBugFender('Circle_Purchase_Initiation_Failed', error);
    }
  };

  const handleBack = () => {
    setSubscriptionCoupon?.(null);
    if (action === 'PAY') {
      navigateToHome(props.navigation);
    } else {
      props.navigation.goBack();
    }
    return true;
  };

  const renderHeader = () => {
    return (
      <Header
        container={styles.headerContainerStyle}
        leftIcon={'backArrow'}
        title={'REVIEW ORDER'}
        onPressLeftIcon={() => handleBack()}
      />
    );
  };

  const renderCircleBill = () => <CircleTotalBill selectedPlan={selectedPlan} />;

  const onApplyCouponClick = () => {
    props.navigation.navigate(AppRoutes.ViewCoupons, { movedFrom: 'subscription' });
  };

  const renderCouponSection = () => (
    <Coupon
      onPressApplyCoupon={() => onApplyCouponClick()}
      onPressRemove={() => {
        setSubscriptionCoupon?.(null);
      }}
      movedFrom={'subscription'}
    />
  );

  const renderBottomButton = () => {
    return (
      <BottomButton
        onButtonPress={() => {
          initiateCirclePurchase();
        }}
        buttonText={`PROCEED TO PAY`}
      />
    );
  };

  return (
    <View style={theme.viewStyles.container}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        <ScrollView>
          {renderCircleBill()}
          {renderCouponSection()}
        </ScrollView>
        {renderBottomButton()}
        {!hyperSdkInitialized && <Spinner />}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainerStyle: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
});
