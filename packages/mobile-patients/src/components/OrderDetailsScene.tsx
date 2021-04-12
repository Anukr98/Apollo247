import { FeedbackPopup } from '@aph/mobile-patients/src/components/FeedbackPopup';
import { Props as BreadcrumbProps } from '@aph/mobile-patients/src/components/MedicineListing/Breadcrumb';
import {
  MedicineReOrderOverlay,
  MedicineReOrderOverlayProps,
} from '@aph/mobile-patients/src/components/Medicines/MedicineReOrderOverlay';
import { SelectEPrescriptionModal } from '@aph/mobile-patients/src/components/Medicines/SelectEPrescriptionModal';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { OrderSummary } from '@aph/mobile-patients/src/components/OrderSummaryView';
import { RefundDetails } from '@aph/mobile-patients/src/components/RefundDetails';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { ChatWithUs } from '@aph/mobile-patients/src/components/ui/ChatWithUs';
import { DropDown, Option } from '@aph/mobile-patients/src/components/ui/DropDown';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CrossPopup,
  DropdownGreen,
  MedicalIcon,
  More,
  NotificationIcon,
  NotifySymbolGreen,
  PendingIcon,
  RetryButtonIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { OrderProgressCard } from '@aph/mobile-patients/src/components/ui/OrderProgressCard';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { MedOrder } from '@aph/mobile-patients/src/components/YourOrdersScene';
import { CommonBugFender, isIphone5s } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  ALERT_MEDICINE_ORDER_PICKUP,
  CANCEL_MEDICINE_ORDER_OMS,
  GET_MEDICINE_ORDER_CANCEL_REASONS,
  GET_MEDICINE_ORDER_OMS_DETAILS_WITH_ADDRESS,
  GET_PATIENT_ADDRESS_BY_ID,
  GET_PATIENT_FEEDBACK,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  alertMedicineOrderPickup,
  alertMedicineOrderPickupVariables,
} from '@aph/mobile-patients/src/graphql/types/alertMedicineOrderPickup';
import {
  CancelMedicineOrderOMS,
  CancelMedicineOrderOMSVariables,
} from '@aph/mobile-patients/src/graphql/types/CancelMedicineOrderOMS';
import {
  GetMedicineOrderCancelReasons,
  GetMedicineOrderCancelReasons_getMedicineOrderCancelReasons_cancellationReasons,
} from '@aph/mobile-patients/src/graphql/types/GetMedicineOrderCancelReasons';
import {
  getMedicineOrderOMSDetailsWithAddress,
  getMedicineOrderOMSDetailsWithAddressVariables,
  getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails,
  getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
} from '@aph/mobile-patients/src/graphql/types/getMedicineOrderOMSDetailsWithAddress';
import {
  getPatientAddressById,
  getPatientAddressByIdVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressById';
import {
  GetPatientFeedback,
  GetPatientFeedbackVariables,
} from '@aph/mobile-patients/src/graphql/types/GetPatientFeedback';
import {
  FEEDBACKTYPE,
  MEDICINE_DELIVERY_TYPE,
  MEDICINE_ORDER_STATUS,
  MEDICINE_ORDER_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  aphConsole,
  extractUrlFromString,
  formatAddressWithLandmark,
  g,
  getOrderStatusText,
  handleGraphQlError,
  isEmptyObject,
  postWebEngageEvent,
  reOrderMedicines,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { postPharmacyMyOrderTrackingClicked } from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import {
  Alert,
  BackHandler,
  Dimensions,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Overlay } from 'react-native-elements';
import {
  NavigationActions,
  NavigationScreenProps,
  ScrollView,
  StackActions,
} from 'react-navigation';

const whatsappScheme = `whatsapp://send?text=${AppConfig.Configuration.CUSTOMER_CARE_HELP_TEXT}&phone=91${AppConfig.Configuration.CUSTOMER_CARE_NUMBER}`;
const screenWidth = Dimensions.get('window').width;

export interface OrderDetailsSceneProps
  extends NavigationScreenProps<{
    /** One of @orderAutoId or @billNumber is mandatory */
    orderAutoId?: string;
    billNumber?: string;
    isCancelOrder?: boolean;
    isOrderHelp?: boolean;
    breadCrumb: BreadcrumbProps['links'];
    queryCategory: string;
    email: string;
    showOrderSummaryTab?: boolean;
    goToHomeOnBack?: boolean;
    refetchOrders?: () => void;
    reOrder?: boolean;
  }> {}

export const OrderDetailsScene: React.FC<OrderDetailsSceneProps> = (props) => {
  const orderAutoId = props.navigation.getParam('orderAutoId');
  const billNumber = props.navigation.getParam('billNumber');
  const isCancelOrder = props.navigation.getParam('isCancelOrder');
  const isOrderHelp = props.navigation.getParam('isOrderHelp');
  const queryCategory = props.navigation.getParam('queryCategory') || string.pharmacy;
  const email = props.navigation.getParam('email') || '';
  const breadCrumb = props.navigation.getParam('breadCrumb') || [];
  const refetchOrders = props.navigation.getParam('refetchOrders');
  const goToHomeOnBack = props.navigation.getParam('goToHomeOnBack');
  const showOrderSummaryTab = props.navigation.getParam('showOrderSummaryTab');
  const AutoreOrder = props.navigation.getParam('reOrder');
  const [cancellationReasons, setCancellationReasons] = useState<
    GetMedicineOrderCancelReasons_getMedicineOrderCancelReasons_cancellationReasons[]
  >([]);
  const client = useApolloClient();
  const NeedHelp = AppConfig.Configuration.NEED_HELP;

  const [showAlertStore, setShowAlertStore] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<string>(
    showOrderSummaryTab ? string.orders.viewBill : string.orders.trackOrder
  );
  const [omsAPIError, setOMSAPIError] = useState(false);
  const [addressData, setAddressData] = useState('');
  const [storePhoneNumber, setStorePhoneNumber] = useState('');
  const [scrollYValue, setScrollYValue] = useState(0);
  const [reOrderDetails, setReOrderDetails] = useState<MedicineReOrderOverlayProps['itemDetails']>({
    total: 0,
    unavailable: [],
  });
  const scrollViewRef = React.useRef<ScrollView | null>(null);
  const scrollToSlots = () => {
    scrollViewRef.current &&
      scrollViewRef.current.scrollTo({ x: 0, y: scrollYValue, animated: true });
  };
  const { currentPatient } = useAllCurrentPatients();
  const {
    addMultipleCartItems,
    addMultipleEPrescriptions,
    addresses,
    onHoldOptionOrder,
    setEPrescriptions,
    setPhysicalPrescriptions,
  } = useShoppingCart();
  const { showAphAlert, hideAphAlert, setLoading } = useUIElements();
  const [isCancelVisible, setCancelVisible] = useState(false);
  const [showPrescriptionPopup, setPrescriptionPopUp] = useState(false);
  const [isSelectPrescriptionVisible, setSelectPrescriptionVisible] = useState(false);

  const vars: getMedicineOrderOMSDetailsWithAddressVariables = {
    patientId: currentPatient && currentPatient.id,
    orderAutoId: billNumber ? 0 : Number(orderAutoId),
    billNumber: billNumber || '',
  };

  const { data, loading, refetch } = useQuery<
    getMedicineOrderOMSDetailsWithAddress,
    getMedicineOrderOMSDetailsWithAddressVariables
  >(GET_MEDICINE_ORDER_OMS_DETAILS_WITH_ADDRESS, {
    variables: vars,
    fetchPolicy: 'no-cache',
  });
  const order = g(data, 'getMedicineOrderOMSDetailsWithAddress', 'medicineOrderDetails');
  const shipmentInfo = g(order, 'medicineOrderShipments');
  const shipmentTrackingNumber = shipmentInfo?.[0]?.trackingNo;
  const shipmentTrackingProvider = shipmentInfo?.[0]?.trackingProvider;
  const shipmentTrackingUrl = shipmentInfo?.[0]?.trackingUrl;
  const prescriptionRequired = !!(g(order, 'medicineOrderLineItems') || []).find(
    (item) => item!.isPrescriptionNeeded
  );
  const orderCancel = (g(order, 'medicineOrdersStatus') || []).find(
    (item) => item!.orderStatus == MEDICINE_ORDER_STATUS.CANCELLED
  );
  //added for order put on hold, if multiple then return the latest
  const ordersOnHold = (g(order, 'medicineOrdersStatus') || []).filter(
    (item) => item!.orderStatus == MEDICINE_ORDER_STATUS.ON_HOLD
  );
  const orderOnHold = (ordersOnHold.length > 0 && ordersOnHold[ordersOnHold.length - 1]) || [];
  //for status message of orders on hold

  const checkIsJSON = (val: string) => {
    try {
      JSON.parse(val);
      return true;
    } catch (error) {
      return false;
    }
  };

  const reasonForOnHold = order?.medicineOrdersStatus!.find(
    (item) =>
      item?.orderStatus == MEDICINE_ORDER_STATUS.VERIFICATION_DONE ||
      item?.orderStatus == MEDICINE_ORDER_STATUS.READY_FOR_VERIFICATION
  )
    ? false
    : orderOnHold! &&
      !isEmptyObject(orderOnHold!) &&
      checkIsJSON(orderOnHold?.statusMessage!) &&
      JSON.parse(orderOnHold?.statusMessage!);

  const orderDetails = ((!loading && order) ||
    {}) as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails;
  const orderStatusList = ((!loading && order && order.medicineOrdersStatus) || []).filter(
    (item) => item!.hideStatus
  );
  const paymentDetails = (!loading && order && order.medicineOrderPayments) || [];
  const RefundTypes = ['REFUND_REQUEST_RAISED', 'REFUND_SUCCESSFUL'];
  const refundDetails = ((!loading && order && order.medicineOrderRefunds) || []).filter(
    (item) => RefundTypes.indexOf(item?.refundStatus!) != -1
  );
  const offlineOrderBillNumber = loading
    ? 0
    : g(data, 'getMedicineOrderOMSDetailsWithAddress', 'medicineOrderDetails', 'billNumber');

  const [showRateDeliveryBtn, setShowRateDeliveryBtn] = useState(false);
  const orderDeliveryDate = order?.medicineOrdersStatus?.find(
    (i) => i?.orderStatus === order?.currentStatus
  )?.statusDate;

  const hideWhtsappQueryOption = moment(new Date()).diff(moment(orderDeliveryDate), 'hours') > 48;

  useEffect(() => {
    if (isCancelOrder && !loading) {
      showCancelOrder();
    }
  }, [loading]);

  useEffect(() => {
    updateRateDeliveryBtnVisibility();
  }, [orderDetails]);

  const updateRateDeliveryBtnVisibility = async () => {
    try {
      if (!showRateDeliveryBtn && isOrderDeliveredToHome()) {
        const response = await client.query<GetPatientFeedback, GetPatientFeedbackVariables>({
          query: GET_PATIENT_FEEDBACK,
          variables: {
            patientId: g(currentPatient, 'id') || '',
            transactionId: `${orderDetails.id}`,
          },
          fetchPolicy: 'no-cache',
        });
        const feedback = g(response, 'data', 'getPatientFeedback', 'feedback', 'length');
        if (!feedback) {
          setShowRateDeliveryBtn(true);
        }
      }
    } catch (error) {
      CommonBugFender(`${AppRoutes.OrderDetailsScene}_updateRateDeliveryBtnVisibility`, error);
    }
  };

  const isOrderDeliveredToHome = () => {
    const isHomeDelivery = g(orderDetails, 'deliveryType') == MEDICINE_DELIVERY_TYPE.HOME_DELIVERY;
    const isDeliveredToHome = (g(orderDetails, 'medicineOrdersStatus') || []).find(
      (item) => item!.orderStatus == MEDICINE_ORDER_STATUS.DELIVERED
    );
    return !!isHomeDelivery && !!isDeliveredToHome;
  };

  const getAddressDatails = async () => {
    try {
      const address = addresses.find((a) => a.id == order!.patientAddressId);
      let formattedAddress = '';
      if (address) {
        formattedAddress = formatAddressWithLandmark(address);
      } else {
        const getPatientAddressByIdResponse = await client.query<
          getPatientAddressById,
          getPatientAddressByIdVariables
        >({
          query: GET_PATIENT_ADDRESS_BY_ID,
          variables: { id: order!.patientAddressId },
        });
        formattedAddress = formatAddressWithLandmark(
          getPatientAddressByIdResponse.data.getPatientAddressById
            .patientAddress as savePatientAddress_savePatientAddress_patientAddress
        );
      }
      setAddressData(formattedAddress);
    } catch (error) {
      CommonBugFender(`${AppRoutes.OrderDetailsScene}_getAddressDatails`, error);
    }
  };

  const [isEventFired, setEventFired] = useState(false);

  useEffect(() => {
    if (isEventFired) {
      return;
    }
    const statusList = g(order, 'medicineOrdersStatus') || [];
    const orderDate = g(statusList.slice(-1)[0], 'statusDate');
    if (order) {
      setShowAlertStore(!order.alertStore);
      postPharmacyMyOrderTrackingClicked(
        g(order, 'id')!,
        g(order, 'currentStatus')!,
        moment(orderDate).toDate(),
        g(order, 'orderTat') ? moment(g(order, 'orderTat')!).toDate() : undefined,
        g(order, 'orderType') == MEDICINE_ORDER_TYPE.UPLOAD_PRESCRIPTION ? 'Non Cart' : 'Cart',
        currentPatient
      );
      order.deliveryType == MEDICINE_DELIVERY_TYPE.HOME_DELIVERY && getAddressDatails();
      let shopAddress =
        order.deliveryType == MEDICINE_DELIVERY_TYPE.STORE_PICKUP && order.shopAddress
          ? JSON.parse(order.shopAddress)
          : null;
      shopAddress && setAddressData(shopAddress.address);
      let storePhone =
        order.deliveryType == MEDICINE_DELIVERY_TYPE.STORE_PICKUP && order.shopAddress
          ? JSON.parse(order.shopAddress)
          : null;
      storePhone && setStorePhoneNumber(shopAddress.phone);
      setEventFired(true);
    } else {
      setOMSAPIError(true);
    }
  }, [order]);

  useEffect(() => {
    if (offlineOrderBillNumber) {
      setSelectedTab(string.orders.viewBill);
    }
  }, [offlineOrderBillNumber]);

  useEffect(() => {
    selectedTab == string.orders.viewBill && setScrollYValue(0);
  }, [selectedTab]);

  useEffect(() => {
    !loading && orderDetails && AutoreOrder && reOrder();
  }, [loading]);

  const handleBack = async () => {
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
    if (goToHomeOnBack) {
      props.navigation.dispatch(
        StackActions.reset({
          index: 0,
          key: null,
          actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
        })
      );
    } else {
      props.navigation.goBack();
    }
    return false;
  };

  useEffect(() => {
    const _didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
    });

    const _willBlurSubscription = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    });

    return () => {
      _didFocusSubscription && _didFocusSubscription.remove();
      _willBlurSubscription && _willBlurSubscription.remove();
    };
  }, []);

  const showErrorPopup = (desc: string) => {
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: desc,
    });
  };

  const getFormattedDate = (time: string) => {
    // To support two different TAT formats (JS Date type & DD-MMM-YYYY hh:mm)
    return (moment(time).isValid()
      ? moment(time)
      : moment(time, AppConfig.Configuration.MED_DELIVERY_DATE_API_FORMAT)
    ).format('D MMMM, YYYY');
  };

  const getFormattedTime = (time: string) => {
    return moment(time).format('hh:mm A');
  };

  const getFormattedDateTime = (time: string) => {
    let finalDateTime =
      moment(time).format('D MMMM YYYY') + ' at ' + moment(time).format('hh:mm A');
    return finalDateTime;
  };

  const getFormattedDaySubscript = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  const getFormattedDateTimeWithBefore = (time: string) => {
    let day = parseInt(moment(time).format('D'));
    let getDaySubscript = getFormattedDaySubscript(day);
    let finalDateTime =
      day +
      getDaySubscript +
      ' ' +
      moment(time).format('MMMM') +
      ' before ' +
      moment(time).format('hh:mm A');

    return finalDateTime;
  };

  const reOrder = async () => {
    try {
      setLoading!(true);
      const { items, prescriptions, totalItemsCount, unavailableItems } = await reOrderMedicines(
        orderDetails,
        currentPatient,
        'Order Details'
      );

      const eventAttributes: WebEngageEvents[WebEngageEventName.RE_ORDER_MEDICINE] = {
        orderType: !!g(order, 'billNumber')
          ? 'Offline'
          : orderDetails.orderType == MEDICINE_ORDER_TYPE.UPLOAD_PRESCRIPTION
          ? 'Non Cart'
          : 'Cart',
        noOfItemsNotAvailable: unavailableItems.length,
        source: selectedTab,
        'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
        'Patient UHID': g(currentPatient, 'uhid'),
        Relation: g(currentPatient, 'relation'),
        'Patient Age': Math.round(moment().diff(currentPatient.dateOfBirth, 'years', true)),
        'Patient Gender': g(currentPatient, 'gender'),
        'Mobile Number': g(currentPatient, 'mobileNumber'),
        'Customer ID': g(currentPatient, 'id'),
      };
      postWebEngageEvent(WebEngageEventName.RE_ORDER_MEDICINE, eventAttributes);
      items.length && addMultipleCartItems!(items);
      items.length && prescriptions.length && addMultipleEPrescriptions!(prescriptions);
      setLoading!(false);
      if (unavailableItems.length) {
        setReOrderDetails({ total: totalItemsCount, unavailable: unavailableItems });
      } else {
        props.navigation.navigate(AppRoutes.MedicineCart);
      }
    } catch (error) {
      CommonBugFender(`${AppRoutes.OrderDetailsScene}_reOrder`, error);
      setLoading!(false);
      showErrorPopup("We're sorry! Unable to re-order right now.");
    }
  };

  const postRatingGivenWEGEvent = (rating: string, reason: string) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_FEEDBACK_GIVEN] = {
      'Patient UHID': g(currentPatient, 'id'),
      Rating: rating,
      'Rating Reason': reason,
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_FEEDBACK_GIVEN, eventAttributes);
  };

  const renderFeedbackPopup = () => {
    const orderAutoId: string = `${orderDetails.orderAutoId}`;
    const orderId: string = orderDetails.id;
    const title: string = `Medicines — #${orderAutoId}`;
    const subtitle: string = `Delivered On: ${orderDetails.orderTat &&
      moment(orderDetails.orderTat).format('D MMM YYYY')}`;
    return (
      <>
        <FeedbackPopup
          containerStyle={{ paddingTop: 120 }}
          title="We value your feedback! :)"
          description="How was your overall experience with the following medicine delivery —"
          info={{
            title: title,
            description: subtitle,
            imageComponent: <MedicalIcon />,
          }}
          transactionId={orderId}
          type={FEEDBACKTYPE.PHARMACY}
          isVisible={showFeedbackPopup}
          onComplete={(ratingStatus, ratingOption) => {
            postRatingGivenWEGEvent(ratingStatus!, ratingOption);
            setShowFeedbackPopup(false);
            showAphAlert!({
              title: 'Thanks :)',
              description: 'Your feedback has been submitted. Thanks for your time.',
            });
            setShowRateDeliveryBtn(false);
          }}
        />
      </>
    );
  };

  const statusToShowNewItems = [
    MEDICINE_ORDER_STATUS.ORDER_PLACED,
    MEDICINE_ORDER_STATUS.VERIFICATION_DONE,
    MEDICINE_ORDER_STATUS.ORDER_VERIFIED,
  ];

  const renderOrderTrackTopView = () => {
    const diffInTat = checkOrderTatDiff();

    const isDelivered = orderStatusList.find(
      (item) =>
        item!.orderStatus == MEDICINE_ORDER_STATUS.DELIVERED ||
        item!.orderStatus == MEDICINE_ORDER_STATUS.PICKEDUP
    );
    const currentOrderStatus = orderStatusList.find(
      (item) => item!.orderStatus == orderDetails.currentStatus
    );
    let capsuleViewBGColor: string;
    let capsuleTextColor: string;
    let capsuleText: string;
    if (
      orderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED ||
      orderDetails.currentStatus == MEDICINE_ORDER_STATUS.PAYMENT_FAILED ||
      orderDetails.currentStatus == MEDICINE_ORDER_STATUS.ORDER_FAILED
    ) {
      capsuleText =
        orderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED ? 'Cancelled' : 'Failed';
      capsuleTextColor = '#FFF';
      capsuleViewBGColor = '#890000';
    } else {
      capsuleText =
        orderDetails.currentStatus == MEDICINE_ORDER_STATUS.PAYMENT_PENDING
          ? 'Pending'
          : orderDetails.currentStatus == MEDICINE_ORDER_STATUS.RETURN_INITIATED
          ? 'Return Initiated'
          : orderDetails.currentStatus == MEDICINE_ORDER_STATUS.RETURN_ACCEPTED
          ? 'Returned'
          : 'Successful';
      capsuleTextColor = '#01475b';
      capsuleViewBGColor = 'rgba(0, 179, 142, 0.2)';
    }
    const tatInfo = orderDetails.orderTat;
    const showChangedBadge = orderDetails.oldOrderTat! ? true : false;
    const showDeliveryBadge =
      orderDetails.orderTat! &&
      orderDetails.medicineOrderLineItems!.length > 0 &&
      orderDetails.orderType == MEDICINE_ORDER_TYPE.UPLOAD_PRESCRIPTION &&
      statusToShowNewItems.includes(orderDetails.currentStatus!);
    const showHoldBadge =
      orderDetails.currentStatus == MEDICINE_ORDER_STATUS.ON_HOLD && reasonForOnHold.showOnHold!;
    const showBadge = showChangedBadge || showDeliveryBadge || showHoldBadge;

    const renderCapsuleView = (backgroundColor: string, capsuleText: string, textColor: string) => {
      return (
        <View
          style={{
            alignSelf: 'flex-end',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: backgroundColor ? backgroundColor : 'rgba(0, 179, 142, 0.2)',
            borderRadius: 16,
            paddingHorizontal: 15,
            paddingVertical: 5,
          }}
        >
          <Text style={{ ...theme.viewStyles.text('M', 11, textColor) }}>{capsuleText}</Text>
        </View>
      );
    };

    const renderDelivered = () => {
      return (
        <View style={styles.deliveredHeader}>
          <View style={{ flexDirection: 'row' }}>
            <NotifySymbolGreen style={styles.notifySymbol} />
            <View style={{ marginLeft: 7 }}>
              <Text style={styles.orderDelivered}>Order Delivered!</Text>
              <Text style={styles.deliveryDate}>{getFormattedDate(isDelivered?.statusDate)}</Text>
            </View>
          </View>
          <Button
            style={{ width: undefined }}
            onPress={reOrder}
            title={'RE ORDER'}
            titleTextStyle={{ marginHorizontal: 35 }}
          />
        </View>
      );
    };

    const isDelhiveryOrEcomExpressProvider = ['Delhivery Express', 'Ecom Express'].includes(
      shipmentTrackingProvider!
    );

    return (
      <View>
        <View
          style={{
            paddingTop: 16,
            paddingBottom: 6,
            paddingHorizontal: 20,
            marginBottom: 8,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text
              style={{
                ...theme.viewStyles.text('SB', 13, '#01475b', 1, undefined, 0.5),
                // alignSelf: 'center',
                paddingTop: 2,
              }}
            >{`ORDER #${orderAutoId}`}</Text>
            {renderCapsuleView(capsuleViewBGColor, capsuleText, capsuleTextColor)}
          </View>
          {(!!shipmentTrackingProvider || !!shipmentTrackingNumber) && (
            <View style={styles.shipmentInfoContainer}>
              {!!shipmentTrackingProvider && isDelhiveryOrEcomExpressProvider && (
                <View>
                  <Text style={theme.viewStyles.text('SB', 13, '#01475b', 0.5, undefined, 0.5)}>
                    Courier
                  </Text>
                  <Text style={theme.viewStyles.text('SB', 13, '#01475b', 1, undefined, 0.5)}>
                    {shipmentTrackingProvider}
                  </Text>
                </View>
              )}
              {!!shipmentTrackingNumber && (
                <View>
                  <Text
                    style={{
                      ...theme.viewStyles.text('SB', 13, '#01475b', 0.5, undefined, 0.5),
                      textAlign:
                        !!shipmentTrackingProvider && isDelhiveryOrEcomExpressProvider
                          ? 'right'
                          : 'left',
                    }}
                  >
                    Tracking ID
                  </Text>
                  <Text style={theme.viewStyles.text('SB', 13, '#01475b', 1, undefined, 0.5)}>
                    {shipmentTrackingNumber}
                  </Text>
                </View>
              )}
            </View>
          )}
          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            <Text style={{ ...theme.viewStyles.text('M', 13, '#01475b') }}>
              {string.OrderSummery.name}
            </Text>
            <Text style={{ ...theme.viewStyles.text('R', 13, '#01475b'), flex: 1 }}>
              {orderDetails.patient && orderDetails.patient.firstName}{' '}
              {orderDetails.patient && orderDetails.patient.lastName}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 4, paddingRight: 0 }}>
            <Text style={{ ...theme.viewStyles.text('M', 13, '#01475b'), paddingTop: 2 }}>
              {orderDetails.deliveryType == MEDICINE_DELIVERY_TYPE.STORE_PICKUP
                ? string.OrderSummery.store_address
                : string.OrderSummery.address}
            </Text>
            <Text
              style={{
                ...theme.viewStyles.text('R', 13, '#01475b', 1, 24),
                paddingRight: 0,
                flex: 1,
              }}
            >
              {addressData}
            </Text>
          </View>
        </View>
        {!!!orderStatusList.find(
          (item) =>
            item!.orderStatus == MEDICINE_ORDER_STATUS.CANCELLED ||
            item!.orderStatus == MEDICINE_ORDER_STATUS.PAYMENT_FAILED ||
            item!.orderStatus == MEDICINE_ORDER_STATUS.ORDER_FAILED ||
            item!.orderStatus == MEDICINE_ORDER_STATUS.ITEMS_RETURNED
        ) && (
          <View
            style={{
              backgroundColor: '#f7f8f5',
              shadowColor: 'rgba(128, 128, 128, 0.3)',
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.4,
              shadowRadius: 5,
              elevation: 5,
              paddingHorizontal: 20,
              paddingTop: 10,
              paddingBottom: 10,
              flexDirection: 'row',
              height: showChangedBadge || showDeliveryBadge ? 80 : undefined,
            }}
          >
            {isDelivered ? (
              renderDelivered()
            ) : (
              <>
                <View style={styles.deliveryOuterview}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.expectedDeliveryText}>
                      {orderDetails.deliveryType == MEDICINE_DELIVERY_TYPE.STORE_PICKUP
                        ? 'STORE PICKUP - '
                        : isDelivered
                        ? 'ORDER DELIVERED - '
                        : 'EXPECTED DELIVERY - '}
                    </Text>
                    <Text style={styles.expectedDeliveryDateText}>
                      {orderDetails.deliveryType == MEDICINE_DELIVERY_TYPE.STORE_PICKUP
                        ? getFormattedDateTime(currentOrderStatus && currentOrderStatus.statusDate)
                        : isDelivered
                        ? getFormattedDate(isDelivered.statusDate)
                        : orderDetails.currentStatus == MEDICINE_ORDER_STATUS.ON_HOLD
                        ? orderDetails.orderType == MEDICINE_ORDER_TYPE.CART_ORDER
                          ? 'To be Updated'
                          : 'Awaited' //do it bold
                        : tatInfo
                        ? orderDetails.orderType == MEDICINE_ORDER_TYPE.CART_ORDER &&
                          orderDetails.currentStatus == MEDICINE_ORDER_STATUS.ORDER_PLACED &&
                          orderDetails?.medicineOrdersStatus!.find(
                            (item) => item?.orderStatus == MEDICINE_ORDER_STATUS.ON_HOLD
                          )
                          ? 'To be Updated'
                          : getFormattedDateTimeWithBefore(tatInfo)
                        : 'Awaited'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', width: showBadge ? '82%' : '90%' }}>
                    <Text style={styles.deliverySubText}>
                      {orderDetails.orderType == MEDICINE_ORDER_TYPE.CART_ORDER &&
                      orderDetails.oldOrderTat!
                        ? diffInTat > 1
                          ? `Delivery date extended by ${diffInTat} days.`
                          : diffInTat == 1
                          ? `Delivery date extended by a day.`
                          : 'Delivery extended by few hours.'
                        : orderDetails.orderTat!
                        ? orderDetails.currentStatus == MEDICINE_ORDER_STATUS.ON_HOLD
                          ? string.medicine_cart.orderDetailsExpectedDeliverySubTextNonCartOrder
                          : orderDetails.orderType == MEDICINE_ORDER_TYPE.CART_ORDER &&
                            orderDetails.currentStatus == MEDICINE_ORDER_STATUS.ORDER_PLACED &&
                            orderDetails?.medicineOrdersStatus!.find(
                              (item) => item?.orderStatus == MEDICINE_ORDER_STATUS.ON_HOLD
                            )
                          ? string.medicine_cart.orderDetailsExpectedDeliverySubTextNonCartOrder
                          : ''
                        : string.medicine_cart.orderDetailsExpectedDeliverySubTextNonCartOrder}
                    </Text>
                  </View>
                </View>
                {renderBadge()}
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  const checkOrderTatDiff = () => {
    const olderTat = moment(orderDetails.oldOrderTat!).format('LL'); //MMMM D, YYYY
    const newTat = moment(orderDetails.orderTat!).format('LL');
    let diff = moment(newTat).diff(olderTat, 'days');
    return diff;
  };

  const renderBadge = () => {
    const isExpectedDateChanged =
      orderDetails.oldOrderTat! && statusToShowNewItems.includes(orderDetails.currentStatus!)
        ? true
        : false;
    const isSKUPopulated = orderDetails?.medicineOrderLineItems?.length > 0;

    const colorOfBadge =
      orderDetails.currentStatus == MEDICINE_ORDER_STATUS.ON_HOLD
        ? theme.colors.INPUT_FAILURE_TEXT
        : isExpectedDateChanged
        ? 'rgb(230,130,49)'
        : '#00b38e';
    const textOfBadge =
      orderDetails.currentStatus == MEDICINE_ORDER_STATUS.ON_HOLD
        ? 'ON-HOLD'
        : isExpectedDateChanged
        ? 'CHANGED'
        : 'DELIVERY UPDATED';

    return (
      <>
        {(orderDetails.currentStatus == MEDICINE_ORDER_STATUS.ON_HOLD &&
          reasonForOnHold.showOnHold!) ||
        (orderDetails.orderTat! &&
          isSKUPopulated &&
          orderDetails.orderType == MEDICINE_ORDER_TYPE.UPLOAD_PRESCRIPTION &&
          statusToShowNewItems.includes(orderDetails.currentStatus!)) ||
        isExpectedDateChanged ? (
          <View
            style={{
              position: 'absolute',
              right: '5%',
              top:
                isExpectedDateChanged || (orderDetails.orderTat && isSKUPopulated)
                  ? screenWidth > 400 &&
                    orderDetails.orderType == MEDICINE_ORDER_TYPE.CART_ORDER &&
                    orderDetails.currentStatus == MEDICINE_ORDER_STATUS.ON_HOLD
                    ? 30
                    : 40
                  : 20,
              backgroundColor: colorOfBadge,
            }}
          >
            <Text style={styles.badgeText}>{textOfBadge}</Text>
          </View>
        ) : null}
      </>
    );
  };

  const renderOrderHistory = () => {
    const isDelivered = orderStatusList.find(
      (item) =>
        item!.orderStatus == MEDICINE_ORDER_STATUS.DELIVERED ||
        item!.orderStatus == MEDICINE_ORDER_STATUS.PICKEDUP
    );
    const isCancelled = orderStatusList.find(
      (item) => item!.orderStatus == MEDICINE_ORDER_STATUS.CANCELLED
    );
    const isDeliveryOrder = orderDetails.patientAddressId;
    const tatInfo = orderDetails.orderTat;
    const expectedDeliveryDiff = moment.duration(
      moment(tatInfo! /*'D-MMM-YYYY HH:mm a'*/).diff(moment())
      // moment('27-JAN-2020 10:51 AM').diff(moment())
    );
    const hours = expectedDeliveryDiff.asHours();
    // const formattedDateDeliveryTime =
    //   hours > 0 ? `${hours.toFixed()}hr(s)` : `${expectedDeliveryDiff.asMinutes()}minute(s)`;
    let orderCompleteText =
      orderDetails.deliveryType == MEDICINE_DELIVERY_TYPE.STORE_PICKUP
        ? `Your order no. #${orderAutoId} is successfully picked up on ${isDelivered &&
            isDelivered.statusDate &&
            getFormattedDateTime(isDelivered.statusDate)}.`
        : `Your order no. #${orderAutoId} is successfully delivered on ${isDelivered &&
            isDelivered.statusDate &&
            getFormattedDateTime(isDelivered.statusDate)}.`;

    const showNotifyStoreAlert =
      orderDetails.deliveryType == MEDICINE_DELIVERY_TYPE.STORE_PICKUP &&
      (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.ORDER_VERIFIED ||
        orderDetails.currentStatus == MEDICINE_ORDER_STATUS.READY_AT_STORE);

    const getOrderDescription = (
      status: MEDICINE_ORDER_STATUS,
      isOrderRequirePrescription?: boolean, // if any of the order item requires prescription
      orderCancelText?: string
    ) => {
      const shipment = order?.medicineOrderShipments?.[0];
      const driverDetails = shipment?.driverDetails;
      const shipmentNumber = shipment?.trackingNo;
      const shipmentProvider = shipment?.trackingProvider;
      const showDriverDetails =
        shipmentProvider !== 'Delhivery Express' &&
        driverDetails?.driverName &&
        driverDetails?.driverPhone;
      const showTracking = !!shipmentNumber && shipmentProvider === 'Delhivery Express';

      const renderTrackOrder = (
        <Text
          onPress={() => {
            const url = AppConfig.Configuration.MED_TRACK_SHIPMENT_URL;
            props.navigation.navigate(AppRoutes.CommonWebView, {
              url: url.replace('{{shipmentNumber}}', shipmentNumber!),
              isGoBack: true,
            });
          }}
          style={styles.trackOrder}
        >
          TRACK YOUR SHIPMENT
        </Text>
      );
      const isCartItemsUpdated =
        orderDetails?.medicineOrderShipments?.length > 0 &&
        !isEmptyObject(orderDetails?.medicineOrderShipments?.[0]?.itemDetails!) &&
        checkIsJSON(orderDetails?.medicineOrderShipments?.[0]?.itemDetails!) &&
        JSON.parse(orderDetails?.medicineOrderShipments?.[0]?.itemDetails!);
      const orderStatusDescMapping = {
        [MEDICINE_ORDER_STATUS.ORDER_PLACED]:
          orderDetails?.prescriptionOptionSelected! == 'Call me for details'
            ? orderDetails.medicineOrdersStatus!.find(
                (item) =>
                  item?.orderStatus == MEDICINE_ORDER_STATUS.VERIFICATION_DONE ||
                  item?.orderStatus == MEDICINE_ORDER_STATUS.READY_FOR_VERIFICATION
              )
              ? ['', '']
              : [
                  '',
                  'Chat with Apollo Pharmacist to inform your requirements to process your Order Faster',
                ]
            : orderDetails?.prescriptionOptionSelected! ==
              'Need all medicine and for duration as per prescription'
            ? orderDetails.medicineOrdersStatus!.find(
                (item) =>
                  item?.orderStatus == MEDICINE_ORDER_STATUS.VERIFICATION_DONE ||
                  item?.orderStatus == MEDICINE_ORDER_STATUS.READY_FOR_VERIFICATION
              )
              ? ['', '']
              : [
                  'Verification Pending: ',
                  'Your order is being verified by our pharmacists. Our pharmacists might be required to call you for order verification.',
                ]
            : !isOrderRequirePrescription
            ? ['', '']
            : [
                'Verification Pending: ',
                'Your order is being verified by our pharmacists. Our pharmacists might be required to call you for order verification.',
              ],
        [MEDICINE_ORDER_STATUS.ORDER_VERIFIED]:
          orderDetails.orderType == MEDICINE_ORDER_TYPE.CART_ORDER && isCartItemsUpdated
            ? ['', '']
            : ['Store Assigned: ', 'Your order has been assigned to our pharmacy.'],
        [MEDICINE_ORDER_STATUS.ORDER_BILLED]: [
          '',
          `Your order #${orderAutoId} has been packed. Soon would be dispatched from our pharmacy.`,
        ],
        [MEDICINE_ORDER_STATUS.CANCELLED]: [
          '',
          orderCancelText || `Your order #${orderAutoId} has been cancelled.`,
          extractUrlFromString(orderCancelText || '')
            ? () => {
                Linking.openURL(extractUrlFromString(orderCancelText || '')!).catch((err) =>
                  CommonBugFender(`${AppRoutes.OrderDetailsScene}_getOrderDescription`, err)
                );
              }
            : null,
        ],
        [MEDICINE_ORDER_STATUS.READY_AT_STORE]: [
          '',
          `Your order is ready for pickup at your selected ${addressData}`,
        ],
        [MEDICINE_ORDER_STATUS.SHIPPED]: [
          '',
          showTracking
            ? `Your order has been picked-up by our courier partner and is in-transit. Shipment AWB number is ${shipmentNumber}.`
            : '',
          () => {},
          null,
          // showTracking ? renderTrackOrder : null,
        ],
        [MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY]: [
          '',
          showDriverDetails
            ? `Your order will be delivered soon by our Delivery Associate: ${driverDetails?.driverName}, ${driverDetails?.driverPhone}`
            : showTracking
            ? `Your order #${orderAutoId} has been dispatched via ${shipmentTrackingProvider}, AWB #${shipmentTrackingNumber}.`
            : '',
        ],

        [MEDICINE_ORDER_STATUS.DELIVERED]: [
          '',
          `If you have any issues with your delivered order, please talk to us on our official WhatsApp (8:00 am-8.30 pm) ${AppConfig.Configuration.MED_ORDERS_CUSTOMER_CARE_WHATSAPP_LINK}`,
          () => {
            Linking.openURL(
              AppConfig.Configuration.MED_ORDERS_CUSTOMER_CARE_WHATSAPP_LINK
            ).catch((err) =>
              CommonBugFender(`${AppRoutes.OrderDetailsScene}_getOrderDescription`, err)
            );
          },
        ],
        [MEDICINE_ORDER_STATUS.PAYMENT_FAILED]: [
          '',
          'Order Not Placed! Please try to place the order again with an alternative payment method or Cash on Delivery (COD).',
        ],
        [MEDICINE_ORDER_STATUS.ON_HOLD]: ['Order On-Hold : ', `${reasonForOnHold?.displayText}`],
        [MEDICINE_ORDER_STATUS.RETURN_PICKUP]: [
          '',
          `Your Returned item(s) have been picked up and your refund will be processed shortly.`,
        ],
        [MEDICINE_ORDER_STATUS.RETURN_INITIATED]: [
          '',
          `Your Order is being sent back as we could not deliver your order`,
        ],
        [MEDICINE_ORDER_STATUS.RETURN_REQUEST_CREATED]: [
          '',
          `Our Customer support team may reach out to you for any clarification regarding your return request`,
        ],
        [MEDICINE_ORDER_STATUS.DELIVERY_ATTEMPTED]: [
          '',
          `We will re-attempt delivery later, please be reachable on phone`,
        ],
        [MEDICINE_ORDER_STATUS.RVP_ASSIGNED]: [
          '',
          `Rider/Courier partner has been assigned to pickup your return items, the Rider may call you before he reaches your place`,
        ],
      };

      const isStatusAvailable = Object.keys(orderStatusDescMapping).includes(status);

      return isStatusAvailable
        ? {
            heading: g(orderStatusDescMapping, status as any, '0'),
            description: g(orderStatusDescMapping, status as any, '1'),
            onPress: g(orderStatusDescMapping, status as any, '2'),
            component: g(orderStatusDescMapping, status as any, '3'),
          }
        : null;
    };

    const showExpectedDelivery =
      isDeliveryOrder && tatInfo && !isCancelled && !isDelivered && hours > 0;

    const statusToConsiderTatBreach = [
      MEDICINE_ORDER_STATUS.ORDER_INITIATED,
      MEDICINE_ORDER_STATUS.ORDER_PLACED,
      MEDICINE_ORDER_STATUS.ORDER_VERIFIED,
      MEDICINE_ORDER_STATUS.ORDER_BILLED,
      MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY,
    ];

    const isNotTatBreach = tatInfo == null ? true : moment(tatInfo!).isSameOrAfter(moment(), 'day');
    const shouldScrollToSlot = (isNotTatBreach: boolean) => {
      !isNotTatBreach && statusToConsiderTatBreach.includes(orderDetails.currentStatus!)
        ? null
        : scrollToSlots();
    };

    let statusList = orderStatusList
      .filter(
        (item, idx, array) => array.map((i) => i!.orderStatus).indexOf(item!.orderStatus) === idx
      )
      .concat([]);
    order?.deliveryType != MEDICINE_DELIVERY_TYPE.STORE_PICKUP
      ? shouldScrollToSlot(isNotTatBreach!)
      : scrollToSlots();

    if (
      orderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED ||
      orderDetails.currentStatus == MEDICINE_ORDER_STATUS.RETURN_INITIATED ||
      orderDetails.currentStatus == MEDICINE_ORDER_STATUS.RETURN_ACCEPTED
    ) {
      statusList = orderStatusList
        .filter(
          (item, idx, array) => array.map((i) => i!.orderStatus).indexOf(item!.orderStatus) === idx
        )
        .concat([]);
      order?.deliveryType != MEDICINE_DELIVERY_TYPE.STORE_PICKUP
        ? shouldScrollToSlot(isNotTatBreach!)
        : scrollToSlots();
    } else if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.ORDER_INITIATED) {
      statusList = orderStatusList
        .filter(
          (item, idx, array) => array.map((i) => i!.orderStatus).indexOf(item!.orderStatus) === idx
        )
        .concat(
          orderDetails.deliveryType == MEDICINE_DELIVERY_TYPE.STORE_PICKUP
            ? [
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.ORDER_PLACED,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.ORDER_VERIFIED,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.READY_AT_STORE,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.PICKEDUP,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
              ]
            : [
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.ORDER_PLACED,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.ORDER_VERIFIED,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.ORDER_BILLED,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.DELIVERED,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
              ]
        );
      order?.deliveryType != MEDICINE_DELIVERY_TYPE.STORE_PICKUP
        ? shouldScrollToSlot(isNotTatBreach!)
        : scrollToSlots();
    } else if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.ORDER_PLACED) {
      statusList = orderStatusList
        .filter(
          (item, idx, array) => array.map((i) => i!.orderStatus).indexOf(item!.orderStatus) === idx
        )
        .concat(
          orderDetails.deliveryType == MEDICINE_DELIVERY_TYPE.STORE_PICKUP
            ? [
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.ORDER_VERIFIED,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.READY_AT_STORE,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.PICKEDUP,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
              ]
            : [
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.ORDER_VERIFIED,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,

                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.ORDER_BILLED,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.DELIVERED,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
              ]
        );
      order?.deliveryType != MEDICINE_DELIVERY_TYPE.STORE_PICKUP
        ? shouldScrollToSlot(isNotTatBreach!)
        : scrollToSlots();
    }
    //added for on-hold
    else if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.ON_HOLD) {
      statusList = orderStatusList
        .filter(
          (item, idx, array) => array.map((i) => i!.orderStatus).indexOf(item!.orderStatus) === idx
        )
        .concat(
          orderDetails.deliveryType == MEDICINE_DELIVERY_TYPE.STORE_PICKUP
            ? [
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.ORDER_VERIFIED,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.READY_AT_STORE,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.PICKEDUP,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
              ]
            : [
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.ORDER_VERIFIED,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.ORDER_BILLED,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.DELIVERED,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
              ]
        );
      order?.deliveryType != MEDICINE_DELIVERY_TYPE.STORE_PICKUP
        ? shouldScrollToSlot(isNotTatBreach!)
        : scrollToSlots();
    } else if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.ORDER_VERIFIED) {
      statusList = orderStatusList
        .filter(
          (item, idx, array) => array.map((i) => i!.orderStatus).indexOf(item!.orderStatus) === idx
        )
        .concat(
          orderDetails.deliveryType == MEDICINE_DELIVERY_TYPE.STORE_PICKUP
            ? [
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.READY_AT_STORE,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.PICKEDUP,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
              ]
            : [
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.ORDER_BILLED,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
                {
                  statusDate: tatInfo,
                  id: 'idToBeDelivered',
                  orderStatus: MEDICINE_ORDER_STATUS.DELIVERED,
                } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
              ]
        );
      order?.deliveryType != MEDICINE_DELIVERY_TYPE.STORE_PICKUP
        ? shouldScrollToSlot(isNotTatBreach!)
        : scrollToSlots();
    } else if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.READY_AT_STORE) {
      statusList = orderStatusList
        .filter(
          (item, idx, array) => array.map((i) => i!.orderStatus).indexOf(item!.orderStatus) === idx
        )
        .concat([
          {
            statusDate: tatInfo,
            id: 'idToBeDelivered',
            orderStatus: MEDICINE_ORDER_STATUS.PICKEDUP,
          } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
        ]);
      order?.deliveryType != MEDICINE_DELIVERY_TYPE.STORE_PICKUP
        ? shouldScrollToSlot(isNotTatBreach!)
        : scrollToSlots();
    } else if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.ORDER_BILLED) {
      statusList = orderStatusList
        .filter(
          (item, idx, array) => array.map((i) => i!.orderStatus).indexOf(item!.orderStatus) === idx
        )
        .concat([
          {
            statusDate: tatInfo,
            id: 'idToBeDelivered',
            orderStatus: MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY,
          } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
          {
            statusDate: tatInfo,
            id: 'idToBeDelivered',
            orderStatus: MEDICINE_ORDER_STATUS.DELIVERED,
          } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
        ]);
      order?.deliveryType != MEDICINE_DELIVERY_TYPE.STORE_PICKUP
        ? shouldScrollToSlot(isNotTatBreach!)
        : scrollToSlots();
    } else if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY) {
      statusList = orderStatusList
        .filter(
          (item, idx, array) => array.map((i) => i!.orderStatus).indexOf(item!.orderStatus) === idx
        )
        .concat([
          {
            statusDate: tatInfo,
            id: 'idToBeDelivered',
            orderStatus: MEDICINE_ORDER_STATUS.DELIVERED,
          } as getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails_medicineOrdersStatus,
        ]);
      order?.deliveryType != MEDICINE_DELIVERY_TYPE.STORE_PICKUP
        ? shouldScrollToSlot(isNotTatBreach!)
        : scrollToSlots();
    } else if (
      orderDetails.currentStatus == MEDICINE_ORDER_STATUS.DELIVERED ||
      orderDetails.currentStatus == MEDICINE_ORDER_STATUS.PICKEDUP
    ) {
      statusList = orderStatusList
        .filter(
          (item, idx, array) => array.map((i) => i!.orderStatus).indexOf(item!.orderStatus) === idx
        )
        .concat([]);
      order?.deliveryType != MEDICINE_DELIVERY_TYPE.STORE_PICKUP
        ? shouldScrollToSlot(isNotTatBreach!)
        : scrollToSlots();
    }
    console.log({ orderDetails });

    const cartObject = {
      heading: '',
      description: 'Please check your items in order summary to ensure they are correct.',
      showOption: true,
    };
    const nonCartObject = {
      heading: '',
      description: 'Items added to the order by our pharmacist as per your instructions.',
      showOption: true,
    };
    console.log({ reasonForOnHold });
    const isOrderOnHoldOption = onHoldOptionOrder.filter((item) => item.id == orderAutoId);

    const renderCourierTrackingCta = () => {
      const isDelhiveryOrder =
        (shipmentTrackingProvider || '').toLowerCase().indexOf('delhivery') > -1;
      if (!!shipmentTrackingUrl || isDelhiveryOrder) {
        return (
          <Button
            style={styles.trackingOrderCta}
            onPress={() => {
              if (!!shipmentTrackingUrl) {
                props.navigation.navigate(AppRoutes.CommonWebView, {
                  url: shipmentTrackingUrl,
                  isGoBack: true,
                });
              } else if (isDelhiveryOrder) {
                const shipmentNumber = order?.medicineOrderShipments?.[0]?.trackingNo;
                const url = AppConfig.Configuration.MED_TRACK_SHIPMENT_URL;
                props.navigation.navigate(AppRoutes.CommonWebView, {
                  url: url.replace('{{shipmentNumber}}', shipmentNumber),
                  isGoBack: true,
                });
              }
            }}
            title={'TRACK COURIER STATUS'}
          />
        );
      }
    };

    return (
      <View>
        <View style={{ margin: 20 }}>
          {statusList.map((order, index, array) => {
            return (
              <OrderProgressCard
                onLayout={(event) => {
                  const layout = event.nativeEvent.layout;
                  if (orderDetails.currentStatus == order!.orderStatus) {
                    setScrollYValue(layout.y);
                  }
                }}
                style={index < array.length - 1 ? { marginBottom: 8 } : {}}
                key={index}
                description={
                  order!.id == 'idToBeDelivered'
                    ? `To Be Delivered Within — ${expectedDeliveryDiff
                        .humanize()
                        .replace(' hours', 'hrs')}`
                    : ''
                }
                showCurrentStatusDesc={
                  reasonForOnHold?.showOnHold &&
                  orderDetails.currentStatus == MEDICINE_ORDER_STATUS.ON_HOLD &&
                  order!.orderStatus == MEDICINE_ORDER_STATUS.ORDER_PLACED
                    ? true
                    : orderDetails.currentStatus == order!.orderStatus
                }
                isOnHold={reasonForOnHold?.showOnHold} //change
                getOrderDescription={getOrderDescription(
                  orderDetails.currentStatus!,
                  prescriptionRequired,
                  (orderCancel && orderCancel.statusMessage) || ''
                )}
                status={getOrderStatusText(order!.orderStatus!)}
                date={getFormattedDate(order!.statusDate)}
                time={getFormattedTime(order!.statusDate)}
                showReUploadPrescription={reasonForOnHold?.reUploadPrescription}
                shouldShowReUploadOption={isOrderOnHoldOption.length > 0 ? false : true}
                showChatWithUs={reasonForOnHold?.enableChatSupport}
                reUploadPrescription={() => onPressReUploadPrescription()}
                isStatusDone={order!.id != 'idToBeDelivered'}
                nextItemStatus={
                  index == array.length - 1
                    ? 'NOT_EXIST'
                    : order!.id != 'idToBeDelivered' && showExpectedDelivery
                    ? 'NOT_DONE'
                    : 'DONE'
                }
                showDescriptionChatOption={
                  orderDetails?.currentStatus! == MEDICINE_ORDER_STATUS.ORDER_PLACED &&
                  !prescriptionRequired &&
                  orderDetails?.prescriptionOptionSelected! &&
                  orderDetails?.prescriptionOptionSelected! == 'Call me for details' &&
                  !orderDetails?.medicineOrdersStatus!.find(
                    (item) => item?.orderStatus == MEDICINE_ORDER_STATUS.VERIFICATION_DONE
                  )
                    ? true
                    : false
                }
                showNewItemsDescription={
                  statusToShowNewItems.includes(orderDetails?.currentStatus!) &&
                  orderDetails.orderTat! &&
                  (orderDetails.orderType == MEDICINE_ORDER_TYPE.CART_ORDER
                    ? orderDetails?.medicineOrderShipments?.length > 0
                    : orderDetails?.medicineOrderLineItems?.length > 0)
                    ? true
                    : false
                }
                newItemsDescription={
                  orderDetails.orderType == MEDICINE_ORDER_TYPE.UPLOAD_PRESCRIPTION
                    ? nonCartObject
                    : cartObject
                }
                onPressViewSummary={() => _navigateToViewSummary()}
                orderType={orderDetails.orderType}
                isPrescriptionUploaded={orderDetails.prescriptionImageUrl}
              />
            );
          })}
        </View>
        {refundDetails && refundDetails.length != 0 && (
          <RefundDetails
            refunds={refundDetails}
            paymentDetails={paymentDetails ? paymentDetails : []}
            navigaitonProps={props.navigation}
          />
        )}
        {(orderDetails?.currentStatus === MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY ||
          orderDetails?.currentStatus === MEDICINE_ORDER_STATUS.SHIPPED) &&
          renderCourierTrackingCta()}
        {isDelivered ? (
          <View
            style={{
              borderTopColor: 'rgba(2,71,91,0.3)',
              borderTopWidth: 0.5,
              paddingHorizontal: 45,
              paddingTop: 12,
              paddingBottom: 25.5,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                marginBottom: 6,
                ...theme.viewStyles.text('M', 13, '#01475b', 1, 21),
              }}
            >
              {orderCompleteText}
            </Text>
            <Text
              style={{
                textAlign: 'center',
                marginBottom: 12,
                ...theme.viewStyles.text('SB', 13, '#01475b', 1, 21),
              }}
            >
              {'Thank You for choosing Apollo 24|7'}
            </Text>
            {!!showRateDeliveryBtn && (
              <Button
                style={{ flex: 1, width: '95%', marginBottom: 20, alignSelf: 'center' }}
                onPress={() => setShowFeedbackPopup(true)}
                titleTextStyle={{
                  ...theme.viewStyles.text(
                    'B',
                    isIphone5s() ? 11 : 13,
                    theme.colors.BUTTON_TEXT,
                    1,
                    24
                  ),
                }}
                title={'RATE YOUR DELIVERY EXPERIENCE'}
              />
            )}
          </View>
        ) : null}
        {showNotifyStoreAlert && renderNotifyStoreAlert()}
      </View>
    );
  };

  const _navigateToViewSummary = () => {
    setSelectedTab(string.orders.viewBill);
  };

  const onPressReUploadPrescription = () => {
    setPrescriptionPopUp(true);
  };
  const renderUploadPrescriptionPopUp = () => {
    return (
      <UploadPrescriprionPopup
        type={'Re-Upload'}
        isVisible={showPrescriptionPopup}
        disabledOption="NONE"
        heading={'Re-Upload Prescription(s)'}
        instructionHeading={'Instructions For Uploading Prescriptions'}
        instructions={[
          'Take clear picture of your complete prescription. (edge to edge)',
          'Doctor details & date of the prescription should be clearly visible.',
          'Ensure a valid prescription, for acute illnesses such as Virals, infections etc a recent prescription is required. For Chronic illnesses such as Blood pressure & diabetes, upto 1 year old prescriptions are acceptable',
        ]}
        optionTexts={{
          camera: 'TAKE A PHOTO',
          gallery: 'CHOOSE\nFROM GALLERY',
          prescription: 'SELECT FROM\nE-PRESCRIPTION',
        }}
        onClickClose={() => setPrescriptionPopUp(false)}
        onResponse={(selectedType, response, type) => {
          setPrescriptionPopUp(false);
          if (selectedType == 'CAMERA_AND_GALLERY') {
            if (response.length == 0) return;
            setPhysicalPrescriptions && setPhysicalPrescriptions(response);
            props.navigation.navigate(AppRoutes.UploadPrescription, {
              phyPrescriptionsProp: response,
              type,
              showOptions: false,
              isReUpload: true,
              orderAutoId: orderAutoId,
            });
          } else {
            setSelectPrescriptionVisible(true);
          }
        }}
      />
    );
  };
  const renderEPrescriptionModal = () => {
    return (
      <SelectEPrescriptionModal
        displayPrismRecords={true}
        navigation={props.navigation}
        onSubmit={(selectedEPres) => {
          setSelectPrescriptionVisible(false);
          if (selectedEPres.length == 0) {
            return;
          }
          setEPrescriptions && setEPrescriptions(selectedEPres);
          props.navigation.navigate(AppRoutes.UploadPrescription, {
            ePrescriptionsProp: selectedEPres,
            type: 'E-Prescription',
            showOptions: false,
            isReUpload: true,
            orderAutoId: orderAutoId,
          });
        }}
        selectedEprescriptionIds={[]}
        isVisible={isSelectPrescriptionVisible}
      />
    );
  };

  const renderInconvenienceView = () => {
    const patientWhtsappQuery = `I have a query regarding my order. Status_${
      orderDetails?.currentStatus
    }, ID: ${billNumber || orderAutoId}`;
    return (
      <View style={styles.chatView}>
        <Text style={styles.queryText}>In case of any issues/queries:</Text>
        <ChatWithUs text={patientWhtsappQuery} />
      </View>
    );
  };

  const renderNotifyStoreAlert = () => {
    return (
      <View
        style={{
          borderTopWidth: 0.5,
          borderTopColor: theme.colors.SEPARATOR_LINE,
          marginBottom: 30,
        }}
      >
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            margin: 10,
            marginLeft: 20,
          }}
        >
          <NotificationIcon />
          <Text
            style={{
              ...theme.fonts.IBMPlexSansSemiBold(13),
              color: theme.colors.LIGHT_BLUE,
              marginLeft: 10,
            }}
          >
            NOTIFY STORE
          </Text>
        </View>
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginLeft: 20,
            marginRight: 20,
            padding: 20,
          }}
        >
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(13),
              color: theme.colors.LIGHT_BLUE,
            }}
          >
            Kindly alert the store 10 minutes before you are about to reach, so that we can keep the
            items ready!
          </Text>
          <View style={styles.flexRow}>
            <Text
              style={{
                ...theme.fonts.IBMPlexSansMedium(13),
                color: theme.colors.LIGHT_BLUE,
                marginTop: 10,
              }}
            >
              Stores Contact No. :{' '}
            </Text>
            <Text
              style={{
                ...theme.fonts.IBMPlexSansMedium(13),
                color: theme.colors.LIGHT_BLUE,
                marginTop: 10,
                opacity: 0.7,
              }}
            >
              {storePhoneNumber}
            </Text>
          </View>
          <View
            style={[
              styles.flexRow,
              { justifyContent: showAlertStore ? 'space-between' : 'flex-end', marginTop: 15 },
            ]}
          >
            {showAlertStore && (
              <TouchableOpacity onPress={() => alertTheStore()}>
                <Text
                  style={{
                    color: theme.colors.APP_YELLOW,
                    ...theme.fonts.IBMPlexSansBold(13),
                  }}
                >
                  ALERT THE STORE
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${storePhoneNumber}`)}>
              <Text
                style={{
                  color: theme.colors.APP_YELLOW,
                  ...theme.fonts.IBMPlexSansBold(13),
                }}
              >
                CALL THE STORE
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const alertTheStore = () => {
    setShowSpinner(true);
    const variables: alertMedicineOrderPickupVariables = {
      alertMedicineOrderPickupInput: {
        orderId: typeof orderAutoId == 'string' ? parseInt(orderAutoId, 10) : orderAutoId,
        patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
        remarks: '',
      },
    };

    client
      .mutate<alertMedicineOrderPickup, alertMedicineOrderPickupVariables>({
        mutation: ALERT_MEDICINE_ORDER_PICKUP,
        variables,
      })
      .then(({ data }) => {
        setShowSpinner(false);
        aphConsole.log({
          s: data,
        });
        props.navigation.dispatch(
          StackActions.reset({
            index: 0,
            key: null,
            actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
          })
        );
        renderSuccessPopup();
      })
      .catch((e) => {
        CommonBugFender('OrderDetailsScene_onPressSendAlertToStore_ALERT_MEDICINE_ORDER_PICKUP', e);
        setShowSpinner(false);
        handleGraphQlError(e);
      });
  };

  const renderSuccessPopup = () =>
    showAphAlert!({
      title: `Hi ${currentPatient.firstName} :)`,
      description: 'Your store has been alerted.',
      ctaContainerStyle: { justifyContent: 'flex-end' },
      CTAs: [
        {
          text: 'OK, GOT IT',
          type: 'orange-link',
          onPress: () => hideAphAlert!(),
        },
      ],
    });

  const [selectedReason, setSelectedReason] = useState('');
  const [comment, setComment] = useState('');
  const [overlayDropdown, setOverlayDropdown] = useState(false);
  const renderReturnOrderOverlay = () => {
    const optionsDropdown = overlayDropdown && (
      <Overlay
        onBackdropPress={() => setOverlayDropdown(false)}
        isVisible={overlayDropdown}
        overlayStyle={styles.dropdownOverlayStyle}
      >
        <DropDown
          cardContainer={{
            margin: 0,
          }}
          options={cancellationReasons.map(
            (cancellationReasons, i) =>
              ({
                onPress: () => {
                  setSelectedReason(cancellationReasons.description!);
                  setOverlayDropdown(false);
                },
                optionText: cancellationReasons.description,
              } as Option)
          )}
        />
      </Overlay>
    );

    const heading = (
      <View
        style={{
          ...theme.viewStyles.cardContainer,
          backgroundColor: theme.colors.WHITE,
          padding: 18,
          marginBottom: 24,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        }}
      >
        <Text
          style={{
            ...theme.fonts.IBMPlexSansMedium(16),
            color: theme.colors.SHERPA_BLUE,
            textAlign: 'center',
          }}
        >
          Cancel Order
        </Text>
      </View>
    );

    const content = (
      <View style={{ paddingHorizontal: 16 }}>
        <Text
          style={[
            {
              marginBottom: 12,
              color: '#0087ba',
              ...theme.fonts.IBMPlexSansMedium(17),
              lineHeight: 24,
            },
          ]}
        >
          Why are you cancelling this order?
        </Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setOverlayDropdown(true);
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={[
                {
                  flex: 0.9,
                  ...theme.fonts.IBMPlexSansMedium(18),
                  color: theme.colors.SHERPA_BLUE,
                },
                selectedReason ? {} : { opacity: 0.3 },
              ]}
              numberOfLines={1}
            >
              {selectedReason || 'Select reason for cancelling'}
            </Text>
            <View style={{ flex: 0.1 }}>
              <DropdownGreen style={{ alignSelf: 'flex-end' }} />
            </View>
          </View>
          <View
            style={{
              marginTop: 5,
              backgroundColor: '#00b38e',
              height: 2,
            }}
          />
        </TouchableOpacity>
        <TextInputComponent
          value={comment}
          onChangeText={(text) => {
            setComment(text);
          }}
          label={'Add Comments (Optional)'}
          placeholder={'Enter your comments here…'}
        />
      </View>
    );

    const bottomButton = (
      <Button
        style={{ margin: 16, marginTop: 32, width: 'auto' }}
        onPress={onPressConfirmCancelOrder}
        disabled={!!!selectedReason}
        title={'SUBMIT REQUEST'}
      />
    );

    return (
      isCancelVisible && (
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            position: 'absolute',
            width: '100%',
            height: '100%',
            justifyContent: 'flex-start',
            flex: 1,
            left: 0,
            right: 0,
            zIndex: 100,
          }}
        >
          <View style={{ marginHorizontal: 20 }}>
            <TouchableOpacity
              style={{ marginTop: 38, alignSelf: 'flex-end' }}
              onPress={() => {
                setCancelVisible(!isCancelVisible);
                setSelectedReason('');
                setComment('');
              }}
            >
              <CrossPopup />
            </TouchableOpacity>
            <View style={{ height: 16 }} />
            <View
              style={{
                backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                borderBottomRightRadius: 10,
                borderBottomLeftRadius: 10,
              }}
            >
              {optionsDropdown}
              {heading}
              {content}
              {bottomButton}
            </View>
          </View>
        </View>
      )
    );
  };

  const getFormattedOrderPlacedDateTime = (
    orderDetails: getMedicineOrderOMSDetailsWithAddress_getMedicineOrderOMSDetailsWithAddress_medicineOrderDetails
  ) => {
    const medicineOrdersStatus = g(orderDetails, 'medicineOrdersStatus') || [];
    const statusDate = g(medicineOrdersStatus[0], 'statusDate');
    return moment(statusDate).format('ddd, D MMMM, hh:mm A');
  };

  const renderOrderSummary = () => {
    scrollToSlots();
    const eventAttributes: WebEngageEvents[WebEngageEventName.ORDER_SUMMARY_CLICKED] = {
      orderId: orderDetails.id,
      orderDate: getFormattedOrderPlacedDateTime(orderDetails),
      orderType: !!g(order, 'billNumber')
        ? 'Offline'
        : orderDetails.orderType == MEDICINE_ORDER_TYPE.UPLOAD_PRESCRIPTION
        ? 'Non Cart'
        : 'Cart',
      customerId: currentPatient && currentPatient.id,
      deliveryDate: orderDetails.orderTat
        ? moment(orderDetails.orderTat).format('ddd, D MMMM, hh:mm A')
        : '',
      mobileNumber: currentPatient && currentPatient.mobileNumber,
      orderStatus: orderDetails.currentStatus!,
    };
    postWebEngageEvent(WebEngageEventName.ORDER_SUMMARY_CLICKED, eventAttributes);
    return (
      <View>
        <OrderSummary
          orderDetails={orderDetails as any}
          addressData={addressData}
          onBillChangesClick={onBillChangesClick}
        />
        <View style={{ marginTop: 30 }} />
      </View>
    );
  };

  const onBillChangesClick = () => {
    props.navigation.navigate(AppRoutes.OrderModifiedScreen, {
      orderDetails: orderDetails,
    });
  };

  const onPressConfirmCancelOrder = () => {
    setShowSpinner(true);
    const variables: CancelMedicineOrderOMSVariables = {
      medicineOrderCancelOMSInput: {
        orderNo: typeof orderAutoId == 'string' ? parseInt(orderAutoId, 10) : orderAutoId,
        cancelReasonCode:
          cancellationReasons &&
          cancellationReasons.find((item) => item.description == selectedReason)!.reasonCode,
        cancelReasonText: comment,
      },
    };

    console.log(JSON.stringify(variables));

    client
      .mutate<CancelMedicineOrderOMS, CancelMedicineOrderOMSVariables>({
        mutation: CANCEL_MEDICINE_ORDER_OMS,
        variables,
      })
      .then(({ data }) => {
        aphConsole.log({
          s: data,
        });
        const setInitialSate = () => {
          setShowSpinner(false);
          setCancelVisible(false);
          setComment('');
          setSelectedReason('');
        };
        const requestStatus = g(data, 'cancelMedicineOrderOMS', 'orderStatus');
        if (requestStatus == MEDICINE_ORDER_STATUS.CANCEL_REQUEST) {
          showAphAlert &&
            showAphAlert({
              title: 'Hi :)',
              description:
                'Your cancellation request has been accepted and order is cancelled. If prepaid, the amount paid will be refunded automatically.',
            });
          refetch()
            .then(() => {
              setInitialSate();
            })
            .catch((e) => {
              CommonBugFender('OrderDetailsScene_refetch', e);
              setInitialSate();
            });
          refetchOrders && refetchOrders();
        } else {
          Alert.alert('Error', g(data, 'cancelMedicineOrderOMS', 'orderStatus')!);
        }
      })
      .catch((e) => {
        CommonBugFender('OrderDetailsScene_onPressConfirmCancelOrder_SAVE_ORDER_CANCEL_STATUS', e);
        setShowSpinner(false);
        handleGraphQlError(e);
      });
  };

  const getCancellationReasons = () => {
    setShowSpinner(true);
    client
      .query<GetMedicineOrderCancelReasons>({
        query: GET_MEDICINE_ORDER_CANCEL_REASONS,
        variables: {},
        fetchPolicy: 'no-cache',
      })
      .then((data) => {
        if (
          data.data.getMedicineOrderCancelReasons &&
          data.data.getMedicineOrderCancelReasons.cancellationReasons &&
          data.data.getMedicineOrderCancelReasons.cancellationReasons.length > 0
        ) {
          let cancellationArray: any = [];
          data.data.getMedicineOrderCancelReasons.cancellationReasons.forEach(
            (cancellationReasons, index) => {
              if (cancellationReasons && cancellationReasons.isUserReason) {
                cancellationArray.push(cancellationReasons);
              }
            }
          );
          setCancellationReasons(cancellationArray);
          setCancelVisible(true);
        }
      })
      .catch((error) => {
        handleGraphQlError(error);
      })
      .finally(() => {
        setShowSpinner(false);
      });
  };

  const [showSpinner, setShowSpinner] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);

  const renderMoreMenu = () => {
    if (isOrderCancelNotAllowed(order!)) {
      return null;
    }
    return (
      <MaterialMenu
        options={['Cancel Order'].map((item) => ({
          key: item,
          value: item,
        }))}
        menuContainerStyle={{
          alignItems: 'center',
          marginTop: 24,
        }}
        lastContainerStyle={{ borderBottomWidth: 0 }}
        bottomPadding={{ paddingBottom: 0 }}
        itemTextStyle={{ ...theme.viewStyles.text('M', 16, '#01475b') }}
        onPress={(item) => {
          if (item.value == 'Cancel Order') {
            showCancelOrder();
          }
        }}
      >
        <More style={{ marginLeft: 10 }} />
      </MaterialMenu>
    );
  };

  const renderHelpHeader = () => {
    return (
      <TouchableOpacity activeOpacity={1} style={{ paddingLeft: 10 }} onPress={onPressHelp}>
        <Text style={styles.helpTextStyle}>{string.help.toUpperCase()}</Text>
      </TouchableOpacity>
    );
  };

  const renderRightComponent = () => {
    return (
      <View style={styles.headerViewStyle}>
        {renderHelpHeader()}
        {renderMoreMenu()}
      </View>
    );
  };

  const showCancelOrder = () => {
    const isOrderBilled = order?.currentStatus === MEDICINE_ORDER_STATUS.ORDER_BILLED;
    if (isOrderBilled) {
      showAphAlert!({
        title: string.common.uhOh,
        description: string.OrderSummery.orderCancellationAfterBillingAlert,
        ctaContainerStyle: { justifyContent: 'flex-end' },
        CTAs: [
          {
            text: 'CLICK HERE',
            type: 'orange-link',
            onPress: () => {
              Linking.openURL(
                AppConfig.Configuration.MED_ORDERS_CUSTOMER_CARE_WHATSAPP_LINK
              ).catch((err) =>
                CommonBugFender(`${AppRoutes.OrderDetailsScene}_Linking.openURL`, err)
              );
              hideAphAlert!();
            },
          },
        ],
      });
    } else {
      getCancellationReasons();
    }
  };

  const onPressHelp = () => {
    const currentStatusDate = order?.medicineOrdersStatus?.find(
      (i) => i?.orderStatus === order?.currentStatus
    )?.statusDate;
    const { category } = NeedHelp[0];
    let breadCrudArray: BreadcrumbProps['links'] =
      breadCrumb?.length > 1
        ? [...breadCrumb, { title: string.help }]
        : [
            { title: string.needHelp },
            { title: category },
            { title: string.productDetail },
            { title: string.help },
          ];
    props.navigation.navigate(AppRoutes.NeedHelpQueryDetails, {
      isOrderRelatedIssue: true,
      medicineOrderStatus: order?.currentStatus,
      orderId: billNumber || orderAutoId,
      queryCategory,
      medicineOrderStatusDate: currentStatusDate,
      email,
      breadCrumb: breadCrudArray,
      fromOrderFlow: true,
    });
  };

  const renderHelpButton = () => {
    const currentStatusDate = order?.medicineOrdersStatus?.find(
      (i) => i?.orderStatus === order?.currentStatus
    )?.statusDate;
    const onPress = () => {
      props.navigation.navigate(AppRoutes.NeedHelpQueryDetails, {
        isOrderRelatedIssue: true,
        medicineOrderStatus: order?.currentStatus,
        orderId: billNumber || orderAutoId,
        medicineOrderStatusDate: currentStatusDate,
        queryCategory,
        email,
        breadCrumb: [...breadCrumb, { title: string.help }] as BreadcrumbProps['links'],
      });
    };
    return (
      !!isOrderHelp && (
        <TouchableOpacity onPress={onPress} style={styles.helpButtonView}>
          <Text style={styles.helpButtonText}>{string.help.toUpperCase()}</Text>
        </TouchableOpacity>
      )
    );
  };

  const renderReOrderButton = () => {
    const showReOrder = isOrderHelp
      ? false
      : orderCancel?.orderStatus == MEDICINE_ORDER_STATUS.CANCELLED ||
        orderDetails?.currentStatus == MEDICINE_ORDER_STATUS.RETURN_INITIATED ||
        orderDetails?.currentStatus == MEDICINE_ORDER_STATUS.PURCHASED_IN_STORE;
    return (
      !!showReOrder && (
        <View>
          {Array.from({ length: 10 })
            .reverse()
            .map((_, idx) => (
              <View style={[styles.reOrderButtonTransparentTopView, { top: -(idx + 1) * 2 }]} />
            ))}
          <Button
            style={{ width: '74.16%', alignSelf: 'center', marginTop: 9, marginBottom: 17 }}
            onPress={reOrder}
            title={'RE ORDER'}
          />
        </View>
      )
    );
  };

  const renderMedicineReOrderOverlay = () => {
    const { total, unavailable } = reOrderDetails;
    return (
      !!total && (
        <MedicineReOrderOverlay
          itemDetails={{ total, unavailable }}
          onContinue={() => {
            setReOrderDetails({ total: 0, unavailable: [] });
            props.navigation.navigate(AppRoutes.MedicineCart);
          }}
          onClose={() => {
            setReOrderDetails({ total: 0, unavailable: [] });
          }}
        />
      )
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {renderReturnOrderOverlay()}
      <SafeAreaView style={theme.viewStyles.container}>
        <View style={styles.headerShadowContainer}>
          <Header
            leftIcon="backArrow"
            title={'ORDER DETAILS'}
            container={{ borderBottomWidth: 0 }}
            rightComponent={renderRightComponent()}
            onPressLeftIcon={() => {
              handleBack();
            }}
          />
        </View>

        {omsAPIError && !order && !loading ? (
          <View style={{ alignItems: 'center' }}>
            <Card
              cardContainer={styles.card}
              heading={string.common.uhOh}
              description={'Seems like we are having an issue. Please try again.'}
              descriptionTextStyle={{ fontSize: 14 }}
              headingTextStyle={{ fontSize: 14 }}
            />
            <TouchableOpacity
              activeOpacity={1}
              onPress={async () => {
                try {
                  setLoading!(true);
                  await refetch();
                  setLoading!(false);
                } catch (error) {
                  setLoading!(false);
                }
              }}
            >
              <RetryButtonIcon style={styles.retyButton} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TabsComponent
              style={styles.tabsContainer}
              tabViewStyle={offlineOrderBillNumber ? { borderBottomColor: 'transparent' } : {}}
              onChange={(title) => {
                const nonCartOrderBilledStatusArray = [
                  MEDICINE_ORDER_STATUS.ORDER_BILLED,
                  MEDICINE_ORDER_STATUS.READY_AT_STORE,
                  MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY,
                  MEDICINE_ORDER_STATUS.DELIVERED,
                ];
                const isNonCartOrderBilled = orderStatusList.find(
                  (item) => nonCartOrderBilledStatusArray.indexOf(g(item, 'orderStatus')!) !== -1
                );

                const enableOrderSummary =
                  orderDetails.orderType == MEDICINE_ORDER_TYPE.CART_ORDER
                    ? true
                    : orderDetails.orderType == MEDICINE_ORDER_TYPE.UPLOAD_PRESCRIPTION
                    ? orderDetails.orderTat! && orderDetails?.medicineOrderLineItems!.length > 0
                      ? true
                      : isNonCartOrderBilled
                    : true;

                if (enableOrderSummary) {
                  setSelectedTab(title);
                }
              }}
              data={
                offlineOrderBillNumber
                  ? [{ title: string.orders.viewBill }]
                  : [{ title: string.orders.trackOrder }, { title: string.orders.viewBill }]
              }
              selectedTab={selectedTab}
            />
            {selectedTab == string.orders.trackOrder && renderOrderTrackTopView()}
            {!hideWhtsappQueryOption && renderInconvenienceView()}
            <ScrollView bounces={false} ref={scrollViewRef}>
              {selectedTab == string.orders.trackOrder
                ? renderOrderHistory()
                : !loading && renderOrderSummary()}
            </ScrollView>
            {renderReOrderButton()}
            {/* {renderHelpButton()} */}
          </>
        )}
      </SafeAreaView>
      {renderFeedbackPopup()}
      {(loading || showSpinner) && <Spinner style={{ zIndex: 200 }} />}
      {renderMedicineReOrderOverlay()}
      {isSelectPrescriptionVisible && renderEPrescriptionModal()}
      {showPrescriptionPopup && renderUploadPrescriptionPopUp()}
    </View>
  );
};

export const isOrderCancelNotAllowed = (order: MedOrder) => {
  const currentStatus = order?.currentStatus;
  const statusIrrespectiveOfCurrent = [
    MEDICINE_ORDER_STATUS.DELIVERED,
    MEDICINE_ORDER_STATUS.CANCELLED,
    MEDICINE_ORDER_STATUS.ORDER_BILLED,
    MEDICINE_ORDER_STATUS.PURCHASED_IN_STORE,
  ];
  const statusWrtCurrent = [
    MEDICINE_ORDER_STATUS.PAYMENT_SUCCESS,
    MEDICINE_ORDER_STATUS.ORDER_INITIATED,
    MEDICINE_ORDER_STATUS.PAYMENT_FAILED,
    MEDICINE_ORDER_STATUS.PAYMENT_PENDING,
    MEDICINE_ORDER_STATUS.PAYMENT_ABORTED,
    MEDICINE_ORDER_STATUS.ORDER_FAILED,
  ];
  const cancelNotAllowedIrrespectiveOfCurrentStatus = order?.medicineOrdersStatus?.find((item) =>
    statusIrrespectiveOfCurrent.includes(item?.orderStatus!)
  );
  const cancelNotAllowedWrtCurrentStatus = statusWrtCurrent.includes(currentStatus!);

  return cancelNotAllowedWrtCurrentStatus || cancelNotAllowedIrrespectiveOfCurrentStatus;
};

const { text } = theme.viewStyles;
const { APP_YELLOW, WHITE } = theme.colors;
const styles = StyleSheet.create({
  headerShadowContainer: {
    backgroundColor: theme.colors.WHITE,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
    zIndex: 1,
  },
  tabsContainer: {
    ...theme.viewStyles.cardViewStyle,
    elevation: 4,
    borderRadius: 0,
    backgroundColor: theme.colors.CARD_BG,
    borderBottomColor: 'rgba(2, 71, 91, 0.3)',
  },
  dropdownOverlayStyle: {
    padding: 0,
    margin: 0,
    height: 'auto',
    borderRadius: 10,
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  trackOrder: {
    ...text('B', 14, APP_YELLOW),
    textAlign: 'right',
    padding: 5,
  },
  reOrderButtonTransparentTopView: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(247,248,245,0.2)',
  },
  card: {
    marginHorizontal: 64,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'white',
    elevation: 0,
  },
  retyButton: { width: 185, height: 48, marginTop: 30 },
  cardStyle: {
    flexDirection: 'row',
    ...theme.viewStyles.cardViewStyle,
    padding: 16,
    marginBottom: 8,
    flex: 1,
  },
  pendingIconStyle: { height: 20, width: 20, resizeMode: 'contain' },
  inconvenienceText: {
    marginHorizontal: 10,
    ...theme.fonts.IBMPlexSansRegular(13),
    color: theme.colors.SHERPA_BLUE,
  },
  badgeText: { ...theme.viewStyles.text('M', 12, colors.WHITE, 1, 24), padding: 5, paddingTop: 2 },
  helpButtonView: {
    backgroundColor: WHITE,
  },
  helpButtonText: {
    ...text('B', 13, APP_YELLOW),
    margin: 15,
    textAlign: 'center',
  },
  deliveryOuterview: { flex: 1 },
  expectedDeliveryText: {
    ...theme.viewStyles.text('SB', 13, '#01475b', 1, 24),
  },
  expectedDeliveryDateText: {
    ...theme.viewStyles.text('M', 13, '#01475b', 1, 24),
  },
  deliverySubText: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansRegular(12),
  },
  orderDelivered: {
    ...theme.fonts.IBMPlexSansBold(16),
    lineHeight: 24,
    color: '#00B38E',
  },
  deliveryDate: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 17,
    color: '#01475B',
  },
  notifySymbol: {
    height: 21,
    width: 18,
    marginTop: 3,
  },
  deliveredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  shipmentInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  trackingOrderCta: {
    width: '60%',
    alignSelf: 'center',
    alignContent: 'center',
    marginBottom: 10,
  },
  helpTextStyle: { ...theme.viewStyles.text('B', 13, '#FC9916', 1, 24) },
  headerViewStyle: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  line: {
    width: screenWidth,
    height: 0.5,
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.3,
  },
  chatView: {
    marginVertical: 10,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  queryText: {
    ...theme.viewStyles.text('M', 13, theme.colors.LIGHT_BLUE),
    paddingBottom: 10,
    paddingTop: 4,
    marginRight: 6,
  },
  chatBtnTxt: {
    ...theme.viewStyles.text('SB', 13, theme.colors.APP_YELLOW),
  },
});
