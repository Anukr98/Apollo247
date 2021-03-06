import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  BackHandler,
  Platform,
  ToastAndroid,
  Clipboard,
  View,
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
  GET_REVIEW_POPUP_PERMISSION,
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
import LottieView from 'lottie-react-native';
const paymentSuccess =
  '@aph/mobile-patients/src/components/PaymentGateway/AnimationFiles/Animation_2/tick.json';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';
import moment from 'moment';
import { Snackbar } from 'react-native-paper';

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
  const cartTat = props.navigation.getParam('cartTat');
  const isCOD = props.navigation.getParam('isCOD');
  const noAnimation = isCOD && Platform.OS == 'ios';
  const [showSubstituteNotice, setShowSubstituteNotice] = useState<boolean>(false);
  const [showSubstituteConfirmation, setShowSubstituteConfirmation] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => setAnimationfinished(true), 2700);
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
      const res = await fetchOrderInfo();
      const { data } = res;
      setOrderInfo(data?.pharmaPaymentStatusV2);
      setShowSubstituteNotice(data?.pharmaPaymentStatusV2?.isSubstitution);
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
      const diff = moment.duration(moment(cartTat).diff(moment())).asHours();
      const orders = props.navigation.getParam('orderDetails')?.orders;
      const popupConfig = {
        vertical: 'pharma',
        delivery_tat_hours: diff.toString(),
        order_type: orders?.length === 1 ? 'plain' : 'split',
      };
      // const permission = await client.query({
      //   query: GET_REVIEW_POPUP_PERMISSION,
      //   variables: {
      //     popupConfig,
      //   },
      //   fetchPolicy: 'no-cache',
      // });
      if (diff <= 5 && InAppReview.isAvailable()) {
        await InAppReview.RequestInAppReview().then((hasFlowFinishedSuccessfully) => {
          if (hasFlowFinishedSuccessfully)
            InAppReviewEventPharma(
              currentPatient,
              pharmacyUserTypeAttribute,
              pharmacyCircleAttributes
            );
        });
      }
    } catch (error) {}
  };

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
    return showSubstituteNotice ? (
      <SubstituteNotice
        orderInfo={orderInfo}
        onPressAccept={() => {
          setShowSubstituteConfirmation(true);
          setShowSubstituteNotice(false);
          updateReceiveSubstitueStatus('OK');
        }}
        onPressReject={() => {
          setShowSubstituteConfirmation(true);
          setShowSubstituteNotice(false);
          updateReceiveSubstitueStatus('not-OK');
        }}
      />
    ) : null;
  };
  const renderSubstituteSnackBar = () => {
    return (
      <Snackbar
        style={styles.snackbarStyle}
        visible={showSubstituteConfirmation}
        onDismiss={() => {
          setShowSubstituteConfirmation(false);
        }}
        duration={3000}
      >
        Response Received.
      </Snackbar>
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
      <OrderInfo
        orderDateTime={orderInfo?.paymentDateTime}
        paymentMode={isCOD ? 'COD' : orderInfo?.paymentMethod}
      />
    );
  };

  const renderFreeConsultCard = () => {
    return <FreeConsult name={consultProfile?.firstName || currentPatient?.firstName} />;
  };

  const renderTabBar = () => {
    return <TabBar onPressGoToHome={moveToHome} onPressGoToMyOrders={onPressGoToMyOrders} />;
  };

  const [animationfinished, setAnimationfinished] = useState<boolean>(noAnimation ? true : false);

  const renderSucccessAnimation = () => {
    return (
      <View style={{ alignItems: 'center' }}>
        <LottieView
          source={require(paymentSuccess)}
          onAnimationFinish={() => setAnimationfinished(true)}
          autoPlay
          loop={false}
          autoSize={true}
          style={{ width: 225, marginBottom: 40 }}
          imageAssetsFolder={'lottie/animation_2/images'}
        />
      </View>
    );
  };

  return (
    <>
      {animationfinished ? (
        <SafeAreaView style={styles.container}>
          <ScrollView>
            {renderSubstituteNotice()}
            {renderPaymentStatus()}
            {renderPaymentInfo()}
            {renderFreeConsultCard()}
            {renderOrderInfo()}
            {renderSubstituteSnackBar()}
          </ScrollView>
          {renderTabBar()}
        </SafeAreaView>
      ) : (
        renderSucccessAnimation()
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  snackbarStyle: {
    position: 'absolute',
    zIndex: 1001,
    backgroundColor: theme.colors.GRAY,
  },
});
