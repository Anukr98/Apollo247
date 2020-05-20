import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { OrderSummary } from '@aph/mobile-patients/src/components/OrderSummaryView';
import {
  EPrescription,
  ShoppingCartItem,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DropDown, Option } from '@aph/mobile-patients/src/components/ui/DropDown';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CrossPopup,
  DropdownGreen,
  More,
  NotifySymbol,
  MedicalIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { OrderProgressCard } from '@aph/mobile-patients/src/components/ui/OrderProgressCard';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  GET_MEDICINE_ORDER_CANCEL_REASONS,
  GET_MEDICINE_ORDER_OMS_DETAILS,
  GET_MEDICINE_ORDERS_OMS__LIST,
  CANCEL_MEDICINE_ORDER_OMS,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getMedicineOrderOMSDetails,
  getMedicineOrderOMSDetailsVariables,
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails,
  getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus,
} from '@aph/mobile-patients/src/graphql/types/getMedicineOrderOMSDetails';
import {
  MEDICINE_ORDER_STATUS,
  MEDICINE_ORDER_TYPE,
  FEEDBACKTYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { getMedicineDetailsApi } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  aphConsole,
  g,
  getNewOrderStatusText,
  handleGraphQlError,
  postWEGNeedHelpEvent,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { FeedbackPopup } from './FeedbackPopup';
import { ApolloQueryResult } from 'apollo-client';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import {
  Alert,
  BackHandler,
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
import {
  GetMedicineOrdersList,
  GetMedicineOrdersListVariables,
} from '../graphql/types/GetMedicineOrdersList';
import {
  getMedicineOrdersOMSList,
  getMedicineOrdersOMSListVariables,
} from '../graphql/types/getMedicineOrdersOMSList';
import { CommonBugFender, isIphone5s } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { postPharmacyMyOrderTrackingClicked } from '../helpers/webEngageEventHelpers';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  CancelMedicineOrderOMS,
  CancelMedicineOrderOMSVariables,
} from '../graphql/types/CancelMedicineOrderOMS';
import {
  GetMedicineOrderCancelReasons,
  GetMedicineOrderCancelReasons_getMedicineOrderCancelReasons_cancellationReasons,
} from '../graphql/types/GetMedicineOrderCancelReasons';

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
});

const cancelOptions: [string, string][] = [
  ['MCCR0036', 'Placed order by mistake'],
  ['MCCR0040', 'Higher discounts available on other app'],
  ['MCCR0046', 'Delay in delivery'],
  ['MCCR0047', 'Delay in order confirmation'],
  ['MCCR0048', 'Do not require medicines any longer'],
  ['MCCR0049', 'Already purchased'],
];

type OrderRefetch = (
  variables?: getMedicineOrdersOMSListVariables
) => Promise<ApolloQueryResult<getMedicineOrdersOMSList>>;

export interface OrderDetailsSceneProps extends NavigationScreenProps {
  orderAutoId?: string;
  showOrderSummaryTab?: boolean;
  goToHomeOnBack?: boolean;
  refetchOrders: OrderRefetch;
}
{
}

export const OrderDetailsScene: React.FC<OrderDetailsSceneProps> = (props) => {
  const orderAutoId = props.navigation.getParam('orderAutoId');
  const goToHomeOnBack = props.navigation.getParam('goToHomeOnBack');
  const showOrderSummaryTab = props.navigation.getParam('showOrderSummaryTab');
  const setOrders = props.navigation.getParam('setOrders');
  const [cancellationReasons, setCancellationReasons] = useState<
    GetMedicineOrderCancelReasons_getMedicineOrderCancelReasons_cancellationReasons[] | null
  >([]);
  const client = useApolloClient();

  const [selectedTab, setSelectedTab] = useState<string>(
    showOrderSummaryTab ? string.orders.viewBill : string.orders.trackOrder
  );
  const [isCancelVisible, setCancelVisible] = useState(false);

  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();
  const {
    cartItems,
    setCartItems,
    ePrescriptions,
    setEPrescriptions,
    addresses,
  } = useShoppingCart();
  const { showAphAlert, setLoading } = useUIElements();
  const vars: getMedicineOrderOMSDetailsVariables = {
    patientId: currentPatient && currentPatient.id,
    orderAutoId: typeof orderAutoId == 'string' ? parseInt(orderAutoId) : orderAutoId,
  };
  const refetchOrders: OrderRefetch =
    props.navigation.getParam('refetch') ||
    useQuery<getMedicineOrdersOMSList, getMedicineOrdersOMSListVariables>(
      GET_MEDICINE_ORDERS_OMS__LIST,
      {
        variables: { patientId: currentPatient && currentPatient.id },
        fetchPolicy: 'cache-first',
      }
    ).refetch;
  console.log(JSON.stringify(vars));
  const { data, loading, refetch } = useQuery<
    getMedicineOrderOMSDetails,
    getMedicineOrderOMSDetailsVariables
  >(GET_MEDICINE_ORDER_OMS_DETAILS, {
    variables: vars,
    fetchPolicy: 'no-cache',
  });
  const order = g(data, 'getMedicineOrderOMSDetails', 'medicineOrderDetails');
  console.log({ order });

  const orderDetails = ((!loading && order) ||
    {}) as getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails;
  const orderStatusList = ((!loading && order && order.medicineOrdersStatus) || []).filter(
    (item) => item!.hideStatus
  );

  const [isEventFired, setEventFired] = useState(false);

  useEffect(() => {
    if (isEventFired) {
      return;
    }
    const statusList = g(order, 'medicineOrdersStatus') || [];
    const orderDate = g(statusList.slice(-1)[0], 'statusDate');
    if (order) {
      postPharmacyMyOrderTrackingClicked(
        g(order, 'id')!,
        g(order, 'currentStatus')!,
        moment(orderDate).toDate(),
        g(order, 'orderTat') ? moment(g(order, 'orderTat')!).toDate() : undefined,
        g(order, 'orderType') == MEDICINE_ORDER_TYPE.UPLOAD_PRESCRIPTION ? 'Non Cart' : 'Cart',
        currentPatient
      );
      setEventFired(true);
    }
  }, [order]);

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
    return moment(time).format('D MMMM, YYYY');
  };

  const getFormattedTime = (time: string) => {
    return moment(time).format('hh:mm A');
  };

  const getFormattedDateTime = (time: string) => {
    let finalDateTime =
      moment(time).format('D MMMM YYYY') + ' at ' + moment(time).format('hh:mm A');
    return finalDateTime;
  };

  const selectedAddressIndex = addresses.find((address) => address.id == order?.patientAddressId);
  const addressData = selectedAddressIndex
    ? `${selectedAddressIndex.addressLine1} ${selectedAddressIndex.addressLine2}, ${selectedAddressIndex.city}, ${selectedAddressIndex.state}, ${selectedAddressIndex.zipcode}`
    : '';

  let orderCompleteText = `Your order no.#${orderAutoId} is successfully delivered on ${orderDetails.orderTat &&
    getFormattedDateTime(orderDetails.orderTat)}.`;

  const reOrder = () => {
    setLoading!(true);
    const items = (orderDetails!.medicineOrderLineItems || [])
      .map((item) => ({
        sku: item!.medicineSKU!,
        qty: item!.quantity!,
      }))
      .filter((item) => item.sku);
    Promise.all(items.map((item) => getMedicineDetailsApi(item!.sku!)))
      .then((result) => {
        const itemsToAdd = result
          .map(({ data: { productdp } }, index) => {
            const medicineDetails = (productdp && productdp[0]) || {};
            // if (!medicineDetails.is_in_stock) return null;
            return {
              id: medicineDetails!.sku!,
              mou: medicineDetails.mou,
              name: medicineDetails!.name,
              price: medicineDetails!.price,
              specialPrice: medicineDetails.special_price
                ? typeof medicineDetails.special_price == 'string'
                  ? parseInt(medicineDetails.special_price)
                  : medicineDetails.special_price
                : undefined,
              quantity: items[index].qty || 1,
              prescriptionRequired: medicineDetails.is_prescription_required == '1',
              isMedicine: medicineDetails.type_id == 'Pharma',
              thumbnail: medicineDetails.thumbnail || medicineDetails.image,
              isInStock: !!medicineDetails.is_in_stock,
            };
          })
          .filter((item) => item) as ShoppingCartItem[];

        const itemsToAddSkus = itemsToAdd.map((i) => i.id);
        const itemsToAddInCart = [
          ...itemsToAdd,
          ...cartItems.filter((item) => !itemsToAddSkus.includes(item.id!)),
        ];
        setCartItems!(itemsToAddInCart);

        // Adding prescriptions
        if (orderDetails!.prescriptionImageUrl) {
          const imageUrls = orderDetails!.prescriptionImageUrl
            .split(',')
            .map((item) => item.trim());

          const ePresToAdd = imageUrls.map(
            (item) =>
              ({
                id: item,
                date: moment(order!.medicineOrdersStatus![0]!.statusDate).format('DD MMM YYYY'),
                doctorName: '',
                forPatient: (currentPatient && currentPatient.firstName) || '',
                medicines: (order!.medicineOrderLineItems || [])
                  .map((item) => item!.medicineName)
                  .join(', '),
                uploadedUrl: item,
              } as EPrescription)
          );
          const ePresIds = ePresToAdd.map((i) => i!.uploadedUrl);
          setEPrescriptions!([
            ...ePrescriptions.filter((item) => !ePresIds.includes(item.uploadedUrl!)),
            ...ePresToAdd,
          ]);
        }

        setLoading!(false);
        if (items.length > itemsToAdd.length) {
          showErrorPopup('Few items are out of stock.');
        }
        props.navigation.navigate(AppRoutes.YourCart, { isComingFromConsult: true });
      })
      .catch((e) => {
        CommonBugFender('OrderDetailsScene_reOrder', e);
        setLoading!(false);
        showErrorPopup('Something went wrong.');
      });
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
    const orderAutoId: string = orderDetails.orderAutoId!?.toString();
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
          }}
        />
      </>
    );
  };

  const renderOrderHistory = () => {
    const isDelivered = orderStatusList.find(
      (item) => item!.orderStatus == MEDICINE_ORDER_STATUS.DELIVERED
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

    let capsuleViewBGColor: string;
    let capsuleTextColor: string;
    let capsuleText: string;
    if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.CANCELLED) {
      capsuleText = 'Cancelled';
      capsuleTextColor = '#FFF';
      capsuleViewBGColor = '#890000';
    } else if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.RETURN_INITIATED) {
      capsuleText = 'Return Initiated';
      capsuleTextColor = '#01475b';
      capsuleViewBGColor = 'rgba(0, 179, 142, 0.2)';
    } else if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.RETURN_ACCEPTED) {
      capsuleText = 'Returned';

      capsuleTextColor = '#01475b';
      capsuleViewBGColor = 'rgba(0, 179, 142, 0.2)';
    } else {
      capsuleText = 'Successful';
      capsuleTextColor = '#01475b';
      capsuleViewBGColor = 'rgba(0, 179, 142, 0.2)';
    }

    const getOrderDescription = (
      status: MEDICINE_ORDER_STATUS,
      isOrderRequirePrescription?: boolean // if any of the order item requires prescription
    ) => {
      const orderStatusDescMapping = {
        [MEDICINE_ORDER_STATUS.ORDER_PLACED]: isOrderRequirePrescription
          ? ['', '']
          : [
              'Verification Pending: ',
              'Your order is being verified by our pharmacists. Our pharmacists might be required to call you for order verification.',
            ],
        [MEDICINE_ORDER_STATUS.ORDER_VERIFIED]: [
          'Store Assigned: ',
          'Your order has been assigned to our pharmacy.',
        ],
        [MEDICINE_ORDER_STATUS.ORDER_BILLED]: [
          '',
          `Your order #${orderAutoId} has been packed. Soon would be dispatched from our pharmacy.`,
        ],
        [MEDICINE_ORDER_STATUS.CANCELLED]: [
          '',
          `Your order #${orderAutoId} has been cancelled as per your request.`,
        ],
        [MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY]: [
          'Out for delivery: ',
          `Your order #${orderAutoId} would be reaching your doorstep soon.`,
        ],
        [MEDICINE_ORDER_STATUS.PAYMENT_FAILED]: [
          '',
          'Order Not Placed! Please try to place the order again with an alternative payment method or Cash on Delivery (COD).',
        ],
      };

      const isStatusAvailable = Object.keys(orderStatusDescMapping).includes(status);

      return isStatusAvailable
        ? {
            heading: g(orderStatusDescMapping, status as any, '0'),
            description: g(orderStatusDescMapping, status as any, '1'),
          }
        : null;
    };

    const showExpectedDelivery =
      isDeliveryOrder && tatInfo && !isCancelled && !isDelivered && hours > 0;

    let statusList = orderStatusList
      .filter(
        (item, idx, array) => array.map((i) => i!.orderStatus).indexOf(item!.orderStatus) === idx
      )
      .concat([]);

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
    } else if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.ORDER_INITIATED) {
      statusList = orderStatusList
        .filter(
          (item, idx, array) => array.map((i) => i!.orderStatus).indexOf(item!.orderStatus) === idx
        )
        .concat([
          {
            statusDate: tatInfo,
            id: 'idToBeDelivered',
            orderStatus: MEDICINE_ORDER_STATUS.ORDER_PLACED as any,
          } as getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus,
          {
            statusDate: tatInfo,
            id: 'idToBeDelivered',
            orderStatus: MEDICINE_ORDER_STATUS.ORDER_VERIFIED as any,
          } as getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus,
          {
            statusDate: tatInfo,
            id: 'idToBeDelivered',
            orderStatus: MEDICINE_ORDER_STATUS.ORDER_BILLED as any,
          } as getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus,
          {
            statusDate: tatInfo,
            id: 'idToBeDelivered',
            orderStatus: MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY as any,
          } as getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus,
          {
            statusDate: tatInfo,
            id: 'idToBeDelivered',
            orderStatus: MEDICINE_ORDER_STATUS.DELIVERED as any,
          } as getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus,
        ]);
    } else if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.ORDER_PLACED) {
      statusList = orderStatusList
        .filter(
          (item, idx, array) => array.map((i) => i!.orderStatus).indexOf(item!.orderStatus) === idx
        )
        .concat([
          {
            statusDate: tatInfo,
            id: 'idToBeDelivered',
            orderStatus: MEDICINE_ORDER_STATUS.ORDER_VERIFIED as any,
          } as getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus,

          {
            statusDate: tatInfo,
            id: 'idToBeDelivered',
            orderStatus: MEDICINE_ORDER_STATUS.ORDER_BILLED as any,
          } as getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus,
          {
            statusDate: tatInfo,
            id: 'idToBeDelivered',
            orderStatus: MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY as any,
          } as getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus,
          {
            statusDate: tatInfo,
            id: 'idToBeDelivered',
            orderStatus: MEDICINE_ORDER_STATUS.DELIVERED as any,
          } as getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus,
        ]);
    } else if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.ORDER_VERIFIED) {
      statusList = orderStatusList
        .filter(
          (item, idx, array) => array.map((i) => i!.orderStatus).indexOf(item!.orderStatus) === idx
        )
        .concat([
          {
            statusDate: tatInfo,
            id: 'idToBeDelivered',
            orderStatus: MEDICINE_ORDER_STATUS.ORDER_BILLED as any,
          } as getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus,
          {
            statusDate: tatInfo,
            id: 'idToBeDelivered',
            orderStatus: MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY as any,
          } as getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus,
          {
            statusDate: tatInfo,
            id: 'idToBeDelivered',
            orderStatus: MEDICINE_ORDER_STATUS.DELIVERED as any,
          } as getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus,
        ]);
    } else if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.ORDER_BILLED) {
      statusList = orderStatusList
        .filter(
          (item, idx, array) => array.map((i) => i!.orderStatus).indexOf(item!.orderStatus) === idx
        )
        .concat([
          {
            statusDate: tatInfo,
            id: 'idToBeDelivered',
            orderStatus: MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY as any,
          } as getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus,
          {
            statusDate: tatInfo,
            id: 'idToBeDelivered',
            orderStatus: MEDICINE_ORDER_STATUS.DELIVERED as any,
          } as getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus,
        ]);
    } else if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY) {
      statusList = orderStatusList
        .filter(
          (item, idx, array) => array.map((i) => i!.orderStatus).indexOf(item!.orderStatus) === idx
        )
        .concat([
          {
            statusDate: tatInfo,
            id: 'idToBeDelivered',
            orderStatus: MEDICINE_ORDER_STATUS.DELIVERED as any,
          } as getMedicineOrderOMSDetails_getMedicineOrderOMSDetails_medicineOrderDetails_medicineOrdersStatus,
        ]);
    } else if (orderDetails.currentStatus == MEDICINE_ORDER_STATUS.DELIVERED) {
      statusList = orderStatusList
        .filter(
          (item, idx, array) => array.map((i) => i!.orderStatus).indexOf(item!.orderStatus) === idx
        )
        .concat([]);
    }

    const renderCapsuleView = (backgroundColor: string, capsuleText: string, textColor: string) => {
      return (
        <View
          style={{
            alignSelf: 'flex-end',
            backgroundColor: backgroundColor ? backgroundColor : 'rgba(0, 179, 142, 0.2)',
            borderRadius: 16,
            paddingHorizontal: 15,
            paddingTop: 4,
            paddingBottom: 3,
          }}
        >
          <Text style={{ ...theme.viewStyles.text('M', 11, textColor) }}>{capsuleText}</Text>
        </View>
      );
    };

    return (
      <View>
        <View
          style={{
            borderBottomColor: 'rgba(2,71,91,0.3)',
            borderBottomWidth: 0.5,
            paddingTop: 16,
            paddingBottom: 6,
            paddingHorizontal: 20,
            marginBottom: 13,
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
          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            <Text style={{ ...theme.viewStyles.text('M', 13, '#01475b') }}>
              {string.OrderSummery.name}
            </Text>
            <Text style={{ ...theme.viewStyles.text('R', 13, '#01475b') }}>
              {orderDetails.patient?.firstName}
              {orderDetails.patient?.lastName}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 4, paddingRight: 20 }}>
            <Text style={{ ...theme.viewStyles.text('M', 13, '#01475b'), paddingTop: 2 }}>
              {string.OrderSummery.address}
            </Text>
            <Text style={{ ...theme.viewStyles.text('R', 13, '#01475b', 1, 24), paddingRight: 31 }}>
              {addressData}
            </Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: '#f7f8f5',
            shadowColor: 'rgba(128, 128, 128, 0.3)',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.4,
            shadowRadius: 5,
            elevation: 5,
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 13,
            flexDirection: 'row',
          }}
        >
          <NotifySymbol />
          <Text
            style={{
              ...theme.viewStyles.text('SB', 13, '#01475b', 1, 24),
              marginLeft: 20,
            }}
          >
            {isDelivered ? 'ORDER DELIVERED - ' : 'EXPECTED DELIVERY - '}
          </Text>
          <Text
            style={{
              ...theme.viewStyles.text('M', 13, '#01475b', 1, 24),
            }}
          >
            {tatInfo && getFormattedDate(tatInfo)}
          </Text>
        </View>
        <View style={{ margin: 20 }}>
          {statusList.map((order, index, array) => {
            return (
              <OrderProgressCard
                style={index < array.length - 1 ? { marginBottom: 8 } : {}}
                key={index}
                description={
                  order!.id == 'idToBeDelivered'
                    ? `To Be Delivered Within — ${expectedDeliveryDiff
                        .humanize()
                        .replace(' hours', 'hrs')}`
                    : ''
                }
                showCurrentStatusDesc={orderDetails.currentStatus == order!.orderStatus}
                getOrderDescription={getOrderDescription(orderDetails.currentStatus!)}
                status={getNewOrderStatusText(order!.orderStatus!)}
                date={getFormattedDate(order!.statusDate)}
                time={getFormattedTime(order!.statusDate)}
                isStatusDone={order!.id != 'idToBeDelivered'}
                nextItemStatus={
                  index == array.length - 1
                    ? 'NOT_EXIST'
                    : order!.id != 'idToBeDelivered' && showExpectedDelivery
                    ? 'NOT_DONE'
                    : 'DONE'
                }
              />
            );
          })}
        </View>
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
            <Button
              style={{ flex: 1, width: '95%', alignSelf: 'center' }}
              onPress={() => reOrder()}
              title={'RE-ORDER'}
            />
          </View>
        ) : null}
        <NeedHelpAssistant
          onNeedHelpPress={() => {
            postWEGNeedHelpEvent(currentPatient, 'Medicines');
          }}
          containerStyle={{ marginTop: 20, marginBottom: 30 }}
          navigation={props.navigation}
        />
      </View>
    );
  };

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
                  setSelectedReason(cancellationReasons.description);
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

  const renderOrderSummary = () => {
    return (
      <View>
        <OrderSummary orderDetails={orderDetails as any} />
        <NeedHelpAssistant
          onNeedHelpPress={() => {
            postWEGNeedHelpEvent(currentPatient, 'Medicines');
          }}
          containerStyle={{ marginTop: 30, marginBottom: 30 }}
          navigation={props.navigation}
        />
      </View>
    );
  };

  const onPressConfirmCancelOrder = () => {
    setShowSpinner(true);
    const variables: CancelMedicineOrderOMSVariables = {
      medicineOrderCancelOMSInput: {
        orderNo: typeof orderAutoId == 'string' ? parseInt(orderAutoId, 10) : orderAutoId,
        cancelReasonCode:
          cancellationReasons &&
          cancellationReasons.find((item) => item.description == selectedReason)!.reasonCode,
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
          refetchOrders &&
            refetchOrders()
              .then((data) => {
                const _orders = (
                  g(data, 'data', 'getMedicineOrdersOMSList', 'medicineOrdersList') || []
                ).filter(
                  (item) =>
                    !(
                      (item!.medicineOrdersStatus || []).length == 1 &&
                      (item!.medicineOrdersStatus || []).find((item) => !item!.hideStatus)
                    )
                );
                console.log(_orders, 'hdub');
                setOrders(_orders);
              })
              .catch((e) => {
                CommonBugFender('OrderDetailsScene_onPressConfirmCancelOrder', e);
              });
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

  // const onPressCancelOrder = () => {
  // const isDelivered = orderStatusList.find(
  //   (item) => item!.orderStatus == MEDICINE_ORDER_STATUS.DELIVERED
  // );
  // const isCancelled = orderStatusList.find(
  //   (item) => item!.orderStatus == MEDICINE_ORDER_STATUS.CANCELLED
  // );
  // const isPrescriptionOrder = orderStatusList.find(
  //   (item) =>
  //     item!.orderStatus == MEDICINE_ORDER_STATUS.PRESCRIPTION_CART_READY ||
  //     item!.orderStatus == MEDICINE_ORDER_STATUS.PRESCRIPTION_UPLOADED
  // );
  // if (isDelivered) {
  //   showErrorPopup('You cannot cancel the order wich is delivered.');
  //   // Alert.alert('Alert', 'You cannot cancel the order wich is delivered.');
  // } else if (isCancelled) {
  //   showErrorPopup('Order is already cancelled.');
  //   // Alert.alert('Alert', 'Order is already cancelled.');
  // } else {
  //   setCancelVisible(true);
  // }
  // setCancelVisible(true);
  // };

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
    const hideMenuIcon = !!orderStatusList.find(
      (item) =>
        item!.orderStatus == MEDICINE_ORDER_STATUS.DELIVERED ||
        item!.orderStatus == MEDICINE_ORDER_STATUS.CANCELLED
    );
    const cannotCancelOrder = orderStatusList.find(
      (item) =>
        // item!.orderStatus == MEDICINE_ORDER_STATUS.DELIVERED ||
        // item!.orderStatus == MEDICINE_ORDER_STATUS.CANCELLED ||
        // item!.orderStatus == MEDICINE_ORDER_STATUS.PRESCRIPTION_CART_READY ||
        // item!.orderStatus == MEDICINE_ORDER_STATUS.PRESCRIPTION_UPLOADED ||
        item!.orderStatus == MEDICINE_ORDER_STATUS.ORDER_BILLED
    );
    // const isCancelOrderAllowed = orderStatusList.find(
    //   (item) =>
    //     item!.orderStatus == MEDICINE_ORDER_STATUS.ORDER_PLACED ||
    //     item!.orderStatus == MEDICINE_ORDER_STATUS.ORDER_CONFIRMED
    // );
    if (hideMenuIcon || !orderStatusList.length) return null;
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
            if (cannotCancelOrder) {
              showAphAlert!({
                title: string.common.uhOh,
                description: orderStatusList.find(
                  (item) => item!.orderStatus == MEDICINE_ORDER_STATUS.ORDER_BILLED
                )
                  ? 'Sorry, we cannot cancel once the order is billed.'
                  : 'Sorry, we cannot cancel the order now.',
              });
            } else {
              getCancellationReasons();
            }
          }
        }}
      >
        <More />
      </MaterialMenu>
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
            rightComponent={renderMoreMenu()}
            onPressLeftIcon={() => {
              handleBack();
            }}
          />
        </View>

        <TabsComponent
          style={styles.tabsContainer}
          onChange={(title) => {
            const isNonCartOrder = orderStatusList.find(
              (item) => item!.orderStatus == MEDICINE_ORDER_STATUS.PRESCRIPTION_UPLOADED
            );
            if (!isNonCartOrder) {
              setSelectedTab(title);
            }
          }}
          data={[{ title: string.orders.trackOrder }, { title: string.orders.viewBill }]}
          selectedTab={selectedTab}
        />
        <ScrollView bounces={false}>
          {selectedTab == string.orders.trackOrder ? renderOrderHistory() : renderOrderSummary()}
        </ScrollView>
      </SafeAreaView>
      {renderFeedbackPopup()}
      {(loading || showSpinner) && <Spinner style={{ zIndex: 200 }} />}
    </View>
  );
};
