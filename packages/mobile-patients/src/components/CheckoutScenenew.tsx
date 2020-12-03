import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CheckUnselectedIcon,
  MedicineIcon,
  CheckedIcon,
  OneApollo,
  CircleLogo,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  SAVE_MEDICINE_ORDER_OMS,
  SAVE_MEDICINE_ORDER_PAYMENT,
  GET_ONEAPOLLO_USER,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  MedicineCartOMSItem,
  MEDICINE_ORDER_PAYMENT_TYPE,
  CODCity,
  BOOKINGSOURCE,
  DEVICETYPE,
  ONE_APOLLO_STORE_CODE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  saveMedicineOrderOMS,
  saveMedicineOrderOMSVariables,
} from '@aph/mobile-patients/src/graphql/types/saveMedicineOrderOMS';
import {
  aphConsole,
  g,
  handleGraphQlError,
  postWebEngageEvent,
  formatAddress,
  postAppsFlyerEvent,
  postFirebaseEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect, useRef } from 'react';
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
import firebaseAuth from '@react-native-firebase/auth';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import {
  SaveMedicineOrderPaymentMq,
  SaveMedicineOrderPaymentMqVariables,
} from '@aph/mobile-patients/src/graphql/types/SaveMedicineOrderPaymentMq';
import moment from 'moment';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { fetchPaymentOptions, trackTagalysEvent } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  AppsFlyerEventName,
  AppsFlyerEvents,
} from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { FirebaseEvents, FirebaseEventName } from '../helpers/firebaseEvents';
import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { Down, Up } from '@aph/mobile-patients/src/components/ui/Icons';
import { Tagalys } from '@aph/mobile-patients/src/helpers/Tagalys';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { Circle } from '@aph/mobile-patients/src/strings/strings.json';
import { CareCashbackBanner } from '@aph/mobile-patients/src/components/ui/CareCashbackBanner';

export interface CheckoutSceneNewProps extends NavigationScreenProps {}

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export const CheckoutSceneNew: React.FC<CheckoutSceneNewProps> = (props) => {
  const deliveryTime = props.navigation.getParam('deliveryTime');
  const isChennaiOrder = props.navigation.getParam('isChennaiOrder');
  const tatType = props.navigation.getParam('tatType');
  const storeDistance: number = props.navigation.getParam('storeDistance');
  const paramShopId = props.navigation.getParam('shopId');
  const isStorePickup = props.navigation.getParam('isStorePickup');
  const circlePlanId = AppConfig.Configuration.CIRCLE_PLAN_ID;
  const { currentPatient } = useAllCurrentPatients();
  const [isCashOnDelivery, setCashOnDelivery] = useState(false);
  const [showChennaiOrderForm, setShowChennaiOrderForm] = useState(false);
  const [chennaiOrderFormInfo, setChennaiOrderFormInfo] = useState(['', '']); // storing paymentMode, bankCode for Chennai Order
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string>(g(currentPatient, 'emailAddress') || '');
  const [emailIdCheckbox, setEmailIdCheckbox] = useState<boolean>(
    !g(currentPatient, 'emailAddress')
  );
  const [agreementCheckbox, setAgreementCheckbox] = useState<boolean>(false);
  const { showAphAlert, hideAphAlert } = useUIElements();
  const {
    deliveryAddressId,
    storeId,
    showPrescriptionAtStore,
    grandTotal,
    deliveryCharges,
    packagingCharges,
    cartItems,
    deliveryType,
    clearCartInfo,
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
  } = useShoppingCart();

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
  const [showOneApolloOption, setShowOneApolloOption] = useState<boolean>(false);
  const [availableHC, setAvailableHC] = useState<number>(0);
  const [isOneApolloSelected, setisOneApolloSelected] = useState<boolean>(false);
  const [burnHC, setBurnHC] = useState<number>(0);
  const [HCorder, setHCorder] = useState<boolean>(false);
  const [scrollToend, setScrollToend] = useState<boolean>(false);
  const client = useApolloClient();

  useEffect(() => {
    if (email) {
      setEmailIdCheckbox(false);
    } else {
      setEmailIdCheckbox(true);
    }
  }, [emailIdCheckbox, email]);

  const getFormattedAmount = (num: number) => Number(num.toFixed(2));

  const handleBackPressFromChennaiOrderForm = () => setShowChennaiOrderForm(false);

  const saveOrder = (orderInfo: saveMedicineOrderOMSVariables) =>
    client.mutate<saveMedicineOrderOMS, saveMedicineOrderOMSVariables>({
      mutation: SAVE_MEDICINE_ORDER_OMS,
      variables: orderInfo,
    });

  const savePayment = (paymentInfo: SaveMedicineOrderPaymentMqVariables) =>
    client.mutate<SaveMedicineOrderPaymentMq, SaveMedicineOrderPaymentMqVariables>({
      mutation: SAVE_MEDICINE_ORDER_PAYMENT,
      variables: paymentInfo,
    });

  useEffect(() => {
    fetchHealthCredits();
    fetchPaymentOptions()
      .then((res: any) => {
        // console.log(JSON.stringify(res), 'objobj');
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
        console.log(error);
        props.navigation.navigate(AppRoutes.MedicineCart);
        renderErrorPopup(string.common.tryAgainLater);
      });
    return () => {
      // setLoading && setLoading(false);
    };
  }, []);

  const fetchHealthCredits = () => {
    client
      .query({
        query: GET_ONEAPOLLO_USER,
        variables: {
          patientId: currentPatient && currentPatient.id,
        },
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        console.log(res.data.getOneApolloUser);
        if (res.data.getOneApolloUser) {
          setAvailableHC(res.data.getOneApolloUser.availableHC);
        }
      })
      .catch((error) => {
        CommonBugFender('fetchingOneApolloUser', error);
        setAvailableHC(0);
        console.log(error);
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

  const getPrepaidCheckoutCompletedAppsFlyerEventAttributes = (orderId: string) => {
    const appsflyerEventAttributes: AppsFlyerEvents[AppsFlyerEventName.PHARMACY_CHECKOUT_COMPLETED] = {
      'customer id': currentPatient ? currentPatient.id : '',
      'cart size': cartItems.length,
      af_revenue: getFormattedAmount(grandTotal),
      af_currency: 'INR',
      'order id': orderId,
      'coupon applied': coupon ? true : false,
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
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_CHECKOUT_COMPLETED, eventAttributes);

    const appsflyerEventAttributes = {
      ...getPrepaidCheckoutCompletedAppsFlyerEventAttributes(`${orderId}`),
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
    console.log('placeOrder\t', { orderId, orderAutoId });
    const paymentInfo: SaveMedicineOrderPaymentMqVariables = {
      medicinePaymentMqInput: {
        // orderId: orderId,
        orderAutoId: orderAutoId,
        amountPaid: getFormattedAmount(grandTotal),
        paymentType:
          orderType == 'COD'
            ? MEDICINE_ORDER_PAYMENT_TYPE.COD
            : MEDICINE_ORDER_PAYMENT_TYPE.CASHLESS,
        paymentStatus: 'success',
        responseCode: '',
        responseMessage: '',
        // Values for chennai COD order
        email: isChennaiOrder && email ? email.trim() : null,
        CODCity: isChennaiOrder ? CODCity.CHENNAI : null,
      },
    };
    if (orderType == 'HCorder') {
      paymentInfo.medicinePaymentMqInput['amountPaid'] = 0;
      paymentInfo.medicinePaymentMqInput['paymentStatus'] = 'TXN_SUCCESS';
      paymentInfo.medicinePaymentMqInput['healthCredits'] = getFormattedAmount(grandTotal - circleMembershipCharges);
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
        console.log({ data });
        console.log({ errorCode, errorMessage });
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
            postwebEngageCheckoutCompletedEvent(
              `${orderAutoId}`,
              orderId,
              // orderType == 'COD',
              isCOD
            );
            firePurchaseEvent(orderId);
          } catch (error) {
            console.log(error);
          }
          clearCartInfo && clearCartInfo();
          props.navigation.navigate(AppRoutes.PharmacyPaymentStatus, {
            status: 'PAYMENT_PENDING',
            price: getFormattedAmount(grandTotal),
            orderId: orderAutoId,
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

  const redirectToPaymentGateway = async (
    orderId: string,
    orderAutoId: number,
    paymentMode: string,
    bankCode: string
  ) => {
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
    const token = await firebaseAuth().currentUser!.getIdToken();
    console.log({ token });
    const checkoutEventAttributes = {
      ...getPrepaidCheckoutCompletedEventAttributes(`${orderAutoId}`, false),
    };
    const appsflyerEventAttributes = {
      ...getPrepaidCheckoutCompletedAppsFlyerEventAttributes(`${orderId}`),
    };
    props.navigation.navigate(AppRoutes.PaymentScene, {
      orderId,
      orderAutoId,
      token,
      amount: getFormattedAmount(grandTotal - burnHC),
      burnHC: burnHC,
      deliveryTime,
      checkoutEventAttributes,
      appsflyerEventAttributes,
      paymentTypeID: paymentMode,
      bankCode: bankCode,
      coupon: coupon ? coupon.coupon : null,
      cartItems: cartItems,
      planId: circlePlanId || '',
      subPlanId: circleSubPlanId || '',
    });
  };

  const initiateOrder = async (
    paymentMode: string,
    bankCode: string,
    isCOD: boolean,
    hcOrder: boolean
  ) => {
    if (isChennaiOrder && !showChennaiOrderForm) {
      setChennaiOrderFormInfo([paymentMode, bankCode]);
      setShowChennaiOrderForm(true);
      return;
    }
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
        patientId: (currentPatient && currentPatient.id) || '',
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
            (coupon && item.couponPrice) || item.specialPrice || item.price
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
        deviceType: Platform.OS == 'android' ? DEVICETYPE.ANDROID : DEVICETYPE.IOS,
        healthCreditUsed: hcOrder ? getFormattedAmount(grandTotal) : 0,
        subscriptionDetails: circleSubscriptionId
          ? { userSubscriptionId: circleSubscriptionId }
          : null,
        planPurchaseDetails: circleSubPlanId
        ? {
            TYPE: Circle.CARE_PLAN,
            PlanAmount: circleMembershipCharges || 0,
            planId: Circle.CIRCLEPlan,
            subPlanId: circleSubPlanId || '',
          }
        : null,
        totalCashBack: (cartTotalCashback || circleSubscriptionId)
          ? Number(cartTotalCashback) || 0
          : 0,
      },
    };

    console.log(JSON.stringify(orderInfo));

    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_PAYMENT_INITIATED] = {
      'Payment mode': isCashOnDelivery ? 'COD' : 'Online',
      Amount: grandTotal,
      'Service Area': 'Pharmacy',
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_PAYMENT_INITIATED, eventAttributes);

    saveOrder(orderInfo)
      .then(({ data }) => {
        const { orderId, orderAutoId, errorCode, errorMessage } =
          g(data, 'saveMedicineOrderOMS')! || {};
        console.log({ orderAutoId, orderId, errorCode, errorMessage });

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
            console.log('isCashOnDelivery\t', { orderId, orderAutoId });
            placeOrder(orderId, orderAutoId, 'COD', true);
          } else if (hcOrder) {
            console.log('HCorder\t', { orderId, orderAutoId });
            placeOrder(orderId, orderAutoId, 'HCorder', false);
          } else {
            console.log('Redirect To Payment Gateway');
            redirectToPaymentGateway(orderId, orderAutoId, paymentMode, bankCode)
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
          g(error, 'graphQLErrors', '0', 'message') == 'SAVE_MEDICINE_ORDER_INVALID_AMOUNT_ERROR';
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
    };
    postFirebaseEvent(FirebaseEventName.PURCHASE, eventAttributes);
  };

  const handleOrderSuccess = (orderAutoId: string) => {
    console.log('handleOrderSuccess\n', { orderAutoId });
    props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        key: null,
        actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
      })
    );
    const deliveryTimeMomentFormat = moment(
      deliveryTime,
      AppConfig.Configuration.TAT_API_RESPONSE_DATE_FORMAT
    );
    showAphAlert!({
      // unDismissable: true,
      title: `Hi, ${(currentPatient && currentPatient.firstName) || ''} :)`,
      description:
        'Your order has been placed successfully. We will confirm the order in a few minutes.',
      children: (
        <View
          style={{
            margin: 20,
            marginTop: 16,
            padding: 16,
            backgroundColor: '#f7f8f5',
            borderRadius: 10,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <MedicineIcon />
            <Text
              style={{
                flex: 1,
                ...theme.fonts.IBMPlexSansMedium(17),
                lineHeight: 24,
                color: '#01475b',
              }}
            >
              Medicines
            </Text>
            <Text
              style={{
                flex: 1,
                ...theme.fonts.IBMPlexSansMedium(14),
                lineHeight: 24,
                color: '#01475b',
                textAlign: 'right',
              }}
            >
              {`#${orderAutoId}`}
            </Text>
          </View>
          {deliveryTimeMomentFormat.isValid() && (
            <>
              <View
                style={{
                  height: 1,
                  backgroundColor: '#02475b',
                  opacity: 0.1,
                  marginBottom: 7.5,
                  marginTop: 15.5,
                }}
              />
              <View>
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 12, '#02475b', 0.6, 20, 0.04),
                  }}
                >
                  {deliveryTime &&
                    `Delivery By: ${deliveryTimeMomentFormat.format(
                      AppConfig.Configuration.MED_DELIVERY_DATE_DISPLAY_FORMAT
                    )}`}
                </Text>
              </View>
            </>
          )}
          <View
            style={{
              height: 1,
              backgroundColor: '#02475b',
              opacity: 0.1,
              marginBottom: 15.5,
              marginTop: 7.5,
            }}
          />
          <View style={styles.popupButtonStyle}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => navigateToOrderDetails(true, orderAutoId)}
            >
              <Text style={styles.popupButtonTextStyle}>VIEW INVOICE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, alignItems: 'flex-end' }}
              onPress={() => navigateToOrderDetails(false, orderAutoId)}
            >
              <Text style={styles.popupButtonTextStyle}>TRACK ORDER</Text>
            </TouchableOpacity>
          </View>
        </View>
      ),
    });
  };

  const navigateToOrderDetails = (showOrderSummaryTab: boolean, orderAutoId: string) => {
    hideAphAlert!();
    props.navigation.navigate(AppRoutes.OrderDetailsScene, {
      goToHomeOnBack: true,
      showOrderSummaryTab,
      orderAutoId: orderAutoId,
    });
  };

  const renderHeader = () => {
    return (
      <Header
        container={styles.headerContainerStyle}
        leftIcon={'backArrow'}
        title={'PAYMENT'}
        onPressLeftIcon={() => {
          CommonLogEvent(AppRoutes.CheckoutSceneNew, 'Go back clicked');
          if (showChennaiOrderForm) {
            handleBackPressFromChennaiOrderForm();
          } else {
            props.navigation.goBack();
          }
        }}
      />
    );
  };

  const isSatisfyingEmailRegex = (value: string) =>
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      value
    );

  const onPressChennaiOrderPayButton = () => {
    if (!(email === '' || (email && isSatisfyingEmailRegex(email.trim())))) {
      showAphAlert!({ title: 'Uh oh.. :(', description: 'Enter valid email' });
    } else {
      try {
        CommonLogEvent(AppRoutes.CheckoutSceneNew, `SUBMIT TO CONFIRM ORDER`);
      } catch (error) {
        CommonBugFender('CheckoutScene_renderPayButton_try', error);
      }
      initiateOrder(chennaiOrderFormInfo[0], chennaiOrderFormInfo[1], isCashOnDelivery, HCorder);
    }
  };

  const renderChennaiOrderPayButton = () => {
    const isPayDisabled = !agreementCheckbox;
    return (
      <StickyBottomComponent
        style={[styles.stickyBottomComponentStyle, { paddingHorizontal: 0, paddingTop: 25 }]}
      >
        <Button
          style={{ width: '100%' }}
          title={`SUBMIT TO CONFIRM ORDER`}
          onPress={onPressChennaiOrderPayButton}
          disabled={isPayDisabled}
        />
      </StickyBottomComponent>
    );
  };

  const renderChennaiOrderFormAndPayButton = () => {
    const keyboardVerticalOffset =
      Platform.OS === 'android' ? { keyboardVerticalOffset: 110 } : { keyboardVerticalOffset: 30 };

    return (
      <View style={{ ...theme.viewStyles.card(16, 20, 10, '#fff'), flex: 1 }}>
        {/* <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'} {...keyboardVerticalOffset}> */}
        <ScrollView contentContainerStyle={{ flex: 1 }} bounces={false}>
          {renderChennaiOrderForm()}
          {renderChennaiOrderPayButton()}
        </ScrollView>
        {/* </KeyboardAvoidingView> */}
      </View>
    );
  };

  const renderChennaiOrderForm = () => {
    return (
      <>
        <Text style={styles.textStyle1}>
          {`Dear ${g(currentPatient, 'firstName') ||
            ''},\n\nSUPERB!\n\nYour order request is in process\n`}
        </Text>
        <Text style={styles.textStyle2}>
          {'Just one more step. New Regulation in your region requires your email id.\n'}
        </Text>
        <Text style={styles.textStyle3}>{'Your email id please'}</Text>
        <TextInputComponent
          value={`${email}`}
          onChangeText={(email) => setEmail(email)}
          placeholder={'name@email.com'}
          inputStyle={styles.inputStyle}
        />
        <TouchableOpacity
          onPress={() => setEmailIdCheckbox(!emailIdCheckbox)}
          activeOpacity={1}
          style={styles.checkboxViewStyle}
        >
          {emailIdCheckbox ? <CheckedIcon /> : <CheckUnselectedIcon />}
          <Text style={styles.checkboxTextStyle}>
            {
              'Check this box if you don’t have an Email Id & want us to share your order details over SMS.'
            }
          </Text>
        </TouchableOpacity>
        <Spearator style={styles.separatorStyle} />
        <TouchableOpacity
          onPress={() => setAgreementCheckbox(!agreementCheckbox)}
          activeOpacity={1}
          style={[styles.checkboxViewStyle, { marginTop: 0 }]}
        >
          {agreementCheckbox ? <CheckedIcon /> : <CheckUnselectedIcon />}
          <Text style={styles.checkboxTextStyle}>
            {'I agree to share my medicine requirements with Apollo Pharmacy for home delivery.'}
          </Text>
        </TouchableOpacity>
      </>
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
      totalContainer : {
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
            {string.common.Rs} {getFormattedAmount(grandTotal - burnHC - circleMembershipCharges + couponDiscount)}
          </Text>
        </View>
        {
          couponDiscount != 0 && (
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
          )
        }
        {
          burnHC != 0 && (
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
          )
        }
        {
          !!circleMembershipCharges && (
            <View style={careStyle.titleContainer}>
              <CareCashbackBanner
                bannerText={`Membership`}
                textStyle={theme.viewStyles.text('M', 14, '#00B38E', 1, 18)}
                logoStyle={careStyle.logoStyle}
              />
              <Text style={[styles.grandTotalTxt, {color: '#00B38E', lineHeight: 24,}]}>
                {string.common.Rs} {circleMembershipCharges}
              </Text>
            </View>
          )
        }
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
        height: 20,
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
    });
    const deliveryFee = AppConfig.Configuration.DELIVERY_CHARGES;
    return (
      <View style={careStyle.careSavingsContainer}>
        <View style={careStyle.rowSpaceBetween}>
          <View
            style={{
              flexDirection: 'row',
            }}
          >
            <CircleLogo style={careStyle.circleLogo} />
            <Text style={theme.viewStyles.text('R', 14, '#00B38E', 1, 20)}>
              Membership Cashback
            </Text>
          </View>
          <Text style={theme.viewStyles.text('R', 14, '#00B38E', 1, 20)}>₹{cartTotalCashback}</Text>
        </View>
        {!!deliveryFee && (
          <View style={[careStyle.rowSpaceBetween, { marginTop: 10 }]}>
            <View style={{ flexDirection: 'row' }}>
              <CircleLogo style={careStyle.circleLogo} />
              <Text style={theme.viewStyles.text('R', 14, '#00B38E', 1, 20)}>Delivery Savings</Text>
            </View>
            <Text style={theme.viewStyles.text('R', 14, '#00B38E', 1, 20)}>
              ₹{deliveryFee.toFixed(2)}
            </Text>
          </View>
        )}
      </View>
    );
  };

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
                  setScrollToend(true);
                  setTimeout(() => {
                    setScrollToend(false);
                  }, 500);
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
                  initiateOrder(item.paymentMode, '', false, false);
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
                    initiateOrder(item.paymentMode, item.bankCode, false, false);
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
                initiateOrder('NB', '', false, false);
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
  const renderCOD = () => {
    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            if (!isOneApolloSelected) {
              setCashOnDelivery(!isCashOnDelivery);
              setScrollToend(true);
              setTimeout(() => {
                setScrollToend(false);
              }, 500);
            }
          }}
          disabled={!!isOneApolloSelected}
          style={{
            ...styles.paymentModeCard,
            marginBottom: 10,
            flexDirection: 'column',
            justifyContent: 'center',
            height: isOneApolloSelected ? 'auto' : 0.08 * windowHeight,
            paddingVertical: 20,
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <View
              style={{
                opacity: isOneApolloSelected ? 0.5 : 1,
                flex: 0.16,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {isCashOnDelivery ? <CheckedIcon /> : <CheckUnselectedIcon />}
            </View>
            <View
              style={{
                opacity: isOneApolloSelected ? 0.5 : 1,
                flex: 0.84,
                justifyContent: 'center',
                alignItems: 'flex-start',
              }}
            >
              <Text style={{ ...theme.viewStyles.text('SB', 14, theme.colors.COD_TEXT, 1, 20) }}>
                CASH ON DELIVERY
              </Text>
            </View>
          </View>
          {!!isOneApolloSelected && (
            <Text
              style={{
                ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 18),
                marginTop: 10,
                marginHorizontal: 25,
              }}
            >
              ! COD option is not available along with OneApollo Health Credits.
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderPlaceorder = () => {
    return (
      <View
        style={{
          marginTop: 0.05 * windowHeight,
          height: 0.12 * windowHeight,
          backgroundColor: theme.colors.HEX_WHITE,
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
              initiateOrder('', '', true, false);
            } else if (HCorder) {
              initiateOrder('', '', false, true);
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
        {/* {renderOneApolloAndHealthCreditsCard()} */}
        {showChennaiOrderForm ? (
          !loading ? (
            renderChennaiOrderFormAndPayButton()
          ) : (
            <Spinner />
          )
        ) : !loading ? (
          <ScrollView
            style={{ flex: 0.9 }}
            ref={(ref) => (ScrollViewRef = ref)}
            onContentSizeChange={() => scrollToend && ScrollViewRef.scrollToEnd({ animated: true })}
          >
            {rendertotalAmount()}
            {!!cartTotalCashback && isCircleSubscription && renderCareSavings()}
            {availableHC != 0 && renderOneApolloOption()}
            {renderPaymentOptions()}
            {bankOptions.length > 0 && renderNetBanking()}
            {!circleMembershipCharges && renderCOD()}
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
  popupButtonStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  popupButtonTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    color: theme.colors.APP_YELLOW,
    lineHeight: 24,
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
});
