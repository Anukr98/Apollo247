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
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  InAppReviewEvent,
  firePaymentOrderStatusEvent,
} from '@aph/mobile-patients/src/components/PaymentGateway/Events';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { WebEngageEventName } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { firePurchaseEvent } from '@aph/mobile-patients/src/components/Tests/Events';

export interface PaymentStatusDiagProps extends NavigationScreenProps {}

export const PaymentStatusDiag: React.FC<PaymentStatusDiagProps> = (props) => {
  const paymentId = props.navigation.getParam('paymentId');
  const paymentStatus = props.navigation.getParam('paymentStatus');
  const amount = props.navigation.getParam('amount');
  const orderDetails = props.navigation.getParam('orderDetails');
  const defaultClevertapEventParams = props.navigation.getParam('defaultClevertapEventParams');
  const payload = props.navigation.getParam('payload');
  const eventAttributes = props.navigation.getParam('eventAttributes');
  const isCOD = props.navigation.getParam('isCOD');
  const modifiedOrderId = orderDetails?.orderId;
  const { orderInfo, fetching, PaymentMethod, subscriptionInfo } = useGetDiagOrderInfo(paymentId);
  const { apisToCall } = useAppCommonData();
  const displayId = orderInfo?.ordersList?.[0]?.displayId;
  const [modifiedOrders, setModifiedOrders] = useState<any>([]);
  const client = useApolloClient();
  const {
    isDiagnosticCircleSubscription,
    clearDiagnoticCartInfo,
    cartItems,
    modifyHcCharges,
  } = useDiagnosticsCart();
  const { setLoading, showAphAlert } = useUIElements();
  const orderCartSaving = orderDetails?.cartSaving!;
  const orderCircleSaving = orderDetails?.circleSaving!;
  const isCircleAddedToCart = props.navigation.getParam('isCircleAddedToCart');
  const circleSavings = isDiagnosticCircleSubscription ? Number(orderCircleSaving) : 0;
  const savings =
    isDiagnosticCircleSubscription || isCircleAddedToCart
      ? Number(orderCartSaving) + Number(orderCircleSaving)
      : orderCartSaving;
  const [showPassportModal, setShowPassportModal] = useState<boolean>(false);
  const [passportNo, setPassportNo] = useState<any>([]);
  const [passportData, setPassportData] = useState<any>([]);
  const { currentPatient } = useAllCurrentPatients();
  const { pharmacyUserTypeAttribute } = useAppCommonData();
  const { pharmacyCircleAttributes, circleSubscriptionId } = useShoppingCart();

  useEffect(() => {
    clearDiagnoticCartInfo?.();
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  useEffect(() => {
    const primaryOrderId = orderInfo?.ordersList?.[0]?.primaryOrderID;
    primaryOrderId && fetchOrdersDetails(primaryOrderId);
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
    postDiagCheckoutCompletedEvent();
    firePurchaseEvent(
      orderDetails?.orderId,
      orderDetails?.amount,
      cartItems,
      currentPatient,
      modifyHcCharges
    );
  };

  const postDiagCheckoutCompletedEvent = () => {
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
      const res = await client.query<getDiagnosticOrderDetails, getDiagnosticOrderDetailsVariables>(
        {
          query: GET_DIAGNOSTIC_ORDER_LIST_DETAILS,
          variables: { diagnosticOrderId: primaryOrderId },
          fetchPolicy: 'no-cache',
        }
      );
      if (!!res && res?.data && !res?.errors) {
        let getOrderDetailsResponse = res?.data?.getDiagnosticOrderDetails?.ordersList || [];
        setModifiedOrders(getOrderDetailsResponse);
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

  const renderPaymentStatus = () => {
    return (
      <PaymentStatus
        status={paymentStatus}
        amount={amount}
        orderInfo={orderInfo}
        savings={savings}
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
        orderInfo={orderInfo}
        modifiedOrders={modifiedOrders}
        modifiedOrderId={modifiedOrderId}
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

  return (
    <>
      {!fetching ? (
        <SafeAreaView style={styles.container}>
          <ScrollView>
            {renderPaymentStatus()}
            {renderPaymentInfo()}
            {renderCirclePurchase()}
            {renderAddPassportInfo()}
            {renderTestsInfo()}
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
});
