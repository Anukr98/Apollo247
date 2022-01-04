import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  BackHandler,
  Platform,
  ToastAndroid,
  Clipboard,
  ImageBackground,
  Dimensions,
  Text,
  TouchableOpacity,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { PaymentFailedIcon, Copy } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  bookAppointment,
  bookAppointmentVariables,
  bookAppointment_bookAppointment_appointment,
} from '@aph/mobile-patients/src/graphql/types/bookAppointment';
import {
  BOOK_APPOINTMENT,
  BOOK_APPOINTMENT_WITH_SUBSCRIPTION,
  CREATE_ORDER,
  CREATE_USER_SUBSCRIPTION,
  CREATE_INTERNAL_ORDER,
  UPDATE_ORDER,
  CANCEL_PAYMENT,
} from '@aph/mobile-patients/src/graphql/profiles';
import { useApolloClient } from 'react-apollo-hooks';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  one_apollo_store_code,
  PaymentStatus,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { g, isEmptyObject, navigateToHome } from '@aph/mobile-patients/src/helpers/helperFunctions';
import AsyncStorage from '@react-native-community/async-storage';
import {
  BookAppointmentInput,
  DoctorType,
  PLAN,
  OrderCreate,
  OrderVerticals,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  createOrderInternal,
  createOrderInternalVariables,
} from '@aph/mobile-patients/src/graphql/types/createOrderInternal';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useGetJuspayId } from '@aph/mobile-patients/src/hooks/useGetJuspayId';
import {
  CreateUserSubscription,
  CreateUserSubscriptionVariables,
} from '@aph/mobile-patients/src/graphql/types/CreateUserSubscription';
import {
  DiagnosticPatientCartItem,
  DiagnosticsCartItem,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  saveModifyOrder,
  diagnosticSaveBookHcCollectionV2,
} from '@aph/mobile-patients/src/helpers/clientCalls';
const windowWidth = Dimensions.get('window').width;

enum BOOKING_TYPE {
  SAVE = 'saveOrder',
  MODIFY = 'modifyOrder',
}

export interface PaymentFailedProps extends NavigationScreenProps {}

export const PaymentFailed: React.FC<PaymentFailedProps> = (props) => {
  const paymentId = props.navigation.getParam('paymentId');
  const orderDetails = props.navigation.getParam('orderDetails');
  const { orders } = orderDetails;
  const orderIds = orders?.map(
    (item: any, index: number) => item?.orderAutoId + (index != orders?.length - 1 && ', ')
  );
  const businessLine = props.navigation.getParam('businessLine');
  const amount = props.navigation.getParam('amount');
  const client = useApolloClient();
  const { circleSubscriptionId, circlePlanSelected, hdfcSubscriptionId } = useShoppingCart();
  const { currentPatient, allCurrentPatients, setCurrentPatientId } = useAllCurrentPatients();
  const storeCode =
    Platform.OS === 'ios' ? one_apollo_store_code.IOSCUS : one_apollo_store_code.ANDCUS;
  const planId = AppConfig.Configuration.CIRCLE_PLAN_ID;
  const { showAphAlert, setLoading } = useUIElements();
  const { setauthToken } = useAppCommonData();
  const { cusId } = useGetJuspayId();
  const {
    selectedCirclePlan,
    modifiedOrder,
    grandTotal,
    isCircleAddedToCart,
  } = useDiagnosticsCart();
  const isModifyFlow = !!modifiedOrder && !isEmptyObject(modifiedOrder);
  const circlePlanPurchasePrice = selectedCirclePlan?.currentSellingPrice;
  const toPayPrice = isCircleAddedToCart
    ? Number(grandTotal) + Number(circlePlanPurchasePrice)
    : grandTotal;
  const [cancelledOldPayment, setcancelledOldPayment] = useState<boolean>(false);
  const showCODonDiag = AppConfig.Configuration.Show_COD_While_Retrying_Diag_Payment;
  const showCODonPharma = AppConfig.Configuration.Show_COD_While_Retrying_Pharma_Payment;

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const handleBack = () => {
    navigateToHome(props.navigation);
    return true;
  };

  useEffect(() => {
    cancelPayment();
  }, []);

  const cancelPayment = async () => {
    setLoading?.(true);
    try {
      const res = await client.mutate({
        mutation: CANCEL_PAYMENT,
        variables: { payment_order_id: paymentId },
        fetchPolicy: 'no-cache',
      });
      setLoading?.(false);
      res?.data?.cancelPaymentOrder?.success && setcancelledOldPayment(true);
    } catch (error) {
      setLoading?.(false);
    }
  };

  const bookAppointment = (finalAppointmentInput: BookAppointmentInput) => {
    const appointmentInput: bookAppointmentVariables = {
      bookAppointment: finalAppointmentInput,
    };
    return client.mutate<bookAppointment, bookAppointmentVariables>({
      mutation: BOOK_APPOINTMENT,
      variables: appointmentInput,
      fetchPolicy: 'no-cache',
    });
  };

  const bookAppointmentwithSubscription = (finalAppointmentInput: BookAppointmentInput) => {
    const appointmentSubscriptionInput = {
      bookAppointment: finalAppointmentInput,
      userSubscription: {
        mobile_number: currentPatient?.mobileNumber,
        plan_id: planId,
        sub_plan_id: circlePlanSelected?.subPlanId,
        storeCode,
        FirstName: currentPatient?.firstName,
        LastName: currentPatient?.lastName,
        payment_reference: {
          amount_paid: Number(circlePlanSelected?.currentSellingPrice),
          payment_status: PaymentStatus.PENDING,
          purchase_via_HC: false,
          HC_used: 0,
        },
        transaction_date_time: new Date().toISOString(),
      },
    };
    return client.mutate({
      mutation: BOOK_APPOINTMENT_WITH_SUBSCRIPTION,
      variables: appointmentSubscriptionInput,
      fetchPolicy: 'no-cache',
    });
  };

  const createOrderInternal = (
    orderId: string,
    consultAmounttoPay: number,
    amountToPay: number,
    subscriptionId?: string
  ) => {
    const orders: OrderVerticals = {
      consult: [
        {
          order_id: orderId,
          amount: consultAmounttoPay,
          patient_id: currentPatient?.id,
        },
      ],
    };
    if (subscriptionId) {
      orders['subscription'] = [
        {
          order_id: subscriptionId,
          amount: Number(circlePlanSelected?.currentSellingPrice),
          patient_id: currentPatient?.id,
        },
      ];
    }
    const orderInput: OrderCreate = {
      orders: orders,
      total_amount: amountToPay,
    };
    return client.mutate<createOrderInternal, createOrderInternalVariables>({
      mutation: CREATE_INTERNAL_ORDER,
      variables: { order: orderInput },
    });
  };

  const createOrderInternalDiag = (
    diagOrders: any,
    amountToPay: number,
    subscriptionId?: string
  ) => {
    const orders: OrderVerticals = {
      diagnostics: diagOrders,
    };
    if (subscriptionId) {
      orders['subscription'] = [
        {
          order_id: subscriptionId,
          amount: Number(selectedCirclePlan?.currentSellingPrice),
          patient_id: currentPatient?.id,
        },
      ];
    }
    const orderInput: OrderCreate = {
      orders: orders,
      total_amount: amountToPay,
    };
    return client.mutate<createOrderInternal, createOrderInternalVariables>({
      mutation: CREATE_INTERNAL_ORDER,
      variables: { order: orderInput },
    });
  };

  const storeAppointmentId = async (appointmentId: string) => {
    if (!appointmentId) return;
    try {
      const ids = await AsyncStorage.getItem('APPOINTMENTS_CONSULTED_WITH_DOCTOR_BEFORE');
      const appointmentIds: string[] = ids ? JSON.parse(ids || '[]') : [];
      AsyncStorage.setItem(
        'APPOINTMENTS_CONSULTED_WITH_DOCTOR_BEFORE',
        JSON.stringify([...appointmentIds, appointmentId])
      );
    } catch (error) {}
  };

  function createUserCircleSubscription() {
    const purchaseInput = {
      userSubscription: {
        mobile_number: currentPatient?.mobileNumber,
        plan_id: planId,
        sub_plan_id: selectedCirclePlan?.subPlanId,
        storeCode,
        transaction_date_time: new Date().toISOString(),
      },
    };
    return client.mutate<CreateUserSubscription, CreateUserSubscriptionVariables>({
      mutation: CREATE_USER_SUBSCRIPTION,
      variables: purchaseInput,
      fetchPolicy: 'no-cache',
    });
  }

  const onRetryConsultPayment = async () => {
    setLoading!(true);
    try {
      const info = await AsyncStorage.getItem('onGoingBookingInfo');
      const appointmentInfo = !!info ? JSON.parse(info) : {};
      const response =
        !circleSubscriptionId &&
        circlePlanSelected &&
        appointmentInfo?.isCircleDoctorOnSelectedConsultMode
          ? await bookAppointmentwithSubscription(orderDetails?.appointmentInput)
          : await bookAppointment(orderDetails?.appointmentInput);
      const apptmt = g(response, 'data', 'bookAppointment', 'appointment');
      const subscriptionId = g(response, 'data', 'CreateUserSubscription', 'response', '_id');
      orderDetails?.consultedWithDoctorBefore && storeAppointmentId(g(apptmt, 'id')!);
      const data = await createOrderInternal(
        apptmt?.id!,
        appointmentInfo?.consultAmounttoPay,
        appointmentInfo?.amountToPay,
        subscriptionId
      );
      if (data?.data?.createOrderInternal?.success) {
        setauthToken?.('');
        setLoading?.(false);
        let orderInfo = orderDetails;
        orderInfo['orderId'] = apptmt?.id;
        orderInfo['displayId'] = apptmt?.displayId;
        props.navigation.navigate(AppRoutes.PaymentMethods, {
          paymentId: data?.data?.createOrderInternal?.payment_order_id!,
          amount: appointmentInfo?.amountToPay,
          orderDetails: orderInfo,
          businessLine: 'consult',
          customerId: cusId,
        });
      }
    } catch (error) {
      renderErrorPopup();
    }
  };

  const onRetryDiagPayment = async () => {
    setLoading!(true);
    try {
      if (isCircleAddedToCart && !!selectedCirclePlan) {
        const response = await createUserCircleSubscription();
        const subscriptionId = g(response, 'data', 'CreateUserSubscription', 'response', '_id');
        if (!!subscriptionId) {
          isModifyFlow ? bookModifiedOrder(subscriptionId) : bookDiagnosticOrder(subscriptionId);
        } else {
          renderErrorPopup();
        }
      } else {
        isModifyFlow ? bookModifiedOrder() : bookDiagnosticOrder();
      }
    } catch {}
  };

  const bookModifiedOrder = async (subscriptionId?: any) => {
    const input = await AsyncStorage.getItem('modifyBookingInput');
    const modifyBookingInput = !!input ? JSON.parse(input) : {};
    const resp = await saveModifyOrder?.(client, modifyBookingInput?.modifyBookingInput);
    if (resp?.data?.saveModifyDiagnosticOrder?.status) {
      let array = [
        {
          order_id: resp?.data?.saveModifyDiagnosticOrder?.orderId!,
          amount: grandTotal,
          patient_id: modifiedOrder?.patientId,
        },
      ];
      const response = await createOrderInternalDiag(array, toPayPrice, subscriptionId);
      let eventAttributes = {};
      if (response?.data?.createOrderInternal?.success) {
        setLoading?.(false);
        setauthToken?.('');
        const Info = await AsyncStorage.getItem('orderInfo');
        let orderInfo = !!Info ? JSON.parse(Info) : {};
        orderInfo['orderId'] = resp?.data?.saveModifyDiagnosticOrder?.orderId;
        orderInfo['displayId'] = resp?.data?.saveModifyDiagnosticOrder?.displayId;
        props.navigation.navigate(AppRoutes.PaymentMethods, {
          paymentId: response?.data?.createOrderInternal?.payment_order_id!,
          amount: toPayPrice,
          orderId: resp?.data?.saveModifyDiagnosticOrder?.orderId, //pass only one
          orderDetails: orderInfo,
          orderResponse: array,
          eventAttributes,
          businessLine: 'diagnostics',
          customerId: cusId,
          isCircleAddedToCart: isCircleAddedToCart,
        });
      } else {
        renderErrorPopup();
      }
    } else {
      renderErrorPopup();
    }
  };

  const bookDiagnosticOrder = async (subscriptionId?: any) => {
    const input = await AsyncStorage.getItem('bookingOrderInfo');
    const bookingOrderInfo = !!input ? JSON.parse(input) : {};
    const resp = await diagnosticSaveBookHcCollectionV2(client, bookingOrderInfo?.bookingOrderInfo);
    const HCResponse = resp?.data?.saveDiagnosticBookHCOrderv2?.patientsObjWithOrderIDs;
    const checkIsFalse = HCResponse?.find((item) => item?.status === false);
    var array = [] as any;
    if (!checkIsFalse) {
      HCResponse?.map((item: any) => {
        array.push({
          order_id: item?.orderID,
          amount: item?.amount,
          patient_id: item?.patientID,
        });
      });
      const response = await createOrderInternalDiag(array, toPayPrice, subscriptionId);
      let eventAttributes = {};
      if (response?.data?.createOrderInternal?.success) {
        setLoading?.(false);
        setauthToken?.('');
        const Info = await AsyncStorage.getItem('orderInfo');
        let orderInfo = !!Info ? JSON.parse(Info) : {};
        orderInfo['orderId'] = HCResponse?.[0]?.orderID;
        orderInfo['displayId'] = HCResponse?.[0]?.displayID;
        props.navigation.navigate(AppRoutes.PaymentMethods, {
          paymentId: response?.data?.createOrderInternal?.payment_order_id!,
          amount: toPayPrice,
          orderId: HCResponse?.[0]?.orderID, //pass only one
          orderDetails: orderInfo,
          orderResponse: array,
          eventAttributes,
          businessLine: 'diagnostics',
          customerId: cusId,
          isCircleAddedToCart: isCircleAddedToCart,
        });
      } else {
        renderErrorPopup();
      }
    } else {
      renderErrorPopup();
    }
  };

  const updatePaymentToCOD = async (amount: number) => {
    const orderInput = {
      payment_order_id: paymentId,
      health_credits_used: 0,
      cash_to_collect: amount,
      prepaid_amount: 0,
      store_code: storeCode,
      is_mobile_sdk: true,
      return_url: AppConfig.Configuration.baseUrl,
    };
    const response = await client.mutate({
      mutation: UPDATE_ORDER,
      variables: { order_input: orderInput },
      fetchPolicy: 'no-cache',
    });
    if (response?.data?.updateOrderDetails?.payment_status) {
      navigatetoOrderStatus(amount);
    } else {
      renderErrorPopup();
    }
  };

  const navigatetoOrderStatus = (amount: number) => {
    switch (businessLine) {
      case 'diagnostics':
        props.navigation.navigate(AppRoutes.PaymentStatusDiag, {
          paymentStatus: 'success',
          amount: amount,
          paymentId: paymentId,
          orderDetails: orderDetails,
        });
        break;
      case 'pharma':
        props.navigation.navigate(AppRoutes.PaymentStatusPharma, {
          paymentStatus: 'success',
          amount: amount,
          paymentId: paymentId,
          orderDetails: orderDetails,
        });
        break;
    }
  };

  const onPressCopy = () => {
    Clipboard.setString(paymentId);
    Platform.OS === 'android' && ToastAndroid.show('Copied', ToastAndroid.SHORT);
  };

  const onPressRetry = () => {
    console.log('retry');
    if (cancelledOldPayment) {
      businessLine == 'consult'
        ? onRetryConsultPayment()
        : businessLine == 'diagnostics'
        ? onRetryDiagPayment()
        : null;
    } else {
      renderErrorPopup();
    }
  };

  const onPressCOD = () => {
    businessLine == 'diagnostics'
      ? updatePaymentToCOD(grandTotal)
      : businessLine == 'pharma'
      ? updatePaymentToCOD(amount)
      : null;
  };

  const renderErrorPopup = () => {
    setLoading?.(false);
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: 'Something went wrong. Please try again after some time',
    });
  };

  const renderStatus = () => {
    return (
      <ImageBackground
        source={require('@aph/mobile-patients/src/components/ui/icons/FailedBackground.webp')}
        resizeMode="cover"
        style={styles.imageBackground}
      >
        <PaymentFailedIcon style={styles.statusIconStyles} />
        <Text style={styles.status}>Payment Failed</Text>
        <Text style={styles.orderMsg}>
          {'If any money is deducted, It will be refunded in 3-5 working days'}
        </Text>
      </ImageBackground>
    );
  };

  const renderPaymentInfo = () => {
    return (
      <View style={styles.paymentInfo}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.orderId}>Order ID:</Text>
          <Text style={styles.id}>{orderIds || orderDetails?.displayId}</Text>
        </View>
        <TouchableOpacity style={styles.paymentId} onPress={onPressCopy}>
          <Text style={styles.orderId}>Payment Ref. Number:</Text>
          <Text style={styles.id}>{paymentId}</Text>
          <Copy style={styles.iconStyle} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderRetry = () => {
    return businessLine == 'diagnostics' || businessLine == 'consult' ? (
      <TouchableOpacity style={styles.retryCont} onPress={onPressRetry}>
        <Text style={styles.retry}>RETRY WITH ANOTHER PAYMENT METHOD</Text>
      </TouchableOpacity>
    ) : null;
  };

  const renderCOD = () => {
    return (businessLine == 'diagnostics' && showCODonDiag) ||
      (businessLine == 'pharma' && showCODonPharma) ? (
      <TouchableOpacity style={styles.button} onPress={onPressCOD}>
        <Text style={styles.cod}>PLACE ORDER - CASH ON DELIVERY</Text>
      </TouchableOpacity>
    ) : null;
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        {renderStatus()}
        {renderPaymentInfo()}
        {renderRetry()}
        {renderCOD()}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageBackground: {
    width: windowWidth,
    height: 0.66 * windowWidth,
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  statusIconStyles: {
    height: 48,
    width: 48,
  },
  status: {
    ...theme.fonts.IBMPlexSansBold(16),
    lineHeight: 20,
    color: '#01475B',
    marginTop: 12,
  },
  orderMsg: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 20,
    color: '#01475B',
    marginTop: 4,
    textAlign: 'center',
  },
  orderId: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 20,
    color: '#01475B',
  },
  paymentId: {
    flexDirection: 'row',
    marginTop: 7,
    alignItems: 'center',
  },
  id: {
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 20,
    color: '#01475B',
    marginLeft: 5,
  },
  iconStyle: {
    width: 11,
    height: 12.5,
    marginLeft: 8,
  },
  paymentInfo: {
    paddingVertical: 12,
    paddingLeft: 12,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#D4D4D4',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  retryCont: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#FC9916',
    marginHorizontal: 16,
    marginTop: 8,
  },
  retry: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    color: '#FC9916',
    marginVertical: 8,
  },
  codCont: {
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: '#FCB716',
    marginHorizontal: 16,
    marginTop: 18,
  },
  cod: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    marginVertical: 8,
    color: '#FFFFFF',
  },
  button: {
    alignItems: 'center',
    borderRadius: 4,
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: '#FCB716',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
  },
});
