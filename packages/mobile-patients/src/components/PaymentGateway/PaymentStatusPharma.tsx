import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  BackHandler,
  Platform,
  ToastAndroid,
  Clipboard,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { PaymentStatus } from '@aph/mobile-patients/src/components/PaymentGateway/Components/PaymentStatus';
import { PaymentInfo } from '@aph/mobile-patients/src/components/PaymentGateway/Components/PaymentInfo';
import { OrderInfo } from '@aph/mobile-patients/src/components/PaymentGateway/Components/OrderInfo';
import { useGetPharmaOrderInfo } from './Hooks/useGetPharmaOrderInfo';
import { TabBar } from '@aph/mobile-patients/src/components/PaymentGateway/Components/TabBar';
import { SubstituteNotice } from '@aph/mobile-patients/src/components/PaymentGateway/Components/SubstituteNotice';
import { FreeConsult } from '@aph/mobile-patients/src/components/PaymentGateway/Components/FreeConsult';
import {
  UPDATE_MEDICINE_ORDER_SUBSTITUTION,
  GET_PHARMA_TRANSACTION_STATUS_V2,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  updateMedicineOrderSubstitution,
  updateMedicineOrderSubstitutionVariables,
} from '@aph/mobile-patients/src/graphql/types/updateMedicineOrderSubstitution';
import { useApolloClient } from 'react-apollo-hooks';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  goToConsultRoom,
  postCleverTapEvent,
  clearStackAndNavigate,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { apiCallEnums } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import AsyncStorage from '@react-native-community/async-storage';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import InAppReview from 'react-native-in-app-review';
import {
  InAppReviewEventPharma,
  firePaymentOrderStatusEvent,
  firePaymentStatusPageViewedEvent,
  fireSubstituteResponseEvent,
  fireCirclePlanActivatedEvent,
} from '@aph/mobile-patients/src/components/PaymentGateway/Events';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';

export interface PaymentStatusPharmaProps extends NavigationScreenProps {}

export const PaymentStatusPharma: React.FC<PaymentStatusPharmaProps> = (props) => {
  const paymentId = props.navigation.getParam('paymentId');
  const paymentStatus = props.navigation.getParam('paymentStatus');
  const amount = props.navigation.getParam('amount');
  const { orders } = props.navigation.getParam('orderDetails');
  const orderIds = orders?.map(
    (item: any, index: number) => item?.orderAutoId + (index != orders?.length - 1 && ', ')
  );
  // const { orderInfo, fetching } = useGetPharmaOrderInfo(paymentId);
  const { setLoading } = useUIElements();
  const [fetching, setFetching] = useState<boolean>(true);
  const [orderInfo, setOrderInfo] = useState<any>();
  const client = useApolloClient();
  const {
    clearCartInfo,
    setCircleMembershipCharges,
    setIsCircleSubscription,
    pharmacyCircleAttributes,
    serverCartItems,
    grandTotal,
    deliveryCharges,
    circleSubscriptionId,
    isCircleSubscription,
    circlePlanSelected,
    consultProfile,
  } = useShoppingCart();
  const { fetchServerCart } = useServerCart();
  const isSplitCart: boolean = orders?.length > 1 ? true : false;
  const { currentPatient } = useAllCurrentPatients();
  const { apisToCall, setSelectedPrescriptionType, pharmacyUserTypeAttribute } = useAppCommonData();
  const savings = orderInfo?.planPurchaseDetails?.totalCashBack;
  const defaultClevertapEventParams = props.navigation.getParam('defaultClevertapEventParams');
  const payload = props.navigation.getParam('payload');
  const cleverTapCheckoutEventAttributes = props.navigation.getParam(
    'cleverTapCheckoutEventAttributes'
  );
  useEffect(() => {
    initiate();
    clearCart();
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  useEffect(() => {
    !fetching && fireEvents();
  }, [fetching]);

  const fetchOrderInfo = () => {
    return client.query({
      query: GET_PHARMA_TRANSACTION_STATUS_V2,
      variables: { paymentOrderId: paymentId },
      fetchPolicy: 'no-cache',
    });
  };

  const initiate = async () => {
    try {
      setLoading?.(true);
      const res = await fetchOrderInfo();
      const { data } = res;
      setLoading?.(false);
      setOrderInfo(data?.pharmaPaymentStatusV2);
      setFetching(false);
    } catch (error) {}
  };

  const handleBack = () => {
    moveToHome();
    return true;
  };

  const fireEvents = () => {
    requestInAppReview();
    firePaymentOrderStatusEvent('success', payload, defaultClevertapEventParams);
    // removing because of duplicate event trigger
    // fireCleverTapOrderSuccessEvent();
    firePaymentStatusPageViewedEvent(
      paymentStatus,
      paymentId,
      payload?.payload?.action,
      orderIds,
      grandTotal,
      savings,
      deliveryCharges,
      circleSubscriptionId,
      isCircleSubscription,
      orderInfo?.substitutionMessage
    );
    fireCirclePlanActivatedEvent(
      currentPatient,
      orderInfo?.planPurchaseDetails?.planPurchased,
      circlePlanSelected
    );
    fetchServerCart();
  };

  const clearCart = () => {
    clearCartInfo?.();
    AsyncStorage.removeItem('circlePlanSelected');
    setCircleMembershipCharges && setCircleMembershipCharges(0);
    setIsCircleSubscription && setIsCircleSubscription(false);
  };

  const requestInAppReview = async () => {
    try {
      const { shipments } = orderInfo?.medicineOrderInput;
      const userAttributes = pharmacyUserTypeAttribute;
      let tatHours = shipments?.[0].tatHours?.split('')[0];
      if (tatHours <= 5 && InAppReview.isAvailable()) {
        const onfulfilled = await InAppReview.RequestInAppReview();
        if (!!onfulfilled) {
          InAppReviewEventPharma(currentPatient, userAttributes, pharmacyCircleAttributes);
        }
      }
    } catch (error) {}
  };

  // const fireCleverTapOrderSuccessEvent = () => {
  //   postCleverTapEvent(CleverTapEventName.PHARMACY_CHECKOUT_COMPLETED, {
  //     ...cleverTapCheckoutEventAttributes,
  //     'Cart items': serverCartItems?.length,
  //   });
  // };

  const onPressCopy = () => {
    Clipboard.setString(paymentId);
    Platform.OS === 'android' && ToastAndroid.show('Copied', ToastAndroid.SHORT);
  };

  const updateReceiveSubstitueStatus = async (status: string) => {
    fireSubstituteResponseEvent(status, paymentId, orderIds);
    const paymentInfo: updateMedicineOrderSubstitutionVariables = {
      transactionId: paymentId,
      orderId: paymentId || isSplitCart ? null : orderIds?.[0],
      substitution: status,
    };
    const res = await client.mutate<
      updateMedicineOrderSubstitution,
      updateMedicineOrderSubstitutionVariables
    >({
      mutation: UPDATE_MEDICINE_ORDER_SUBSTITUTION,
      variables: paymentInfo,
    });
    if (res?.data?.updateMedicineOrderSubstitution?.message === 'success') {
    }
  };

  const moveToHome = () => {
    apisToCall.current = [
      apiCallEnums.circleSavings,
      apiCallEnums.getAllBanners,
      apiCallEnums.getUserSubscriptions,
      apiCallEnums.getUserSubscriptionsV2,
      apiCallEnums.oneApollo,
      apiCallEnums.pharmacyUserType,
      apiCallEnums.getPlans,
      apiCallEnums.plansCashback,
    ];
    goToConsultRoom(props.navigation);
    // clearing free consult option selected
    setSelectedPrescriptionType && setSelectedPrescriptionType('');
  };

  const onPressGoToMyOrders = () => {
    clearStackAndNavigate(props.navigation, AppRoutes.YourOrdersScene);
  };

  const renderSubstituteNotice = () => {
    return (
      <SubstituteNotice
        orderInfo={orderInfo}
        onPressAccept={() => updateReceiveSubstitueStatus('OK')}
        onPressReject={() => updateReceiveSubstitueStatus('not-OK')}
      />
    );
  };
  const renderPaymentStatus = () => {
    return (
      <PaymentStatus
        status={paymentStatus}
        amount={amount}
        orderInfo={orderInfo}
        savings={savings}
      />
    );
  };

  const renderPaymentInfo = () => {
    return <PaymentInfo orderIds={orderIds} paymentId={paymentId} onPressCopy={onPressCopy} />;
  };

  const renderOrderInfo = () => {
    return (
      <OrderInfo orderDateTime={orderInfo?.paymentDateTime} paymentMode={orderInfo?.paymentMode} />
    );
  };

  const renderFreeConsultCard = () => {
    return <FreeConsult name={consultProfile?.firstName || currentPatient?.firstName} />;
  };

  const renderTabBar = () => {
    return <TabBar onPressGoToHome={moveToHome} onPressGoToMyOrders={onPressGoToMyOrders} />;
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView>
          {renderSubstituteNotice()}
          {renderPaymentStatus()}
          {renderPaymentInfo()}
          {renderFreeConsultCard()}
          {renderOrderInfo()}
        </ScrollView>
        {renderTabBar()}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
