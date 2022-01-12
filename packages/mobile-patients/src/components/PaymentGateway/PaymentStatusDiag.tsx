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
  Text,
  TouchableOpacity,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { PaymentStatus } from '@aph/mobile-patients/src/components/PaymentGateway/Components/PaymentStatus';
import { PaymentInfo } from '@aph/mobile-patients/src/components/PaymentGateway/Components/PaymentInfo';
import { CirclePurchase } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CirclePurchase';
import { LabTestsInfo } from '@aph/mobile-patients/src/components/PaymentGateway/Components/LabTestsInfo';
import { AddPassportNo } from '@aph/mobile-patients/src/components/PaymentGateway/Components/AddPassportNo';
import { useGetDiagOrderInfo } from '@aph/mobile-patients/src/components/PaymentGateway/Hooks/useGetDiagOrderInfo';
import { TabBar } from '@aph/mobile-patients/src/components/PaymentGateway/Components/TabBar';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  goToConsultRoom,
  postWebEngageEvent,
  postCleverTapEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { apiCallEnums } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useApolloClient } from 'react-apollo-hooks';
import {
  getDiagnosticOrderDetails,
  getDiagnosticOrderDetailsVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrderDetails';
import {
  GET_DIAGNOSTIC_ORDER_LIST_DETAILS,
  UPDATE_PASSPORT_DETAILS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { PassportPaitentOverlay } from '@aph/mobile-patients/src/components/Tests/components/PassportPaitentOverlay';
import {
  updatePassportDetails,
  updatePassportDetailsVariables,
} from '@aph/mobile-patients/src/graphql/types/updatePassportDetails';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { sourceHeaders } from '@aph/mobile-patients/src/utils/commonUtils';
import InAppReview from 'react-native-in-app-review';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  InAppReviewEvent,
  firePaymentOrderStatusEvent,
} from '@aph/mobile-patients/src/components/PaymentGateway/Events';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { firePurchaseEvent } from '@aph/mobile-patients/src/components/Tests/Events';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { InfoIconRed } from '@aph/mobile-patients/src/components/ui/Icons';
import { WebEngageEventName } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';

export interface PaymentStatusDiagProps extends NavigationScreenProps {}

export const PaymentStatusDiag: React.FC<PaymentStatusDiagProps> = (props) => {
  const paymentId = props.navigation.getParam('paymentId');
  const paymentStatus = props.navigation.getParam('paymentStatus');
  const modifiedOrderDetails = props.navigation.getParam('isModify');
  const amount = props.navigation.getParam('amount');
  const orderDetails = props.navigation.getParam('orderDetails');
  const defaultClevertapEventParams = props.navigation.getParam('defaultClevertapEventParams');
  const payload = props.navigation.getParam('payload');
  const eventAttributes = props.navigation.getParam('eventAttributes');
  const isCOD = props.navigation.getParam('isCOD');
  const isCircleAddedToCart = props.navigation.getParam('isCircleAddedToCart');
  const {
    orderInfo,
    fetching,
    PaymentMethod,
    subscriptionInfo,
    isSingleUhid,
    offerAmount,
  } = useGetDiagOrderInfo(paymentId, modifiedOrderDetails);
  const { apisToCall } = useAppCommonData();
  const client = useApolloClient();
  const { buildApolloClient, authToken } = useAuth();
  const { currentPatient } = useAllCurrentPatients();
  const { pharmacyUserTypeAttribute } = useAppCommonData();
  const { pharmacyCircleAttributes, circleSubscriptionId } = useShoppingCart();
  const apolloClientWithAuth = buildApolloClient(authToken);
  const {
    isDiagnosticCircleSubscription,
    clearDiagnoticCartInfo,
    cartItems,
    modifyHcCharges,
    setIsDiagnosticCircleSubscription,
  } = useDiagnosticsCart();
  const { setLoading, showAphAlert } = useUIElements();

  const [modifiedOrders, setModifiedOrders] = useState<any>([]);
  const [showPassportModal, setShowPassportModal] = useState<boolean>(false);
  const [passportNo, setPassportNo] = useState<any>([]);
  const [passportData, setPassportData] = useState<any>([]);

  const orderCartSaving = orderDetails?.cartSaving!;
  const orderCircleSaving = orderDetails?.circleSaving!;
  const circleSavings = isDiagnosticCircleSubscription ? Number(orderCircleSaving) : 0;
  const savings =
    isDiagnosticCircleSubscription || isCircleAddedToCart
      ? Number(orderCartSaving) + Number(orderCircleSaving)
      : orderCartSaving;
  const modifiedOrderId = orderDetails?.orderId;
  const isModifyCod = modifiedOrderDetails && isCOD;
  const displayId = !!modifiedOrderDetails
    ? modifiedOrderDetails?.displayId
    : orderInfo?.ordersList?.map((item: any) => item?.displayId)?.join(', ');

  useEffect(() => {
    isCircleAddedToCart && setIsDiagnosticCircleSubscription?.(true);
    isModifyCod && fetchOrdersDetails(modifiedOrderDetails?.id);
    clearDiagnoticCartInfo?.();
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  useEffect(() => {
    if (!!isModifyCod) {
      return;
    } else {
      const primaryOrderId = orderInfo?.ordersList?.[0]?.primaryOrderID;
      primaryOrderId && fetchOrdersDetails(primaryOrderId);
    }
  }, [orderInfo]);

  const updatePassportDetails = async (data: any) => {
    try {
      setLoading?.(true);
      const res = await client.mutate<updatePassportDetails, updatePassportDetailsVariables>({
        mutation: UPDATE_PASSPORT_DETAILS,
        context: { sourceHeaders },
        variables: { passportDetailsInput: data },
      });
      setLoading?.(false);
      const errorMsg = res?.data?.updatePassportDetails?.[0]?.message;
      if (res?.data?.updatePassportDetails?.[0]?.status) {
        setPassportNo(data);
        setShowPassportModal(false);
      } else {
        errorMsg && throwError(errorMsg);
      }
    } catch (error) {
      setLoading?.(false);
      throwError();
    }
  };

  const throwError = (msg?: any) => {
    showAphAlert?.({
      title: string.common.uhOh,
      description: msg ? msg : 'Something went wrong',
    });
  };

  const handleBack = () => {
    moveToHome();
    return true;
  };

  useEffect(() => {
    !fetching && fireEvents();
  }, [fetching]);

  const fireEvents = () => {
    requestInAppReview();
    firePaymentOrderStatusEvent('success', payload, defaultClevertapEventParams);
    if (modifiedOrderDetails == null) {
      postwebEngageCheckoutCompletedEvent();
    }
    firePurchaseEvent(
      orderDetails?.orderId,
      orderDetails?.amount,
      cartItems,
      currentPatient,
      modifyHcCharges
    );
  };

  const postwebEngageCheckoutCompletedEvent = () => {
    try {
      let attributes = {
        ...eventAttributes,
        'Payment Mode': isCOD ? 'Cash' : 'Prepaid',
        'Circle discount': circleSubscriptionId && orderCircleSaving ? orderCircleSaving : 0,
        'Circle user': isDiagnosticCircleSubscription || isCircleAddedToCart ? 'Yes' : 'No',
      };
      postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_CHECKOUT_COMPLETED, attributes);
      postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_ORDER_PLACED, attributes);
    } catch (error) {}
  };

  const requestInAppReview = async () => {
    try {
      const { diagnosticDate } = orderDetails;
      let givenDate = new Date(diagnosticDate);
      var diff = (givenDate.getTime() - givenDate.getTime()) / 1000;
      diff /= 60 * 60;
      if (diff <= 48 && InAppReview.isAvailable()) {
        const onfulfilled = await InAppReview.RequestInAppReview();
        if (!!onfulfilled) {
          InAppReviewEvent(currentPatient, pharmacyUserTypeAttribute, pharmacyCircleAttributes);
        }
      }
    } catch (error) {}
  };

  const onPressCopy = () => {
    Clipboard.setString(paymentId);
    Platform.OS === 'android' && ToastAndroid.show('Copied', ToastAndroid.SHORT);
  };

  const moveToHome = () => {
    // use apiCallsEnum values here in order to make that api call in home screen
    apisToCall.current = [
      apiCallEnums.circleSavings,
      apiCallEnums.getAllBanners,
      apiCallEnums.plansCashback,
      apiCallEnums.getUserSubscriptions,
    ];
    goToConsultRoom(props.navigation);
  };

  const moveToMyOrders = () => {
    props.navigation.push(AppRoutes.YourOrdersTest, {
      source: AppRoutes.PaymentStatusDiag,
    });
  };

  const fetchOrdersDetails = async (primaryOrderId: any) => {
    try {
      const res = await apolloClientWithAuth.query<
        getDiagnosticOrderDetails,
        getDiagnosticOrderDetailsVariables
      >({
        query: GET_DIAGNOSTIC_ORDER_LIST_DETAILS,
        variables: { diagnosticOrderId: primaryOrderId },
        fetchPolicy: 'no-cache',
      });
      if (!!res && res?.data && !res?.errors) {
        let getOrderDetailsResponse = res?.data?.getDiagnosticOrderDetails?.ordersList || [];
        setModifiedOrders([getOrderDetailsResponse]);
      } else {
        setModifiedOrders([]);
      }
    } catch (error) {}
  };

  const onPressViewBenefits = () => {
    props.navigation.navigate(AppRoutes.MembershipDetails, {
      membershipType: 'CIRCLE PLAN',
      isActive: true,
      circleEventSource: 'Cart(Diagnostic)',
    });
  };

  const navigateToOrderDetails = (showOrderSummaryTab: boolean, orderId: string) => {
    setLoading?.(false);
    apisToCall.current = [apiCallEnums.circleSavings];
    props.navigation.popToTop({ immediate: true });
    props.navigation.push(AppRoutes.TestOrderDetails, {
      orderId: !!modifiedOrderDetails ? modifiedOrderDetails?.id : orderId,
      setOrders: null,
      selectedOrder: null,
      refundStatusArr: [],
      goToHomeOnBack: true,
      comingFrom: AppRoutes.CartPage,
      showOrderSummaryTab: false,
      disableTrackOrder: false,
      amount: orderDetails?.amount,
    });
  };

  const renderPaymentStatus = () => {
    const toPayAmount = (!!orderDetails?.amount ? orderDetails?.amount : amount) - offerAmount;
    //showed only circle savings
    return (
      <PaymentStatus
        status={paymentStatus}
        amount={toPayAmount}
        orderInfo={orderInfo}
        savings={circleSavings}
        PaymentMethod={PaymentMethod}
      />
    );
  };

  const renderPaymentInfo = () => {
    return <PaymentInfo orderIds={displayId} paymentId={paymentId} onPressCopy={onPressCopy} />;
  };

  const renderCirclePurchase = () => {
    return (
      <CirclePurchase
        subscriptionInfo={subscriptionInfo}
        circleSavings={savings}
        onPressBenefits={onPressViewBenefits}
      />
    );
  };

  const renderAddPassportInfo = () => {
    return (
      <AddPassportNo
        passportNo={passportNo}
        onPressAdd={() => setShowPassportModal(true)}
        ordersList={orderInfo?.ordersList}
      />
    );
  };

  const renderTestsInfo = () => {
    return (
      <LabTestsInfo
        orderInfo={!!modifiedOrderDetails ? modifiedOrders : orderInfo}
        modifiedOrders={modifiedOrders}
        modifiedOrderId={modifiedOrderId}
        isModify={!!modifiedOrderDetails}
      />
    );
  };

  const renderTabBar = () => {
    return <TabBar onPressGoToHome={moveToHome} onPressGoToMyOrders={moveToMyOrders} />;
  };

  const renderPassportPaitentView = () => {
    return showPassportModal ? (
      <PassportPaitentOverlay
        patientArray={orderInfo?.ordersList}
        onPressClose={() => setShowPassportModal(false)}
        onPressDone={(response: any) => {
          updatePassportDetails(response);
          setShowPassportModal(false);
        }}
        onChange={(res) => {
          const newData: any[] = [];
          res.map((item: any) => {
            if (item?.passportNo?.length) {
              newData.push(item?.passportNo);
            }
          });
          setPassportData(newData);
        }}
        disableButton={!passportData?.length}
      />
    ) : null;
  };

  const renderNoticeText = () => {
    return (
      <View style={styles.noticeText}>
        <Text style={styles.phleboText}>{string.diagnostics.orderSuccessPhaleboText}</Text>
      </View>
    );
  };

  const renderInvoiceTimeline = () => {
    return (
      <View style={styles.noticeText}>
        <View style={styles.cancel_container}>
          <InfoIconRed />
          <Text style={styles.cancel_text}>{string.diagnostics.invoiceTimelineText}</Text>
        </View>
      </View>
    );
  };

  const renderOrderSummary = () => {
    return (
      <View style={styles.orderSummaryView}>
        <TouchableOpacity
          style={styles.orderSummaryTouch}
          onPress={() => navigateToOrderDetails(true, orderDetails?.orderId!)}
        >
          <Text style={styles.orderSummary}>VIEW ORDER SUMMARY</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      {!fetching ? (
        <SafeAreaView style={styles.container}>
          <ScrollView>
            {renderPaymentStatus()}
            {renderPaymentInfo()}
            {renderCirclePurchase()}
            {renderAddPassportInfo()}
            {renderNoticeText()}
            {renderTestsInfo()}
            {isSingleUhid ? renderOrderSummary() : null}
            {renderInvoiceTimeline()}
          </ScrollView>
          {renderPassportPaitentView()}
          {renderTabBar()}
        </SafeAreaView>
      ) : (
        <Spinner />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  phleboText: { ...theme.fonts.IBMPlexSansRegular(12), lineHeight: 18, color: '#FF748E' },
  noticeText: { marginLeft: 16, marginRight: 16, marginBottom: 16 },
  cancel_container: {
    width: '98%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderRadius: 10,
    backgroundColor: theme.colors.TEST_CARD_BUTTOM_BG,
    padding: 10,
    alignSelf: 'center',
    marginVertical: 10,
    elevation: 2,
    shadowColor: theme.colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  cancel_text: {
    ...theme.viewStyles.text('M', 12, '#01475b', 0.6, 18),
    width: '90%',
    marginHorizontal: 10,
  },
  orderSummaryView: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    marginTop: 16,
  },
  orderSummaryTouch: {
    height: '100%',
    width: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderSummary: {
    ...theme.fonts.IBMPlexSansBold(14),
    lineHeight: 19,
    color: '#FC9916',
  },
});
