import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CheckUnselectedIcon,
  CheckedIcon,
  OneApollo,
  CircleLogo,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  SAVE_MEDICINE_ORDER_OMS,
  SAVE_MEDICINE_ORDER_PAYMENT,
  GET_ONEAPOLLO_USER,
  SAVE_MEDICINE_ORDER_OMS_V2,
  SAVE_MEDICINE_ORDER_PAYMENT_V2,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  MedicineCartOMSItem,
  MEDICINE_ORDER_PAYMENT_TYPE,
  BOOKINGSOURCE,
  DEVICE_TYPE,
  ONE_APOLLO_STORE_CODE,
  PLAN_PURCHASE_DETAILS_PHARMA,
  PLAN,
  PrescriptionType,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  saveMedicineOrderOMS,
  saveMedicineOrderOMSVariables,
} from '@aph/mobile-patients/src/graphql/types/saveMedicineOrderOMS';
import {
  saveMedicineOrderV2,
  saveMedicineOrderV2Variables,
  saveMedicineOrderV2_saveMedicineOrderV2_orders,
} from '@aph/mobile-patients/src/graphql/types/saveMedicineOrderV2';
import {
  saveMedicineOrderPaymentMqV2,
  saveMedicineOrderPaymentMqV2Variables,
} from '@aph/mobile-patients/src/graphql/types/saveMedicineOrderPaymentMqV2';
import {
  aphConsole,
  g,
  postWebEngageEvent,
  formatAddress,
  postAppsFlyerEvent,
  postFirebaseEvent,
  getHealthCredits,
  persistHealthCredits,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  View,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import {
  SaveMedicineOrderPaymentMq,
  SaveMedicineOrderPaymentMqVariables,
} from '@aph/mobile-patients/src/graphql/types/SaveMedicineOrderPaymentMq';
import moment from 'moment';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  fetchPaymentOptions,
  trackTagalysEvent,
  validateConsultCoupon,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  AppsFlyerEventName,
  AppsFlyerEvents,
} from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { FirebaseEvents, FirebaseEventName } from '../helpers/firebaseEvents';
import { Down } from '@aph/mobile-patients/src/components/ui/Icons';
import { Tagalys } from '@aph/mobile-patients/src/helpers/Tagalys';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { Circle } from '@aph/mobile-patients/src/strings/strings.json';
import DeviceInfo from 'react-native-device-info';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';

export interface CheckoutSceneNewProps extends NavigationScreenProps {}

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export const CheckoutSceneNew: React.FC<CheckoutSceneNewProps> = (props) => {
  const deliveryTime = props.navigation.getParam('deliveryTime');
  const tatType = props.navigation.getParam('tatType');
  const storeDistance: number = props.navigation.getParam('storeDistance');
  const paramShopId = props.navigation.getParam('shopId');
  const isStorePickup = props.navigation.getParam('isStorePickup');
  const circlePlanId = AppConfig.Configuration.CIRCLE_PLAN_ID;
  const { currentPatient } = useAllCurrentPatients();
  const [isCashOnDelivery, setCashOnDelivery] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPaymentOptions, setShowPaymentOptions] = useState<boolean>(true);
  const { showAphAlert, hideAphAlert } = useUIElements();
  const {
    consultProfile,
    deliveryAddressId,
    storeId,
    showPrescriptionAtStore,
    grandTotal,
    deliveryCharges,
    packagingCharges,
    cartItems,
    deliveryType,
    prescriptionType,
    physicalPrescriptions,
    ePrescriptions,
    uploadPrescriptionRequired,
    couponDiscount,
    productDiscount,
    cartTotal,
    addresses,
    stores,
    coupon,
    pinCode,
    circleMembershipCharges,
    circleSubPlanId,
    cartTotalCashback,
    circleSubscriptionId,
    isCircleSubscription,
    isFreeDelivery,
    pharmacyCircleAttributes,
    shipments,
    orders,
    hdfcSubscriptionId,
    minCartValueForCOD,
    maxCartValueForCOD,
  } = useShoppingCart();
  const {
    pharmacyUserTypeAttribute,
    pharmacyLocation,
    locationDetails,
    hdfcStatus,
    circleStatus,
    hdfcPlanId,
  } = useAppCommonData();

  type bankOptions = {
    name: string;
    paymentMode: string;
    bankCode: string;
    seq: number;
    enabled: boolean;
    imageUrl: string;
  };
  const [bankOptions, setbankOptions] = useState<bankOptions[]>([]);

  type paymentOptions = {
    name: string;
    paymentMode: string;
    enabled: boolean;
    seq: number;
    imageUrl: string;
  };
  const [paymentOptions, setpaymentOptions] = useState<paymentOptions[]>([]);
  const [availableHC, setAvailableHC] = useState<number>(0);
  const [isOneApolloSelected, setisOneApolloSelected] = useState<boolean>(false);
  const [burnHC, setBurnHC] = useState<number>(0);
  const [HCorder, setHCorder] = useState<boolean>(false);
  const [scrollToend, setScrollToend] = useState<boolean>(false);
  const [showCareDetails, setShowCareDetails] = useState(true);
  const client = useApolloClient();

  const getFormattedAmount = (num: number) => Number(num.toFixed(2));

  const saveOrder = (orderInfo: saveMedicineOrderOMSVariables) =>
    client.mutate<saveMedicineOrderOMS, saveMedicineOrderOMSVariables>({
      mutation: SAVE_MEDICINE_ORDER_OMS,
      variables: orderInfo,
    });

  const saveOrderV2 = (orderInfo: saveMedicineOrderV2Variables) =>
    client.mutate<saveMedicineOrderV2, saveMedicineOrderV2Variables>({
      mutation: SAVE_MEDICINE_ORDER_OMS_V2,
      variables: orderInfo,
    });

  const savePayment = (paymentInfo: SaveMedicineOrderPaymentMqVariables) =>
    client.mutate<SaveMedicineOrderPaymentMq, SaveMedicineOrderPaymentMqVariables>({
      mutation: SAVE_MEDICINE_ORDER_PAYMENT,
      variables: paymentInfo,
    });

  const savePaymentV2 = (paymentInfo: saveMedicineOrderPaymentMqV2Variables) =>
    client.mutate<saveMedicineOrderPaymentMqV2, saveMedicineOrderPaymentMqV2Variables>({
      mutation: SAVE_MEDICINE_ORDER_PAYMENT_V2,
      variables: paymentInfo,
    });

  useEffect(() => {
    fetchHealthCredits();
    fetchPaymentOptions()
      .then((res: any) => {
        let options: paymentOptions[] = [];
        res.data.forEach((item: any) => {
          if (item && item.enabled && item.paymentMode != 'NB') {
            options.push(item);
          } else if (item && item.enabled && item.paymentMode == 'NB') {
            let bankList: bankOptions[] = [];
            let bankOptions: bankOptions[] = item.banksList;
            bankOptions.forEach((item) => {
              if (item.enabled) {
                item.paymentMode = 'NB';
                bankList.push(item);
              }
            });
            if (bankList.length > 0) {
              bankList.sort((a, b) => {
                return a.seq - b.seq;
              });
              setbankOptions(bankList);
            } else {
              delete item.banksList;
              options.push(item);
            }
          }
        });
        options.sort((a, b) => {
          return a.seq - b.seq;
        });
        setpaymentOptions(options);
        setLoading && setLoading(false);
      })
      .catch((error) => {
        CommonBugFender('fetchingPaymentOptions', error);
        props.navigation.navigate(AppRoutes.MedicineCart);
        renderErrorPopup(string.common.tryAgainLater);
      });
    return () => {};
  }, []);

  const fetchHealthCredits = async () => {
    var cachedHealthCredit: any = await getHealthCredits();
    if (cachedHealthCredit != null) {
      setAvailableHC(cachedHealthCredit.healthCredit);
      return; // no need to call api
    }

    client
      .query({
        query: GET_ONEAPOLLO_USER,
        variables: {
          patientId: currentPatient && currentPatient.id,
        },
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        if (res.data.getOneApolloUser) {
          setAvailableHC(res.data.getOneApolloUser.availableHC);
          persistHealthCredits(res.data.getOneApolloUser.availableHC);
        }
      })
      .catch((error) => {
        CommonBugFender('fetchingOneApolloUser', error);
        setAvailableHC(0);
      });
  };

  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });

  const getPrepaidCheckoutCompletedEventAttributes = (orderAutoId: string, isCOD?: boolean) => {
    try {
      const addr = deliveryAddressId && addresses.find((item) => item.id == deliveryAddressId);
      const store = storeId && stores.find((item) => item.storeid == storeId);
      const shippingInformation = addr ? formatAddress(addr) : store ? store.address : '';
      const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_CHECKOUT_COMPLETED] = {
        'Order ID': orderAutoId,
        'Order Type': 'Cart',
        'Prescription Required': uploadPrescriptionRequired,
        'Prescription Added': !!(physicalPrescriptions.length || ePrescriptions.length),
        'Shipping information': shippingInformation, // (Home/Store address)
        'Total items in cart': cartItems.length,
        'Grand Total': cartTotal + deliveryCharges,
        'Total Discount %': coupon
          ? getFormattedAmount(((couponDiscount + productDiscount) / cartTotal) * 100)
          : 0,
        'Discount Amount': getFormattedAmount(couponDiscount + productDiscount),
        'Delivery charge': deliveryCharges,
        'Net after discount': getFormattedAmount(grandTotal),
        'Payment status': 1,
        'Payment Type': isCOD ? 'COD' : 'Prepaid',
        'Service Area': 'Pharmacy',
        'Mode of Delivery': deliveryAddressId ? 'Home' : 'Pickup',
        af_revenue: getFormattedAmount(grandTotal),
        af_currency: 'INR',
        'Circle Cashback amount':
          circleSubscriptionId || isCircleSubscription ? Number(cartTotalCashback) : 0,
        'Split Cart': orders?.length > 1 ? 'Yes' : 'No',
        'Prescription Option selected': uploadPrescriptionRequired
          ? 'Prescription Upload'
          : 'Not Applicable',
        ...pharmacyCircleAttributes!,
        ...pharmacyUserTypeAttribute,
      };
      if (store) {
        eventAttributes['Store Id'] = store.storeid;
        eventAttributes['Store Name'] = store.storename;
        eventAttributes['Store Number'] = store.phone;
        eventAttributes['Store Address'] = store.address;
      }
      return eventAttributes;
    } catch (error) {
      return {};
    }
  };

  const getPrepaidCheckoutCompletedAppsFlyerEventAttributes = (
    orderId: string,
    orderAutoId: string
  ) => {
    const appsflyerEventAttributes: AppsFlyerEvents[AppsFlyerEventName.PHARMACY_CHECKOUT_COMPLETED] = {
      'customer id': currentPatient ? currentPatient.id : '',
      'cart size': cartItems.length,
      af_revenue: getFormattedAmount(grandTotal),
      af_currency: 'INR',
      'order id': orderId,
      orderAutoId: orderAutoId,
      'coupon applied': coupon ? true : false,
      'Circle Cashback amount':
        circleSubscriptionId || isCircleSubscription ? Number(cartTotalCashback) : 0,
      ...pharmacyCircleAttributes!,
    };
    return appsflyerEventAttributes;
  };

  const postwebEngageCheckoutCompletedEvent = (
    orderAutoId: string,
    orderId: string,
    isCOD?: boolean
  ) => {
    const eventAttributes = {
      ...getPrepaidCheckoutCompletedEventAttributes(`${orderAutoId}`, isCOD),
      'Split Cart': orders?.length > 1 ? 'Yes' : 'No',
      'Prescription Option selected': uploadPrescriptionRequired
        ? 'Prescription Upload'
        : 'Not Applicable',
      'Cart Items': JSON.stringify(cartItems),
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_CHECKOUT_COMPLETED, eventAttributes);

    const appsflyerEventAttributes = {
      ...getPrepaidCheckoutCompletedAppsFlyerEventAttributes(`${orderId}`, orderAutoId),
    };
    postAppsFlyerEvent(AppsFlyerEventName.PHARMACY_CHECKOUT_COMPLETED, appsflyerEventAttributes);

    try {
      Promise.all(
        cartItems.map((cartItem) =>
          trackTagalysEvent(
            {
              event_type: 'product_action',
              details: {
                sku: cartItem.id,
                action: 'buy',
                quantity: cartItem.quantity,
                order_id: `${orderAutoId}`,
              } as Tagalys.ProductAction,
            },
            g(currentPatient, 'id')!
          )
        )
      );
    } catch (error) {
      CommonBugFender(`${AppRoutes.CheckoutSceneNew}_trackTagalysEvent`, error);
    }
  };

  const placeOrder = (orderId: string, orderAutoId: number, orderType: string, isCOD?: boolean) => {
    const paymentInfo: SaveMedicineOrderPaymentMqVariables = {
      medicinePaymentMqInput: {
        orderAutoId: orderAutoId,
        amountPaid: getFormattedAmount(grandTotal),
        paymentType:
          orderType == 'COD'
            ? MEDICINE_ORDER_PAYMENT_TYPE.COD
            : MEDICINE_ORDER_PAYMENT_TYPE.CASHLESS,
        paymentStatus: 'success',
        responseCode: '',
        responseMessage: '',
      },
    };
    if (orderType == 'HCorder') {
      paymentInfo.medicinePaymentMqInput['amountPaid'] = 0;
      paymentInfo.medicinePaymentMqInput['paymentStatus'] = 'TXN_SUCCESS';
      paymentInfo.medicinePaymentMqInput['healthCredits'] = !!circleMembershipCharges
        ? getFormattedAmount(grandTotal - circleMembershipCharges)
        : getFormattedAmount(grandTotal);
      if (circleMembershipCharges) {
        paymentInfo.medicinePaymentMqInput['healthCreditsSub'] = circleMembershipCharges;
      }
    }
    if (!circleSubscriptionId && !!circleMembershipCharges) {
      paymentInfo.medicinePaymentMqInput['planId'] = circlePlanId;
      paymentInfo.medicinePaymentMqInput['subPlanId'] = circleSubPlanId;
      paymentInfo.medicinePaymentMqInput['storeCode'] =
        Platform.OS == 'android' ? ONE_APOLLO_STORE_CODE.ANDCUS : ONE_APOLLO_STORE_CODE.IOSCUS;
    }

    savePayment(paymentInfo)
      .then(({ data }) => {
        const { errorCode, errorMessage } = g(data, 'SaveMedicineOrderPaymentMq') || {};
        setLoading && setLoading(false);
        if (errorCode || errorMessage) {
          // Order-failed
          showAphAlert!({
            title: `Hi ${g(currentPatient, 'firstName') || ''}!`,
            description: `Your order failed due to some temporary issue :( Please submit the order again.`,
          });
        } else {
          // Order-Success, Show popup here & clear cart info
          try {
            postwebEngageCheckoutCompletedEvent(`${orderAutoId}`, orderId, isCOD);
            firePurchaseEvent(orderId);
          } catch (error) {}
          let orders: (saveMedicineOrderV2_saveMedicineOrderV2_orders | null)[] = [];
          orders[0] = {
            __typename: 'MedicineOrderIds',
            id: orderId,
            orderAutoId: orderAutoId,
          };
          props.navigation.navigate(AppRoutes.PharmacyPaymentStatus, {
            status: 'PAYMENT_PENDING',
            price: getFormattedAmount(grandTotal),
            transId: orderAutoId,
            orders: orders,
            isStorePickup: isStorePickup,
          });
        }
      })
      .catch((e) => {
        CommonBugFender('CheckoutScene_savePayment', e);
        setLoading && setLoading(false);
        aphConsole.log({ e });
        showAphAlert!({
          title: `Hi ${g(currentPatient, 'firstName') || ''}!`,
          description: `Your order failed due to some temporary issue :( Please submit the order again.`,
        });
      });
  };

  const placeOrderV2 = (
    orders: (saveMedicineOrderV2_saveMedicineOrderV2_orders | null)[],
    transactionId: number,
    orderType: string,
    isCOD?: boolean
  ) => {
    const paymentInfo: saveMedicineOrderPaymentMqV2Variables = {
      medicinePaymentMqInput: {
        transactionId: transactionId,
        amountPaid: getFormattedAmount(grandTotal),
        paymentType:
          orderType == 'COD'
            ? MEDICINE_ORDER_PAYMENT_TYPE.COD
            : MEDICINE_ORDER_PAYMENT_TYPE.CASHLESS,
        paymentStatus: 'success',
        responseCode: '',
        responseMessage: '',
      },
    };
    if (orderType == 'HCorder') {
      paymentInfo.medicinePaymentMqInput['amountPaid'] = 0;
      paymentInfo.medicinePaymentMqInput['paymentStatus'] = 'TXN_SUCCESS';
      paymentInfo.medicinePaymentMqInput['healthCredits'] = !!circleMembershipCharges
        ? getFormattedAmount(grandTotal - circleMembershipCharges)
        : getFormattedAmount(grandTotal);
      if (circleMembershipCharges) {
        paymentInfo.medicinePaymentMqInput['healthCreditsSub'] = circleMembershipCharges;
      }
    }
    if (!circleSubscriptionId && !!circleMembershipCharges) {
      paymentInfo.medicinePaymentMqInput['planId'] = circlePlanId;
      paymentInfo.medicinePaymentMqInput['subPlanId'] = circleSubPlanId;
      paymentInfo.medicinePaymentMqInput['storeCode'] =
        Platform.OS == 'android' ? ONE_APOLLO_STORE_CODE.ANDCUS : ONE_APOLLO_STORE_CODE.IOSCUS;
    }
    savePaymentV2(paymentInfo)
      .then(({ data }) => {
        const { errorCode, errorMessage } = g(data, 'saveMedicineOrderPaymentMqV2') || {};
        setLoading && setLoading(false);
        if (errorCode || errorMessage) {
          // Order-failed
          showAphAlert!({
            title: `Hi ${g(currentPatient, 'firstName') || ''}!`,
            description: `Your order failed due to some temporary issue :( Please submit the order again.`,
          });
        } else {
          // Order-Success, Show popup here & clear cart info
          try {
            orders?.forEach((order) => {
              postwebEngageCheckoutCompletedEvent(`${order?.orderAutoId}`, order?.id!, isCOD);
              firePurchaseEvent(order?.id!);
            });
          } catch (error) {}
          props.navigation.navigate(AppRoutes.PharmacyPaymentStatus, {
            status: 'PAYMENT_PENDING',
            price: getFormattedAmount(grandTotal),
            transId: transactionId,
            orders: orders,
          });
        }
      })
      .catch((e) => {
        CommonBugFender('CheckoutScene_savePayment', e);
        setLoading && setLoading(false);
        aphConsole.log({ e });
        showAphAlert!({
          title: `Hi ${g(currentPatient, 'firstName') || ''}!`,
          description: `Your order failed due to some temporary issue :( Please submit the order again.`,
        });
      });
  };

  const firePaymentModeEvent = (paymentMode: string, orderId: string, orderAutoId: number) => {
    try {
      const paymentEventAttributes = {
        Payment_Mode: paymentMode,
        Type: 'Pharmacy',
        order_Id: orderId,
        order_AutoId: orderAutoId,
        LOB: 'Pharmacy',
      };
      postWebEngageEvent(WebEngageEventName.PAYMENT_INSTRUMENT, paymentEventAttributes);
      postFirebaseEvent(FirebaseEventName.PAYMENT_INSTRUMENT, paymentEventAttributes);
      postAppsFlyerEvent(AppsFlyerEventName.PAYMENT_INSTRUMENT, paymentEventAttributes);
    } catch (error) {}
  };

  const redirectToPaymentGateway = async (
    orders: (saveMedicineOrderV2_saveMedicineOrderV2_orders | null)[],
    transactionId: number,
    paymentMode: string,
    bankCode: string,
    orderInfo: saveMedicineOrderOMSVariables | saveMedicineOrderV2Variables
  ) => {
    orders?.forEach((order) => {
      firePaymentModeEvent(paymentMode, order?.id!, order?.orderAutoId!);
    });
    const checkoutEventAttributes = {
      ...getPrepaidCheckoutCompletedEventAttributes(`${transactionId}`, false),
    };
    props.navigation.navigate(AppRoutes.PaymentScene, {
      orders,
      transactionId,
      amount: getFormattedAmount(grandTotal - burnHC),
      burnHC: burnHC,
      deliveryTime,
      checkoutEventAttributes,
      paymentTypeID: paymentMode,
      bankCode: bankCode,
      coupon: coupon ? coupon.coupon : null,
      cartItems: cartItems,
      orderInfo: orderInfo,
      planId: circlePlanId || '',
      subPlanId: circleSubPlanId || '',
      isStorePickup,
    });
  };

  const validateCouponAndInitiateOrder = (
    paymentMode: string,
    bankCode: string,
    isCOD: boolean,
    hcOrder: boolean
  ) => {
    if (!coupon?.coupon) {
      initiateOrder(paymentMode, bankCode, isCOD, hcOrder);
      return;
    }
    const selectedAddress = addresses?.find((item) => item?.id == deliveryAddressId);
    const pharmacyPincode =
      selectedAddress?.zipcode || pharmacyLocation?.pincode || locationDetails?.pincode || pinCode;
    let packageId: string[] = [];
    if (hdfcSubscriptionId && hdfcStatus === 'active') {
      packageId.push(`HDFC:${hdfcPlanId}`);
    }
    if (circleSubscriptionId && circleStatus === 'active') {
      packageId.push(`APOLLO:${circlePlanId}`);
    }
    const data = {
      mobile: g(currentPatient, 'mobileNumber'),
      billAmount: (cartTotal - productDiscount).toFixed(2),
      coupon: coupon?.coupon,
      pinCode: pharmacyPincode,
      products: cartItems?.map((item) => ({
        sku: item?.id,
        categoryId: item?.productType,
        mrp: item?.price,
        quantity: item?.quantity,
        specialPrice: item?.specialPrice || item?.price,
      })),
      packageIds: packageId,
      email: g(currentPatient, 'emailAddress'),
    };
    setLoading(true);
    validateConsultCoupon(data)
      .then((resp: any) => {
        if (resp?.data?.errorCode == 0) {
          if (resp?.data?.response?.valid) {
            initiateOrder(paymentMode, bankCode, isCOD, hcOrder);
          } else {
            showAphAlert!({
              title: `Uh oh.. :(`,
              description: resp?.data?.response?.reason,
            });
            props.navigation.navigate(AppRoutes.MedicineCart);
          }
        } else {
          CommonBugFender('validatingPharmaCoupon', g(resp?.data, 'errorMsg'));
          showAphAlert!({
            title: `Uh oh.. :(`,
            description: 'Coupon validation failed',
          });
          props.navigation.navigate(AppRoutes.MedicineCart);
        }
      })
      .catch((error) => {
        CommonBugFender('validatingPharmaCoupon', error);
        console.log(error);
      });
  };

  const initiateOrder = async (
    paymentMode: string,
    bankCode: string,
    isCOD: boolean,
    hcOrder: boolean
  ) => {
    const estimatedAmount = !!circleMembershipCharges
      ? getFormattedAmount(grandTotal - circleMembershipCharges)
      : getFormattedAmount(grandTotal);
    setLoading && setLoading(true);
    const selectedStore = storeId && stores.find((item) => item.storeid == storeId);
    const { storename, address, workinghrs, phone, city, state, state_id } = selectedStore || {};
    const orderInfo: saveMedicineOrderOMSVariables = {
      medicineCartOMSInput: {
        tatType: tatType,
        storeDistanceKm: Number(storeDistance?.toFixed(3)) || 0,
        coupon: coupon ? coupon.coupon : '',
        couponDiscount: coupon ? getFormattedAmount(couponDiscount) : 0,
        productDiscount: getFormattedAmount(productDiscount) || 0,
        quoteId: null,
        patientId:
          (prescriptionType === PrescriptionType.CONSULT && consultProfile?.id) ||
          currentPatient?.id ||
          '',
        shopId: isStorePickup ? storeId : paramShopId || null,
        shopAddress: selectedStore
          ? {
              storename,
              address,
              workinghrs,
              phone,
              city,
              state,
              zipcode: pinCode,
              stateCode: state_id,
            }
          : null,
        showPrescriptionAtStore: storeId ? showPrescriptionAtStore : false,
        patientAddressId: deliveryAddressId,
        medicineDeliveryType: deliveryType!,
        devliveryCharges: deliveryCharges,
        packagingCharges: packagingCharges,
        estimatedAmount,
        prescriptionType,
        prescriptionImageUrl: [
          ...physicalPrescriptions.map((item) => item.uploadedUrl),
          ...ePrescriptions.map((item) => item.uploadedUrl),
        ].join(','),
        prismPrescriptionFileId: [
          ...physicalPrescriptions.map((item) => item.prismPrescriptionFileId),
          ...ePrescriptions.map((item) => item.prismPrescriptionFileId),
        ].join(','),
        orderTat:
          deliveryAddressId &&
          moment(deliveryTime, AppConfig.Configuration.TAT_API_RESPONSE_DATE_FORMAT).isValid()
            ? deliveryTime
            : '',
        items: cartItems.map((item) => {
          const discountedPrice = getFormattedAmount(
            coupon && item.couponPrice == 0
              ? 0
              : (coupon && item.couponPrice) || item.specialPrice || item.price
          ); // since couponPrice & specialPrice can be undefined
          return {
            medicineSKU: item.id,
            medicineName: item.name,
            quantity: item.quantity,
            mrp: getFormattedAmount(item.price),
            price: discountedPrice,
            specialPrice: Number(item.specialPrice || item.price),
            itemValue: getFormattedAmount(item.price * item.quantity), // (multiply MRP with quantity)
            itemDiscount: getFormattedAmount(
              item.price * item.quantity - discountedPrice * item.quantity
            ), // (diff of (MRP - discountedPrice) * quantity)
            isPrescriptionNeeded: item.prescriptionRequired ? 1 : 0,
            mou: Number(item.mou),
            isMedicine: item.isMedicine ? '1' : '0',
            couponFree: item?.isFreeCouponProduct ? 1 : 0,
          } as MedicineCartOMSItem;
        }),
        bookingSource: BOOKINGSOURCE.MOBILE,
        deviceType: Platform.OS == 'android' ? DEVICE_TYPE.ANDROID : DEVICE_TYPE.IOS,
        healthCreditUsed: hcOrder ? getFormattedAmount(grandTotal) : 0,
        subscriptionDetails: circleSubscriptionId
          ? { userSubscriptionId: circleSubscriptionId }
          : null,
        planPurchaseDetails: !!circleMembershipCharges
          ? {
              TYPE: Circle.CARE_PLAN,
              PlanAmount: circleMembershipCharges || 0,
              planId: Circle.CIRCLEPlan,
              subPlanId: circleSubPlanId || '',
            }
          : null,
        totalCashBack: !coupon?.coupon && isCircleSubscription ? Number(cartTotalCashback) || 0 : 0,
        appVersion: DeviceInfo.getVersion(),
        savedDeliveryCharge:
          !!isFreeDelivery || isCircleSubscription ? 0 : AppConfig.Configuration.DELIVERY_CHARGES,
      },
    };

    const planPurchaseDetails: PLAN_PURCHASE_DETAILS_PHARMA = {
      TYPE: PLAN.CARE_PLAN,
      PlanAmount: circleMembershipCharges || 0,
      planId: Circle.CIRCLEPlan,
      subPlanId: circleSubPlanId || '',
    };
    const OrderInfoV2: saveMedicineOrderV2Variables = {
      medicineOrderInput: {
        patientId:
          (prescriptionType === PrescriptionType.CONSULT && consultProfile?.id) ||
          currentPatient?.id ||
          '',
        medicineDeliveryType: deliveryType!,
        estimatedAmount,
        bookingSource: BOOKINGSOURCE.MOBILE,
        deviceType: Platform.OS == 'android' ? DEVICE_TYPE.ANDROID : DEVICE_TYPE.IOS,
        appVersion: DeviceInfo.getVersion(),
        coupon: coupon ? coupon.coupon : '',
        patientAddressId: deliveryAddressId,
        prescriptionType,
        prescriptionImageUrl: [
          ...physicalPrescriptions.map((item) => item.uploadedUrl),
          ...ePrescriptions.map((item) => item.uploadedUrl),
        ].join(','),
        prismPrescriptionFileId: [
          ...physicalPrescriptions.map((item) => item.prismPrescriptionFileId),
          ...ePrescriptions.map((item) => item.prismPrescriptionFileId),
        ].join(','),
        customerComment: '',
        subscriptionDetails: circleSubscriptionId
          ? { userSubscriptionId: circleSubscriptionId }
          : null,
        planPurchaseDetails: !!circleMembershipCharges ? planPurchaseDetails : null,
        healthCreditUsed: hcOrder ? getFormattedAmount(grandTotal) : 0,
        shipments: shipments,
      },
    };

    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_PAYMENT_INITIATED] = {
      'Payment mode': isCashOnDelivery ? 'COD' : 'Online',
      Amount: grandTotal,
      'Service Area': 'Pharmacy',
      'Cart Items': JSON.stringify(cartItems),
      Coupon: coupon ? coupon.coupon : '',
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_PAYMENT_INITIATED, eventAttributes);

    isStorePickup
      ? saveOrder(orderInfo)
          .then(({ data }) => {
            const { orderId, orderAutoId, errorCode, errorMessage } =
              g(data, 'saveMedicineOrderOMS')! || {};

            if (errorCode || errorMessage) {
              // Order-failed
              showAphAlert!({
                title: `Uh oh.. :(`,
                description: `Order failed, ${errorMessage}.`,
              });
              setLoading && setLoading(false);
              return;
            } else {
              if (isCOD) {
                placeOrder(orderId, orderAutoId, 'COD', true);
              } else if (hcOrder) {
                placeOrder(orderId, orderAutoId, 'HCorder', false);
              } else {
                let orders: (saveMedicineOrderV2_saveMedicineOrderV2_orders | null)[] = [];
                orders[0] = {
                  __typename: 'MedicineOrderIds',
                  id: orderId,
                  orderAutoId: orderAutoId,
                };
                redirectToPaymentGateway(orders, orderAutoId, paymentMode, bankCode, orderInfo)
                  .catch((e) => {
                    CommonBugFender('CheckoutScene_redirectToPaymentGateway', e);
                  })
                  .finally(() => {
                    setLoading && setLoading(false);
                  });
              }
            }
          })
          .catch((error) => {
            CommonBugFender('CheckoutScene_saveOrder', error);
            setLoading && setLoading(false);

            const isPriceMismatch =
              g(error, 'graphQLErrors', '0', 'message') ==
              'SAVE_MEDICINE_ORDER_INVALID_AMOUNT_ERROR';
            const isCouponError =
              g(error, 'graphQLErrors', '0' as any, 'message') == 'INVALID_COUPON_CODE';

            if (isPriceMismatch || isCouponError) {
              props.navigation.goBack();
            }

            showAphAlert!({
              title: string.common.uhOh,
              description: isPriceMismatch
                ? 'Your order failed due to mismatch in cart items price. Please remove items from cart and add again to place order.'
                : isCouponError
                ? 'Sorry, invalid coupon applied. Remove the coupon and try again.'
                : `Your order failed due to some temporary issue :( Please submit the order again.`,
            });
          })
      : saveOrderV2(OrderInfoV2)
          .then(({ data }) => {
            const { orders, transactionId, errorCode, errorMessage } =
              data?.saveMedicineOrderV2 || {};
            if (errorCode || errorMessage) {
              showAphAlert!({
                title: `Uh oh.. :(`,
                description: `Order failed, ${errorMessage}.`,
              });
              setLoading?.(false);
              return;
            } else {
              if (isCOD) {
                placeOrderV2(orders!, transactionId!, 'COD', true);
              } else if (hcOrder) {
                placeOrderV2(orders!, transactionId!, 'HCorder', false);
              } else {
                redirectToPaymentGateway(
                  orders!,
                  transactionId!,
                  paymentMode,
                  bankCode,
                  OrderInfoV2
                )
                  .catch((e) => {
                    CommonBugFender('CheckoutScene_redirectToPaymentGateway', e);
                  })
                  .finally(() => {
                    setLoading && setLoading(false);
                  });
              }
            }
          })
          .catch((error) => {
            CommonBugFender('CheckoutScene_saveOrder', error);
            setLoading && setLoading(false);

            const isPriceMismatch =
              g(error, 'graphQLErrors', '0', 'message') ==
              'SAVE_MEDICINE_ORDER_INVALID_AMOUNT_ERROR';
            const isCouponError =
              g(error, 'graphQLErrors', '0' as any, 'message') == 'INVALID_COUPON_CODE';

            if (isPriceMismatch || isCouponError) {
              props.navigation.goBack();
            }

            showAphAlert!({
              title: string.common.uhOh,
              description: isPriceMismatch
                ? 'Your order failed due to mismatch in cart items price. Please remove items from cart and add again to place order.'
                : isCouponError
                ? 'Sorry, invalid coupon applied. Remove the coupon and try again.'
                : `Your order failed due to some temporary issue :( Please submit the order again.`,
            });
          });
  };

  const firePurchaseEvent = (orderId: string) => {
    let items: any = [];
    cartItems.forEach((item, index) => {
      let itemObj: any = {};
      itemObj.item_name = item.name; // Product Name or Doctor Name
      itemObj.item_id = item.id; // Product SKU or Doctor ID
      itemObj.price = item.specialPrice ? item.specialPrice : item.price; // Product Price After discount or Doctor VC price (create another item in array for PC price)
      itemObj.item_brand = ''; // Product brand or Apollo (for Apollo doctors) or Partner Doctors (for 3P doctors)
      itemObj.item_category = 'Pharmacy'; // 'Pharmacy' or 'Consultations'
      itemObj.item_category2 = item.isMedicine ? 'Drug' : 'FMCG'; // FMCG or Drugs (for Pharmacy) or Specialty Name (for Consultations)
      itemObj.item_variant = 'Default'; // "Default" (for Pharmacy) or Virtual / Physcial (for Consultations)
      itemObj.index = index + 1; // Item sequence number in the list
      itemObj.quantity = item.quantity; // "1" or actual quantity
      items.push(itemObj);
    });
    let code: any = coupon ? coupon.coupon : null;
    const eventAttributes: FirebaseEvents[FirebaseEventName.PURCHASE] = {
      coupon: code,
      currency: 'INR',
      items: items,
      transaction_id: orderId,
      value: getFormattedAmount(grandTotal),
      LOB: 'Pharma',
    };
    postFirebaseEvent(FirebaseEventName.PURCHASE, eventAttributes);
  };

  const renderHeader = () => {
    return (
      <Header
        container={styles.headerContainerStyle}
        leftIcon={'backArrow'}
        title={'PAYMENT'}
        onPressLeftIcon={() => {
          CommonLogEvent(AppRoutes.CheckoutSceneNew, 'Go back clicked');
          props.navigation.goBack();
        }}
      />
    );
  };

  const rendertotalAmount = () => {
    const careStyle = StyleSheet.create({
      careSaving: {
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        justifyContent: 'center',
        paddingBottom: 10,
      },
      titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 7,
      },
      totalContainer: {
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 10,
      },
      logoStyle: {
        resizeMode: 'contain',
        width: 40,
        height: 30,
      },
    });
    const membershipCharges = circleMembershipCharges || 0;
    return (
      <View style={styles.amountCont}>
        <View style={careStyle.careSaving}>
          <Text style={theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 20)}>
            BILL TOTAL
          </Text>
        </View>
        <View style={careStyle.titleContainer}>
          <Text style={theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE, 1, 20)}>
            Bill Amount
          </Text>
          <Text style={styles.grandTotalTxt}>
            {string.common.Rs} {getFormattedAmount(grandTotal - membershipCharges + couponDiscount)}
          </Text>
        </View>
        {couponDiscount != 0 && (
          <View style={careStyle.titleContainer}>
            <View style={{ ...styles.subCont, marginTop: 2 }}>
              <View>
                <Text style={theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE, 1, 20)}>
                  Coupon Applied
                </Text>
                <Text style={theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE, 1, 20)}>
                  ({coupon?.coupon})
                </Text>
              </View>
            </View>
            <Text style={styles.grandTotalTxt}>
              - {string.common.Rs} {getFormattedAmount(couponDiscount)}
            </Text>
          </View>
        )}
        {burnHC != 0 && (
          <View style={careStyle.titleContainer}>
            <View style={{ ...styles.subCont, marginTop: couponDiscount != 0 ? 0 : 2 }}>
              <Text style={theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE, 1, 20)}>
                OneApollo HC
              </Text>
            </View>
            <Text style={styles.grandTotalTxt}>
              - {string.common.Rs} {getFormattedAmount(burnHC)}
            </Text>
          </View>
        )}
        {!!circleMembershipCharges && (
          <View style={careStyle.titleContainer}>
            <Text style={theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE, 1, 20)}>
              Circle Membership
            </Text>
            <Text style={styles.grandTotalTxt}>
              {string.common.Rs} {convertNumberToDecimal(circleMembershipCharges)}
            </Text>
          </View>
        )}
        <View style={careStyle.totalContainer}>
          <Text style={theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 20)}>
            TOTAL
          </Text>
          <Text style={styles.grandTotalTxt}>
            {string.common.Rs} {getFormattedAmount(grandTotal - burnHC)}
          </Text>
        </View>
      </View>
    );
  };

  const getTotalCashbackAmount = () => {
    if (burnHC != 0) {
      return getFormattedAmount(
        (Number(cartTotalCashback) * Number(grandTotal - burnHC)) / Number(grandTotal)
      );
    } else {
      return cartTotalCashback;
    }
  };

  const renderCareSavings = () => {
    const careStyle = StyleSheet.create({
      careSavingsContainer: {
        ...theme.viewStyles.cardViewStyle,
        borderRadius: 9,
        paddingHorizontal: 10,
        paddingVertical: 9,
        borderColor: '#00B38E',
        borderWidth: 3,
        borderStyle: 'dashed',
        margin: 0.05 * windowWidth,
      },
      rowSpaceBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
      circleLogo: {
        resizeMode: 'contain',
        width: 40,
        height: 25,
      },
      totalAmountContainer: {
        borderTopColor: '#979797',
        borderTopWidth: 0.5,
        paddingTop: 5,
        marginTop: 10,
      },
      totalAmount: {
        ...theme.viewStyles.text('B', 14, '#02475B', 1, 20),
        textAlign: 'right',
      },
      youText: {
        ...theme.fonts.IBMPlexSansRegular(13),
        lineHeight: 25,
        color: '#02475B',
      },
    });
    const deliveryFee = AppConfig.Configuration.DELIVERY_CHARGES;
    return (
      <View style={careStyle.careSavingsContainer}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setShowCareDetails(!showCareDetails);
          }}
        >
          <View
            style={[
              careStyle.rowSpaceBetween,
              {
                paddingBottom: 7,
                borderBottomWidth: showCareDetails ? 0.8 : 0,
                borderBottomColor: '#E5E5E5',
              },
            ]}
          >
            <View style={{ flexDirection: 'row' }}>
              <CircleLogo style={careStyle.circleLogo} />
              <Text style={careStyle.youText}> helped you save</Text>
            </View>
            <Down
              style={{
                height: 15,
                transform: [{ rotate: showCareDetails ? '180deg' : '0deg' }],
                marginTop: 5,
              }}
            />
          </View>
        </TouchableOpacity>
        {showCareDetails && (
          <View>
            {Number(grandTotal) - Number(burnHC) > 1 && (
              <View style={[careStyle.rowSpaceBetween, { marginTop: 7 }]}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={theme.viewStyles.text('R', 14, '#00B38E', 1, 20)}>
                    Membership Cashback
                  </Text>
                </View>
                <Text style={theme.viewStyles.text('R', 14, '#00B38E', 1, 20)}>
                  ₹{getTotalCashbackAmount()}
                </Text>
              </View>
            )}
            {!!deliveryFee && (
              <View style={[careStyle.rowSpaceBetween, { marginTop: 10 }]}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={theme.viewStyles.text('R', 14, '#00B38E', 1, 20)}>
                    Delivery Savings
                  </Text>
                </View>
                <Text style={theme.viewStyles.text('R', 14, '#00B38E', 1, 20)}>
                  ₹{deliveryFee.toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  useEffect(() => {
    // hide payment options if to pay (after hc) is zero
    setShowPaymentOptions(grandTotal - burnHC != 0);
  }, [burnHC]);

  useEffect(() => {
    if (isOneApolloSelected) {
      setCashOnDelivery(false);
    }
  }, [isOneApolloSelected]);

  const renderOneApolloOption = () => {
    return (
      <View>
        <Text style={styles.oneApolloHeaderTxt} numberOfLines={2}>
          Would you like to use Apollo Health Credits for this payment?
        </Text>
        <View style={{ ...styles.border }}></View>
        <TouchableOpacity
          onPress={() => {
            if (isOneApolloSelected) {
              setisOneApolloSelected(false);
              setBurnHC(0);
              setHCorder(false);
            } else {
              setisOneApolloSelected(true);
              if (
                availableHC >= getFormattedAmount(grandTotal - deliveryCharges - packagingCharges)
              ) {
                setBurnHC(getFormattedAmount(grandTotal - deliveryCharges - packagingCharges));
                if (deliveryCharges + packagingCharges == 0) {
                  setHCorder(true);
                }
              } else {
                setBurnHC(availableHC);
              }
            }
          }}
          style={{
            ...styles.paymentModeCard,
            height: 0.09 * windowHeight,
            flexDirection: 'row',
            paddingVertical: 0.017 * windowHeight,
            marginBottom: 0,
          }}
        >
          <View style={{ flex: 0.16, justifyContent: 'center', alignItems: 'center' }}>
            {isOneApolloSelected ? <CheckedIcon /> : <CheckUnselectedIcon />}
          </View>
          <View
            style={{
              flex: 0.3,
              borderRightWidth: 1,
              borderRightColor: 'rgba(2, 71, 91, 0.3)',
              justifyContent: 'center',
            }}
          >
            <OneApollo style={{ height: 0.053 * windowHeight, width: 0.068 * windowHeight }} />
          </View>
          <View style={{ flex: 0.54, marginLeft: 15 }}>
            <Text style={styles.availableHCTxt}>Available Health Credits</Text>
            <Text style={styles.availableHC}>{(availableHC || 0).toFixed(2)}</Text>
          </View>
          <View></View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPaymentOptions = () => {
    return (
      <View>
        <View
          style={{
            width: 0.9 * windowWidth,
            margin: 0.05 * windowWidth,
            marginTop: 20,
            marginBottom: 0,
          }}
        >
          <Text style={{ ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 20) }}>
            PAY VIA
          </Text>
        </View>
        <View style={styles.border}></View>
        <FlatList
          data={paymentOptions}
          horizontal={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                if (!HCorder) {
                  setCashOnDelivery(false);
                  validateCouponAndInitiateOrder(item?.paymentMode, '', false, false);
                }
              }}
              style={styles.paymentModeCard}
            >
              <View
                style={{
                  flex: 0.16,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Image source={{ uri: item.imageUrl }} style={{ width: 30, height: 30 }} />
              </View>
              <View
                style={{
                  flex: 0.84,
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                }}
              >
                <Text
                  style={{ ...theme.viewStyles.text('SB', 14, theme.colors.APP_YELLOW, 1, 20) }}
                >
                  {' '}
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.name}
        />
      </View>
    );
  };

  const renderNetBanking = () => {
    return (
      <View>
        <View
          style={{
            width: 0.9 * windowWidth,
            margin: 0.05 * windowWidth,
            marginTop: 0,
            marginBottom: 0,
          }}
        >
          <Text style={{ ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 20) }}>
            NET BANKING
          </Text>
        </View>
        <View
          style={{
            width: 0.9 * windowWidth,
            height: 1,
            backgroundColor: 'rgba(2, 71, 91, 0.2)',
            margin: 0.05 * windowWidth,
            marginTop: 0.01 * windowWidth,
            marginBottom: 0.03 * windowWidth,
          }}
        ></View>
        <View style={styles.netBankingCard}>
          <View style={{ flex: 0.65, flexDirection: 'row' }}>
            <FlatList
              data={bankOptions.slice(0, 4)}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setCashOnDelivery(false);
                    validateCouponAndInitiateOrder(item?.paymentMode, item?.bankCode, false, false);
                  }}
                  style={{ width: 0.225 * windowWidth, flex: 1 }}
                >
                  <View
                    style={{
                      flex: 0.65,
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}
                  >
                    <Image source={{ uri: item.imageUrl }} style={{ width: 40, height: 40 }} />
                  </View>
                  <View
                    style={{
                      flex: 0.35,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 20),
                      }}
                    >
                      {' '}
                      {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.name}
            />
          </View>
          <View style={{ flex: 0.35, flexDirection: 'row' }}>
            <TouchableOpacity
              style={{
                flex: 0.3,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                setCashOnDelivery(false);
                validateCouponAndInitiateOrder('NB', '', false, false);
              }}
            >
              <Text
                style={{
                  ...theme.viewStyles.text('SB', 14, theme.colors.SEARCH_UNDERLINE_COLOR, 1, 20),
                }}
              >
                See All
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  const renderNewCOD = () => {
    const total = grandTotal - burnHC;
    const isValidForCOD =
      minCartValueForCOD && maxCartValueForCOD
        ? minCartValueForCOD <= total && total <= maxCartValueForCOD
        : true;
    return (
      <View>
        <Button
          disabled={!isValidForCOD || isOneApolloSelected || !!circleMembershipCharges}
          style={styles.CODoption}
          title={'CASH ON DELIVERY'}
          onPress={() => validateCouponAndInitiateOrder('', '', true, false)}
        />
        {!isValidForCOD ? (
          <Text style={styles.codAlertMsg}>
            {`COD option is available for Order values between ₹${minCartValueForCOD} and ₹${maxCartValueForCOD}`}
          </Text>
        ) : !!circleMembershipCharges ? (
          <Text style={styles.codAlertMsg}>
            {'!Remove Circle Membership on Cart Page to avail COD'}
          </Text>
        ) : !!isOneApolloSelected ? (
          <Text style={styles.codAlertMsg}>
            {'! COD option is not available along with OneApollo Health Credits.'}
          </Text>
        ) : null}
      </View>
    );
  };

  const renderPlaceorder = () => {
    return (
      <View
        style={{
          marginTop: 0.05 * windowHeight,
          height: 0.12 * windowHeight,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Button
          style={{
            height: 0.06 * windowHeight,
            width: 0.75 * windowWidth,
            backgroundColor: theme.colors.BUTTON_BG,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          title={'PLACE ORDER'}
          onPress={() => {
            if (isCashOnDelivery) {
              validateCouponAndInitiateOrder('', '', true, false);
            } else if (HCorder) {
              validateCouponAndInitiateOrder('', '', false, true);
            }
          }}
        />
      </View>
    );
  };

  let ScrollViewRef: any;
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {!loading ? (
          <ScrollView
            style={{ flex: 0.9 }}
            ref={(ref) => (ScrollViewRef = ref)}
            onContentSizeChange={() => scrollToend && ScrollViewRef.scrollToEnd({ animated: true })}
          >
            {rendertotalAmount()}
            {!!cartTotalCashback && isCircleSubscription && renderCareSavings()}
            {availableHC != 0 && renderOneApolloOption()}
            {renderNewCOD()}
            {showPaymentOptions && (
              <>
                {renderPaymentOptions()}
                {bankOptions.length > 0 && renderNetBanking()}
              </>
            )}
            {(isCashOnDelivery || HCorder) && renderPlaceorder()}
          </ScrollView>
        ) : (
          <Spinner />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainerStyle: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  paymentModeCard: {
    flex: 1,
    flexDirection: 'row',
    width: 0.9 * windowWidth,
    height: 0.08 * windowHeight,
    borderRadius: 9,
    backgroundColor: theme.colors.WHITE,
    margin: 0.05 * windowWidth,
    marginTop: 0,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  netBankingCard: {
    flex: 1,
    width: 0.9 * windowWidth,
    height: 0.22 * windowHeight,
    borderRadius: 10,
    backgroundColor: theme.colors.WHITE,
    margin: 0.05 * windowWidth,
    marginTop: 0,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  separator: {
    backgroundColor: theme.colors.LIGHT_BLUE,
    height: 1,
    opacity: 0.1,
    marginBottom: 15,
    marginTop: 8,
  },
  stickyBottomComponentStyle: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  textStyle1: {
    ...theme.viewStyles.text('R', 13, '#02475b'),
    textAlign: 'justify',
    paddingTop: 27,
  },
  textStyle2: {
    ...theme.viewStyles.text('M', 13, '#02475b'),
    textAlign: 'justify',
  },
  textStyle3: {
    ...theme.viewStyles.text('R', 13, '#02475b'),
    marginBottom: 5,
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  checkboxViewStyle: {
    flexDirection: 'row',
    marginTop: 10,
  },
  checkboxTextStyle: {
    ...theme.viewStyles.text('R', 13, '#02475b'),
    flex: 1,
    marginLeft: 6,
    marginRight: 16,
  },
  separatorStyle: {
    marginTop: 19,
    marginBottom: 20,
    backgroundColor: '#02475b',
    opacity: 0.1,
  },
  border: {
    width: 0.9 * windowWidth,
    height: 1,
    backgroundColor: 'rgba(2, 71, 91, 0.2)',
    margin: 0.05 * windowWidth,
    marginTop: 0.01 * windowWidth,
    marginBottom: 0.03 * windowWidth,
  },
  amountCont: {
    ...theme.viewStyles.cardContainer,
    flex: 1,
    width: 0.9 * windowWidth,
    borderRadius: 9,
    margin: 0.05 * windowWidth,
    marginBottom: 0,
    padding: 10,
  },
  toPay: {
    flex: 0.45,
    justifyContent: 'center',
    paddingLeft: 0.04 * windowWidth,
  },
  total: {
    flex: 0.45,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginRight: 0.02 * windowWidth,
  },
  arrow: {
    flex: 0.1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  grandTotalTxt: {
    ...theme.fonts.IBMPlexSansBold(14),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 20,
  },
  amountCard: {
    backgroundColor: theme.colors.WHITE,
    padding: 0.04 * windowWidth,
    marginHorizontal: 0.05 * windowWidth,
    borderBottomRightRadius: 9,
    borderBottomLeftRadius: 9,
  },
  SubtotalTxt: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
  },
  discountTxt: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SKY_BLUE,
    lineHeight: 24,
  },
  toPayBorder: {
    marginTop: 0.04 * windowWidth,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2, 71, 91, 0.2)',
  },
  subCont: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  oneApolloHeaderTxt: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
    marginHorizontal: 0.05 * windowWidth,
    lineHeight: 20,
    marginBottom: 3,
    marginTop: 10,
  },
  availableHC: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
  },
  availableHCTxt: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: 'rgba(2, 71, 91, 0.6)',
    lineHeight: 20,
  },
  CODoption: {
    marginTop: 0.05 * windowWidth,
    height: 0.06 * windowHeight,
    width: 0.9 * windowWidth,
    marginHorizontal: 0.05 * windowWidth,
  },
  codAlertMsg: {
    ...theme.viewStyles.text('B', 11, theme.colors.LIGHT_BLUE, 1, 18),
    marginTop: 6,
    marginHorizontal: 25,
  },
});
