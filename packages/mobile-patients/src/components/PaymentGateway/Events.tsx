import {
  g,
  postAppsFlyerEvent,
  postFirebaseEvent,
  postWebEngageEvent,
  formatAddress,
  postCleverTapEvent,
  getCleverTapCircleMemberValues,
  getUserType,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  ShoppingCartItem,
  ShoppingCartContextProps,
  PharmacyCircleEvent,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import {
  AppsFlyerEventName,
  AppsFlyerEvents,
} from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import DeviceInfo from 'react-native-device-info';
import moment from 'moment';
import { Platform } from 'react-native';
import {
  MEDICINE_ORDER_PAYMENT_TYPE,
  MEDICINE_ORDER_STATUS,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';

export function PaymentInitiated(
  grandTotal: number,
  LOB: string,
  type: string,
  paymentOrderId: string,
  instrument: string,
  paymentModeName?: string,
  verticalSpecificEventAttributes?: any
) {
  try {
    const eventAttributes: CleverTapEvents[CleverTapEventName.DIAGNOSTIC_PAYMENT_INITIATED] = {
      'Order Amount': grandTotal,
      LOB: LOB,
      type: type,
      'Order id': paymentOrderId,
      'Payment mode': paymentModeName,
      'Item Id': verticalSpecificEventAttributes?.itemId,
      'Item Name': verticalSpecificEventAttributes?.itemName,
      'Item Type': verticalSpecificEventAttributes.itemType,
      'Item Price': verticalSpecificEventAttributes?.itemPrice,
      'Patient Name': verticalSpecificEventAttributes?.patientName,
      'Patient Uhid': verticalSpecificEventAttributes?.patientUhid,
      'Patient Age': verticalSpecificEventAttributes?.patientAge,
      'Patient Gender': verticalSpecificEventAttributes?.patientGender,
    };
    const consultEventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_PAYMENT_INITIATED] = {
      Amount: grandTotal,
      LOB: LOB,
      Paymentmode: type,
      paymentOrderId: paymentOrderId,
    };
    const pharmaEventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_PAYMENT_INITIATED] = {
      paymentMode: type,
      amount: grandTotal,
      serviceArea: 'pharmacy',
      paymentOrderId: paymentOrderId,
      'Payment Instrument': instrument,
    };

    LOB == 'pharma' &&
      postCleverTapEvent(CleverTapEventName.PHARMACY_PAYMENT_INITIATED, pharmaEventAttributes);
    LOB == 'diagnostics' &&
      postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_PAYMENT_INITIATED, eventAttributes);
    LOB == 'consult' &&
      postCleverTapEvent(CleverTapEventName.CONSULT_PAYMENT_INITIATED, consultEventAttributes);
    postWebEngageEvent(WebEngageEventName.PAYMENT_INITIATED, eventAttributes);
  } catch (e) {}
}

export function PaymentStatus(status: string, LOB: string, paymentOrderId: string) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.PAYMENT_STATUS] = {
    status: status,
    LOB: LOB,
    paymentOrderId: paymentOrderId,
  };
  postWebEngageEvent(WebEngageEventName.PAYMENT_STATUS, eventAttributes);
  postAppsFlyerEvent(AppsFlyerEventName.PAYMENT_STATUS, eventAttributes);
  postFirebaseEvent(FirebaseEventName.PAYMENT_STATUS, eventAttributes);
}

export function PharmaOrderPlaced(
  checkoutEventAttributes: any,
  cleverTapCheckoutEventAttributes: any,
  paymentType: string,
  shoppingCart: ShoppingCartContextProps,
  paymentOrderId: string,
  burnHc: number,
  isCOD: boolean,
  currentPatient: GetCurrentPatients_getCurrentPatients_patients,
  orderId: string,
  pharmacyUserType: string
) {
  try {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_CHECKOUT_COMPLETED] = checkoutEventAttributes;
    eventAttributes && (eventAttributes['Payment Type'] = isCOD ? 'COD' : 'Prepaid');
    postWebEngageEvent(WebEngageEventName.PHARMACY_CHECKOUT_COMPLETED, eventAttributes);
    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_CHECKOUT_COMPLETED] = {
      ...cleverTapCheckoutEventAttributes,
      'Payment type': isCOD ? 'COD' : 'Prepaid',
      'Transaction ID': paymentOrderId,
      'Payment instrument': isCOD ? 'COD' : paymentType || undefined,
    };
    postCleverTapEvent(CleverTapEventName.PHARMACY_CHECKOUT_COMPLETED, cleverTapEventAttributes);

    const {
      serverCartItems,
      cartCoupon,
      serverCartAmount,
      isCircleCart,
      pharmacyCircleAttributes,
      deliveryCharges,
      circleMembershipCharges,
    } = shoppingCart;
    let items: any = [];
    serverCartItems?.forEach((item, index) => {
      let itemObj: any = {};
      itemObj.item_name = item.name; // Product Name or Doctor Name
      itemObj.item_id = item.sku; // Product SKU or Doctor ID
      itemObj.price = item.sellingPrice ? item.sellingPrice : item.price; // Product Price After discount or Doctor VC price (create another item in array for PC price)
      itemObj.item_brand = ''; // Product brand or Apollo (for Apollo doctors) or Partner Doctors (for 3P doctors)
      itemObj.item_category = 'Pharmacy'; // 'Pharmacy' or 'Consultations'
      itemObj.item_category2 = item.isMedicine ? 'Drug' : 'FMCG'; // FMCG or Drugs (for Pharmacy) or Specialty Name (for Consultations)
      itemObj.item_variant = 'Default'; // "Default" (for Pharmacy) or Virtual / Physcial (for Consultations)
      itemObj.index = index + 1; // Item sequence number in the list
      itemObj.quantity = item.quantity; // "1" or actual quantity
      items.push(itemObj);
    });
    const getFormattedAmount = (num: number) => Number(num.toFixed(2));
    const firebaseEventAttributes: FirebaseEvents[FirebaseEventName.PURCHASE] = {
      coupon: cartCoupon?.valid ? cartCoupon?.coupon : '',
      currency: 'INR',
      items: items,
      transaction_id: paymentOrderId,
      value: getFormattedAmount(serverCartAmount?.estimatedAmount || 0 - burnHc),
      LOB: 'Pharma',
    };
    postFirebaseEvent(FirebaseEventName.PURCHASE, firebaseEventAttributes);

    const skus = serverCartItems?.map((item) => item?.id);
    const firebaseCheckoutEventAttributes: FirebaseEvents[FirebaseEventName.PHARMACY_CHECKOUT_COMPLETED] = {
      order_id: orderId,
      transaction_id: paymentOrderId,
      currency: 'INR',
      coupon: coupon?.coupon,
      shipping: deliveryCharges,
      items: JSON.stringify(skus),
      value: grandTotal,
      circle_membership_added: circleMembershipCharges
        ? 'Yes'
        : circleSubscriptionId
        ? 'Existing'
        : 'No',
      payment_type: 'COD',
      user_type: pharmacyUserType,
    };
    postFirebaseEvent(
      FirebaseEventName.PHARMACY_CHECKOUT_COMPLETED,
      firebaseCheckoutEventAttributes
    );

    let revenue = 0;
    shoppingCart?.serverCartItems?.forEach((item) => {
      revenue += item?.quantity * (item?.sellingPrice ? item?.sellingPrice : item?.price);
    });
    const appsflyerEventAttributes: AppsFlyerEvents[AppsFlyerEventName.PHARMACY_CHECKOUT_COMPLETED] = {
      af_customer_user_id: currentPatient ? currentPatient.id : '',
      'cart size': serverCartItems?.length,
      af_revenue: getFormattedAmount(serverCartAmount?.estimatedAmount || 0),
      af_currency: 'INR',
      af_order_id: paymentOrderId ? paymentOrderId : '0',
      af_content_id: shoppingCart?.serverCartItems?.map((item) => item?.sku),
      af_quantity: shoppingCart?.serverCartItems?.map((item) => item?.quantity),
      af_price: shoppingCart?.serverCartItems?.map((item) =>
        item?.sellingPrice ? item?.sellingPrice : item?.price
      ),
      'coupon applied': cartCoupon?.valid ? true : false,
      'Circle Cashback amount': isCircleCart ? Number(serverCartAmount?.circleSavings) : 0,
      ...pharmacyCircleAttributes!,
    };
    postAppsFlyerEvent(AppsFlyerEventName.PHARMACY_CHECKOUT_COMPLETED, appsflyerEventAttributes);
  } catch (e) {}
}

export function PaymentScreenLoaded(
  defaultClevertapEventParams: any,
  savedCards: number,
  eligibleApps: string[] | null,
  intentApps: string[]
) {
  try {
    const {
      mobileNumber,
      vertical,
      displayId,
      paymentId,
      amount,
      availableHc,
    } = defaultClevertapEventParams;
    const eventAttributes: CleverTapEvents[CleverTapEventName.PAYMENT_SCREEN_LOADED] = {
      'Phone Number': mobileNumber,
      vertical: vertical,
      'Vertical Internal Order Id': displayId,
      'Payment Order Id': paymentId,
      'Total Amount': amount,
      "isHC's": !!availableHc ? true : false,
      NumSavedCards: savedCards,
      'Eligible Payment Methods': eligibleApps || [],
      'Num UPI Intent Apps': intentApps?.length,
      'UPI Intent App Names': intentApps,
      "HC's Balance": availableHc,
      isPaymentLinkTxn: vertical == 'paymentLink' ? true : false,
    };
    postCleverTapEvent(CleverTapEventName.PAYMENT_SCREEN_LOADED, eventAttributes);
  } catch (error) {}
}

export function PaymentTxnInitiated(
  defaultClevertapEventParams: any,
  burnHc: number,
  paymentMethod: string,
  paymentMode: string,
  appRedirection: string,
  isSavedCard: boolean,
  txnType: string,
  isNewCardSaved: boolean,
  isCOD: boolean,
  walletBalance: any
) {
  try {
    const {
      mobileNumber,
      vertical,
      displayId,
      paymentId,
      amount,
      availableHc,
    } = defaultClevertapEventParams;
    const eventAttributes: CleverTapEvents[CleverTapEventName.PAYMENT_TXN_INITIATED] = {
      'Phone Number': mobileNumber,
      vertical: vertical,
      'Vertical Internal Order Id': displayId,
      'Payment Order Id': paymentId,
      'Total Amount': amount + burnHc,
      "HC's Balance": availableHc,
      "HC's Redeemed": burnHc,
      'COD Amount': isCOD ? amount : 0,
      'Prepaid Amount': !isCOD ? amount : 0,
      'Payment Method Type': paymentMethod,
      'Payment Method': paymentMode,
      'App Redirection': appRedirection,
      isSavedCard: isSavedCard,
      TxnType: txnType,
      ifNewCardSaved: isNewCardSaved,
      isPaymentLinkTxn: vertical == 'paymentLink' ? true : false,
      'Wallet Balance': walletBalance,
    };
    postCleverTapEvent(CleverTapEventName.PAYMENT_TXN_INITIATED, eventAttributes);
  } catch (error) {}
}

export function PaymentTxnResponse(
  defaultClevertapEventParams: any,
  paymentMethod: string,
  responseCode: string,
  response: string,
  status: string
) {
  try {
    const { mobileNumber, vertical, displayId, paymentId, amount } = defaultClevertapEventParams;
    const eventAttributes: CleverTapEvents[CleverTapEventName.PAYMENT_TXN_RESPONSE] = {
      'Phone Number': mobileNumber,
      vertical: vertical,
      'Vertical Internal Order Id': displayId,
      'Payment Order Id': paymentId,
      'Total Amount': amount,
      'Payment Method Type': paymentMethod,
      JuspayResponseCode: responseCode,
      Response: response,
      Status: status,
    };
    postCleverTapEvent(CleverTapEventName.PAYMENT_TXN_RESPONSE, eventAttributes);
  } catch (error) {}
}

export const InAppReviewEvent = async (
  currentPatient: any,
  pharmacyUserTypeAttribute: any,
  pharmacyCircleAttributes: any
) => {
  const uniqueId = await DeviceInfo.getUniqueId();
  const eventAttributes: CleverTapEvents[CleverTapEventName.PLAYSTORE_APP_REVIEW_AND_RATING] = {
    'Patient Name': `${currentPatient?.firstName} ${currentPatient?.lastName}`,
    'Patient UHID': currentPatient?.uhid,
    'User Type': pharmacyUserTypeAttribute?.User_Type || '',
    'Patient Age': Math.round(moment().diff(currentPatient?.dateOfBirth || 0, 'years', true)),
    'Patient Gender': currentPatient?.gender,
    'Mobile Number': currentPatient?.mobileNumber,
    'Customer ID': currentPatient?.id,
    'CT Source': Platform.OS,
    'Device ID': uniqueId,
    'Circle Member':
      getCleverTapCircleMemberValues(pharmacyCircleAttributes?.['Circle Membership Added']!) || '',
    'Page Name': 'Dignostic Order Completed',
    'NAV Source': 'Dignostic',
  };
  postCleverTapEvent(
    Platform.OS == 'android'
      ? CleverTapEventName.APP_REVIEW_AND_RATING_TO_PLAYSTORE
      : CleverTapEventName.APP_REVIEW_AND_RATING_TO_APPSTORE,
    eventAttributes
  );
};

export function firePaymentOrderStatusEvent(
  paymentStatus: string,
  payload: any,
  defaultClevertapEventParams: any
) {
  try {
    const { mobileNumber, vertical, displayId, paymentId } = defaultClevertapEventParams;
    const status = paymentStatus == 'success' ? 'PAYMENT_SUCCESS' : 'PAYMENT_PENDING';
    const eventAttributes: CleverTapEvents[CleverTapEventName.PAYMENT_ORDER_STATUS] = {
      'Phone Number': mobileNumber,
      vertical: vertical,
      'Vertical Internal Order Id': displayId,
      'Payment Order Id': paymentId,
      'Payment Method Type': payload?.payload?.action,
      BackendPaymentStatus: status,
      JuspayResponseCode: payload?.errorCode,
      Response: payload?.payload?.status,
      Status: status,
    };
    postCleverTapEvent(CleverTapEventName.PAYMENT_ORDER_STATUS, eventAttributes);
  } catch (error) {}
}

export const InAppReviewEventPharma = async (
  currentPatient: any,
  pharmacyUserTypeAttribute: any,
  pharmacyCircleAttributes: any
) => {
  const uniqueId = await DeviceInfo.getUniqueId();
  const eventAttributes: CleverTapEvents[CleverTapEventName.PLAYSTORE_APP_REVIEW_AND_RATING] = {
    'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
    'Patient UHID': g(currentPatient, 'uhid'),
    'User Type': pharmacyUserTypeAttribute?.User_Type || '',
    'Patient Age': Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
    'Patient Gender': g(currentPatient, 'gender'),
    'Mobile Number': g(currentPatient, 'mobileNumber'),
    'Customer ID': g(currentPatient, 'id'),
    'CT Source': Platform.OS,
    'Device ID': uniqueId,
    'Circle Member':
      getCleverTapCircleMemberValues(pharmacyCircleAttributes?.['Circle Membership Added']!) || '',
    'Page Name': 'Pharmacy Order Completed',
    'NAV Source': 'Pharmacy',
  };
  postCleverTapEvent(
    Platform.OS == 'android'
      ? CleverTapEventName.APP_REVIEW_AND_RATING_TO_PLAYSTORE
      : CleverTapEventName.APP_REVIEW_AND_RATING_TO_APPSTORE,
    eventAttributes
  );
};

const getFormattedAmount = (num: number) => Number(num.toFixed(2));

export const firePaymentStatusPageViewedEvent = (
  status: string,
  transactionId: number,
  paymentMode: string,
  orderIds: any,
  grandTotal: number,
  totalCashBack: number,
  deliveryCharges: number,
  circleSubscriptionId: string,
  isCircleSubscription: boolean,
  showSubstituteMessage: string
) => {
  const paymentStatus =
    status == MEDICINE_ORDER_STATUS.PAYMENT_SUCCESS
      ? 'Success'
      : status == MEDICINE_ORDER_STATUS.PAYMENT_FAILED
      ? 'Payment Failed'
      : status == 'PAYMENT_STATUS_NOT_KNOWN' // for COD
      ? 'Payment Status Not Known'
      : 'Payment Aborted';
  const paymentType = paymentMode == MEDICINE_ORDER_PAYMENT_TYPE.COD ? 'COD' : 'Cashless';
  const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_POST_CART_PAGE_VIEWED] = {
    'Payment status': paymentStatus,
    'Payment Type': paymentType,
    'Transaction ID': transactionId,
    'Order ID(s)': orderIds,
    'MRP Total': getFormattedAmount(grandTotal),
    'Discount Amount': totalCashBack,
    'Payment Instrument': paymentMode,
    'Order Type': 'Cart',
    'Shipping Charges': deliveryCharges,
    'Circle Member': circleSubscriptionId || isCircleSubscription ? true : false,
    'Substitution Option Shown': showSubstituteMessage ? 'Yes' : 'No',
  };
  postWebEngageEvent(WebEngageEventName.PHARMACY_POST_CART_PAGE_VIEWED, eventAttributes);
};

enum SUBSTITUTION_RESPONSE {
  OK = 'OK',
  NOT_OK = 'not-OK',
}

export const fireSubstituteResponseEvent = (action: string, paymentId: string, orderIds: any) => {
  const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_ORDER_SUBSTITUTE_OPTION_CLICKED] = {
    'Transaction ID': paymentId,
    'Order ID(s)': orderIds,
    'Substitute Action Taken': action == SUBSTITUTION_RESPONSE.OK ? 'Agree' : 'Disagree',
  };
  postWebEngageEvent(WebEngageEventName.PHARMACY_ORDER_SUBSTITUTE_OPTION_CLICKED, eventAttributes);
};

export const fireCirclePlanActivatedEvent = (
  currentPatient: any,
  planPurchased: boolean,
  circlePlanSelected: any
) => {
  const CircleEventAttributes: WebEngageEvents[WebEngageEventName.PURCHASE_CIRCLE] = {
    'Patient UHID': currentPatient?.uhid,
    'Mobile Number': currentPatient?.mobileNumber,
    'Customer ID': currentPatient?.id,
    'Membership Type': String(circlePlanSelected?.valid_duration) + ' days',
    'Membership End Date': moment(new Date())
      .add(circlePlanSelected?.valid_duration, 'days')
      .format('DD-MMM-YYYY'),
    'Circle Plan Price': circlePlanSelected?.currentSellingPrice,
    Type: 'Pharmacy',
    Source: 'Pharma',
  };
  planPurchased && postWebEngageEvent(WebEngageEventName.PURCHASE_CIRCLE, CircleEventAttributes);
};

export const fireConsultBookedEvent = (
  displayId: any,
  orderDetails: any,
  allCurrentPatients: any
) => {
  const {
    webEngageEventAttributes,
    cleverTapConsultBookedEventAttributes,
    appsflyerEventAttributes,
    fireBaseEventAttributes,
    isDoctorsOfTheHourStatus,
  } = orderDetails;
  try {
    let eventAttributes = webEngageEventAttributes;
    eventAttributes['Display ID'] = displayId;
    eventAttributes['User_Type'] = getUserType(allCurrentPatients);
    let cleverTapEventAttributes = cleverTapConsultBookedEventAttributes;
    cleverTapEventAttributes['Display ID'] = displayId;
    cleverTapEventAttributes['User_type'] = getUserType(allCurrentPatients);
    postAppsFlyerEvent(AppsFlyerEventName.CONSULTATION_BOOKED, appsflyerEventAttributes);
    postFirebaseEvent(FirebaseEventName.CONSULTATION_BOOKED, fireBaseEventAttributes);
    // firePurchaseEvent(amountBreakup);
    eventAttributes['Dr of hour appointment'] = !!isDoctorsOfTheHourStatus ? 'Yes' : 'No';
    cleverTapEventAttributes['Dr of hour appointment'] = !!isDoctorsOfTheHourStatus ? 'Yes' : 'No';
    postWebEngageEvent(WebEngageEventName.CONSULTATION_BOOKED, eventAttributes);
    postCleverTapEvent(CleverTapEventName.CONSULTATION_BOOKED, cleverTapEventAttributes);
  } catch (error) {
    console.log(error);
  }
};
export const fireCirclePurchaseEvent = (circlePlanSelected: any, paymentId: string) => {
  const eventAttributes: FirebaseEvents[FirebaseEventName.PURCHASE] = {
    currency: 'INR',
    items: [
      {
        item_name: 'Circle Plan',
        item_id: circlePlanSelected?.subPlanId,
        price: Number(circlePlanSelected?.currentSellingPrice),
        item_category: 'Circle',
        index: 1, // Item sequence number in the list
        quantity: 1, // "1" or actual quantity
      },
    ],
    transaction_id: paymentId,
    value: Number(circlePlanSelected?.currentSellingPrice),
    LOB: 'Circle',
  };

  postFirebaseEvent(FirebaseEventName.PURCHASE, eventAttributes);
};

export const firePurchaseEvent = (orderDetails: any) => {
  const {
    price,
    orderId,
    doctorName,
    doctorID,
    doctor,
    webEngageEventAttributes,
    coupon,
  } = orderDetails;
  const eventAttributes: FirebaseEvents[FirebaseEventName.PURCHASE] = {
    coupon: coupon,
    currency: 'INR',
    items: [
      {
        item_name: doctorName, // Product Name or Doctor Name
        item_id: doctorID, // Product SKU or Doctor ID
        price: Number(price), // Product Price After discount or Doctor VC price (create another item in array for PC price)
        item_brand: doctor.doctorType, // Product brand or Apollo (for Apollo doctors) or Partner Doctors (for 3P doctors)
        item_category: 'Consultations', // 'Pharmacy' or 'Consultations'
        item_category2: doctor.specialty.name, // FMCG or Drugs (for Pharmacy) or Specialty Name (for Consultations)
        item_category3: doctor.city, // City Name (for Consultations)
        item_variant: webEngageEventAttributes['Consult Mode'], // "Default" (for Pharmacy) or Virtual / Physcial (for Consultations)
        index: 1, // Item sequence number in the list
        quantity: 1, // "1" or actual quantity
      },
    ],
    transaction_id: orderId,
    value: Number(price),
    LOB: 'Consult',
  };
  postFirebaseEvent(FirebaseEventName.PURCHASE, eventAttributes);
};

export const firePaymentStatusEvent = (status: string, id: string) => {
  try {
    const paymentEventAttributes = {
      Payment_Status: status,
      LOB: 'Consultation',
      Appointment_Id: id,
    };
    postWebEngageEvent(WebEngageEventName.PAYMENT_STATUS, paymentEventAttributes);
    postFirebaseEvent(FirebaseEventName.PAYMENT_STATUS, paymentEventAttributes);
    postAppsFlyerEvent(AppsFlyerEventName.PAYMENT_STATUS, paymentEventAttributes);
  } catch (error) {}
};
