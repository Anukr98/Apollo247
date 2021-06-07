import {
  g,
  postAppsFlyerEvent,
  postFirebaseEvent,
  postWebEngageEvent,
  formatAddress,
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

export function PaymentInitiated(
  grandTotal: number,
  LOB: string,
  type: string,
  paymentOrderId: string
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.PAYMENT_INITIATED] = {
    Amount: grandTotal,
    LOB: LOB,
    type: type,
    paymentOrderId: paymentOrderId,
  };
  postWebEngageEvent(WebEngageEventName.PAYMENT_INITIATED, eventAttributes);
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
  shoppingCart: ShoppingCartContextProps,
  paymentOrderId: string,
  burnHc: number,
  isCOD: boolean
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_CHECKOUT_COMPLETED] = checkoutEventAttributes;
  eventAttributes['Payment Type'] = isCOD ? 'COD' : 'Prepaid';
  postWebEngageEvent(WebEngageEventName.PHARMACY_CHECKOUT_COMPLETED, eventAttributes);

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
}
