import {
  g,
  postAppsFlyerEvent,
  postFirebaseEvent,
  postWebEngageEvent,
  formatAddress,
  postCleverTapEvent,
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

export function PaymentInitiated(
  grandTotal: number,
  LOB: string,
  type: string,
  paymentOrderId: string,
  instrument: string
) {
  try {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PAYMENT_INITIATED] = {
      Amount: grandTotal,
      LOB: LOB,
      type: type,
      paymentOrderId: paymentOrderId,
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
  isCOD: boolean
) {
  try {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_CHECKOUT_COMPLETED] = checkoutEventAttributes;
    eventAttributes && (eventAttributes['Payment Type'] = isCOD ? 'COD' : 'Prepaid');
    postWebEngageEvent(WebEngageEventName.PHARMACY_CHECKOUT_COMPLETED, eventAttributes);
    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_CHECKOUT_COMPLETED] = {
      ...cleverTapCheckoutEventAttributes,
      'Payment Type': isCOD ? 'COD' : 'Prepaid',
      'Transaction ID': paymentOrderId,
      'Payment Instrument': isCOD ? 'COD' : paymentType || undefined,
    };
    postCleverTapEvent(CleverTapEventName.PHARMACY_CHECKOUT_COMPLETED, cleverTapEventAttributes);

    const {
      cartItems,
      coupon,
      grandTotal,
      circleSubscriptionId,
      isCircleSubscription,
      cartTotalCashback,
      pharmacyCircleAttributes,
    } = shoppingCart;
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
    const getFormattedAmount = (num: number) => Number(num.toFixed(2));
    const firebaseEventAttributes: FirebaseEvents[FirebaseEventName.PURCHASE] = {
      coupon: coupon?.coupon,
      currency: 'INR',
      items: items,
      transaction_id: paymentOrderId,
      value: getFormattedAmount(grandTotal - burnHc),
      LOB: 'Pharma',
    };
    postFirebaseEvent(FirebaseEventName.PURCHASE, firebaseEventAttributes);

    const appsflyerEventAttributes: AppsFlyerEvents[AppsFlyerEventName.PHARMACY_CHECKOUT_COMPLETED] = {
      'cart size': cartItems.length,
      af_revenue: getFormattedAmount(grandTotal),
      af_currency: 'INR',
      'order id': paymentOrderId,
      'coupon applied': coupon ? true : false,
      'Circle Cashback amount':
        circleSubscriptionId || isCircleSubscription ? Number(cartTotalCashback) : 0,
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
  isCOD: boolean
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
