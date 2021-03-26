import {
  ShoppingCartItem,
  ShoppingCartContextProps,
  PharmacyCircleEvent,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  g,
  postAppsFlyerEvent,
  postWebEngageEvent,
  postFirebaseEvent,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import moment from 'moment';
import { AppsFlyerEventName } from '@aph/mobile-patients/src//helpers/AppsFlyerEvents';
import {
  FirebaseEventName,
  FirebaseEvents,
} from '@aph/mobile-patients/src//helpers/firebaseEvents';
import { PharmacyUserTypeEvent } from '@aph/mobile-patients/src/components/AppCommonDataProvider';

export function postwebEngageProceedToPayEvent(
  shoppingCart: ShoppingCartContextProps,
  isStorePickup: boolean,
  deliveryTime: string,
  pharmacyCircleEvent: PharmacyCircleEvent,
  pharmacyUserTypeAttribute: PharmacyUserTypeEvent,
  itemsInCart?: string,
  isSplitCart?: boolean,
  splitCartDetails?: any,
  isPrescriptionUploaded?: boolean
) {
  const {
    cartTotal,
    cartItems,
    deliveryCharges,
    grandTotal,
    uploadPrescriptionRequired,
    pinCode,
    storeId,
    stores: storesFromContext,
  } = shoppingCart;
  const selectedStore =
    (storeId && storesFromContext.find((item) => item.storeid == storeId)) || undefined;
  const numberOfOutOfStockItems = cartItems.filter((medicine) => medicine.isInStock === false)
    .length;

  const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_PROCEED_TO_PAY_CLICKED] = {
    'Total items in cart': cartItems.length,
    'Sub Total': cartTotal,
    'Delivery charge': deliveryCharges,
    'Net after discount': grandTotal,
    'Prescription Needed?': uploadPrescriptionRequired ? true : false,
    'Mode of Delivery': !isStorePickup ? 'Home' : 'Pickup',
    'Delivery Date Time': !isStorePickup && moment(deliveryTime).isValid ? deliveryTime : undefined, // Optional (only if Home)
    'Pin Code': pinCode,
    'Service Area': 'Pharmacy',
    'No. of out of stock items': numberOfOutOfStockItems,
    'Split Cart': !!isSplitCart ? 'Yes' : 'No',
    'Prescription Option selected': !!isPrescriptionUploaded
      ? 'Prescription Upload'
      : 'Not Applicable',
    'Cart Items': itemsInCart,
    ...pharmacyUserTypeAttribute,
    ...pharmacyCircleEvent,
    ...splitCartDetails,
  };
  if (selectedStore) {
    eventAttributes['Store Id'] = selectedStore.storeid;
    eventAttributes['Store Name'] = selectedStore.storename;
  }
  postWebEngageEvent(WebEngageEventName.PHARMACY_PROCEED_TO_PAY_CLICKED, eventAttributes);
}

export function PharmacyCartViewedEvent(
  shoppingCart: ShoppingCartContextProps,
  id: string,
  pharmacyCircleEvent: PharmacyCircleEvent,
  pharmacyUserTypeAttribute: PharmacyUserTypeEvent
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_CART_VIEWED] = {
    'Total items in cart': shoppingCart.cartItems.length,
    'Sub Total': shoppingCart.cartTotal,
    'Delivery charge': shoppingCart.deliveryCharges,
    'Total Discount': Number(
      (shoppingCart.couponDiscount + shoppingCart.productDiscount).toFixed(2)
    ),
    'Net after discount': shoppingCart.grandTotal,
    'Prescription Needed?': shoppingCart.uploadPrescriptionRequired,
    'Cart Items': shoppingCart.cartItems.map(
      (item) =>
        ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          specialPrice: item.specialPrice,
        } as ShoppingCartItem)
    ),
    'Service Area': 'Pharmacy',
    'Customer ID': id,
    ...pharmacyUserTypeAttribute,
    ...pharmacyCircleEvent,
  };
  if (shoppingCart.coupon) {
    eventAttributes['Coupon code used'] = shoppingCart.coupon.coupon;
  }
  postWebEngageEvent(WebEngageEventName.PHARMACY_CART_VIEWED, eventAttributes);
  postAppsFlyerEvent(AppsFlyerEventName.PHARMACY_CART_VIEWED, eventAttributes);

  const firebaseAttributes: FirebaseEvents[FirebaseEventName.PHARMACY_CART_VIEWED] = {
    TotalItemsInCart: shoppingCart.cartItems.length,
    SubTotal: shoppingCart.cartTotal,
    Deliverycharge: shoppingCart.deliveryCharges,
    TotalDiscount: Number((shoppingCart.couponDiscount + shoppingCart.productDiscount).toFixed(2)),
    NetAfterDiscount: shoppingCart.grandTotal,
    PrescriptionNeeded: shoppingCart.uploadPrescriptionRequired,
    CartItems: shoppingCart.cartItems.map(
      (item) =>
        ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          specialPrice: item.specialPrice,
        } as ShoppingCartItem)
    ),
    ServiceArea: 'Pharmacy',
    CustomerID: id,
    ...pharmacyCircleEvent,
  };

  if (shoppingCart.coupon) {
    firebaseAttributes['CouponCodeUsed'] = shoppingCart.coupon.coupon;
  }
  postFirebaseEvent(FirebaseEventName.PHARMACY_CART_VIEWED, firebaseAttributes);
}

export function PricemismatchEvent(cartItem: ShoppingCartItem, id: string, storeItemPrice: number) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.SKU_PRICE_MISMATCH] = {
    'Mobile Number': id,
    'Sku Id': cartItem.id,
    'Magento MRP': cartItem.price,
    'Magento Pack Size': Number(cartItem.mou),
    'Store API MRP': storeItemPrice,
    'Price Change In Cart': 'Yes',
  };
  postWebEngageEvent(WebEngageEventName.SKU_PRICE_MISMATCH, eventAttributes);
}

export function postTatResponseFailureEvent(
  cartItems: ShoppingCartItem[],
  pincode: string,
  error: object
) {
  const lookUp = cartItems.map((item) => ({ sku: item.id, qty: item.quantity }));
  const eventAttributes: WebEngageEvents[WebEngageEventName.TAT_API_FAILURE] = {
    pincode,
    lookUp,
    error,
    'Cart Items': JSON.stringify(cartItems),
  };
  postWebEngageEvent(WebEngageEventName.TAT_API_FAILURE, eventAttributes);
}

export function postwebEngageProductRemovedEvent(cartItem: ShoppingCartItem, id: string) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.ITEMS_REMOVED_FROM_CART] = {
    'Customer ID': id,
    'No. of items': cartItem.quantity,
    'Product ID': cartItem.id,
    'Product Name': cartItem.name,
  };
  postWebEngageEvent(WebEngageEventName.ITEMS_REMOVED_FROM_CART, eventAttributes);
  postAppsFlyerEvent(AppsFlyerEventName.ITEMS_REMOVED_FROM_CART, eventAttributes);

  const firebaseAttributes: FirebaseEvents[FirebaseEventName.ITEMS_REMOVED_FROM_CART] = {
    ProductID: cartItem.id,
    CustomerID: id,
    ProductName: cartItem.name,
    'No.ofItems': cartItem.quantity,
  };
  postFirebaseEvent(FirebaseEventName.ITEMS_REMOVED_FROM_CART, firebaseAttributes);
}

export function applyCouponClickedEvent(id: string, itemsInCart?: string) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.CART_APPLY_COUPON_CLCIKED] = {
    'Customer ID': id,
    'Cart Items': itemsInCart || '',
  };
  postWebEngageEvent(WebEngageEventName.CART_APPLY_COUPON_CLCIKED, eventAttributes);
}

export function selectDeliveryAddressClickedEvent(id: string, itemsInCart:? string) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_CART_SELECT_DELIVERY_ADDRESS_CLICKED] = {
    'Customer ID': id,
    'Cart Items': itemsInCart || ''
  };
  postWebEngageEvent(
    WebEngageEventName.PHARMACY_CART_SELECT_DELIVERY_ADDRESS_CLICKED,
    eventAttributes
  );
}

export function uploadPrescriptionClickedEvent(id: string) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_CART_UPLOAD_PRESCRIPTION_CLICKED] = {
    'Customer ID': id,
  };
  postWebEngageEvent(WebEngageEventName.PHARMACY_CART_UPLOAD_PRESCRIPTION_CLICKED, eventAttributes);
}

export const fireCircleBuyNowEvent = (currentPatient: any) => {
  const CircleEventAttributes: WebEngageEvents[WebEngageEventName.PHARMA_CART_ADD_TO_CART_CLICKED_CIRCLE_POPUP] = {
    'Patient UHID': currentPatient?.uhid,
    'Mobile Number': currentPatient?.mobileNumber,
    'Customer ID': currentPatient?.id,
  };
  postWebEngageEvent(
    WebEngageEventName.PHARMA_CART_ADD_TO_CART_CLICKED_CIRCLE_POPUP,
    CircleEventAttributes
  );
};

export const fireCirclePurchaseEvent = (currentPatient: any, endDate: string) => {
  const CircleEventAttributes: WebEngageEvents[WebEngageEventName.PURCHASE_CIRCLE] = {
    'Patient UHID': currentPatient?.uhid,
    'Mobile Number': currentPatient?.mobileNumber,
    'Customer ID': currentPatient?.id,
    'Membership End Date': endDate
      ?.split('T')[0]
      .split('-')
      .reverse()
      .join('-'),
    Type: 'From HC',
    Source: 'from banner',
  };
  !!endDate && postWebEngageEvent(WebEngageEventName.PURCHASE_CIRCLE, CircleEventAttributes);
};

export const fireCirclePlanRemovedEvent = (currentPatient: any) => {
  const CircleEventAttributes: WebEngageEvents[WebEngageEventName.PHARMA_HOME_KNOW_MORE_CLICKED_CIRCLE_POPUP] = {
    'Patient UHID': currentPatient?.uhid,
    'Mobile Number': currentPatient?.mobileNumber,
    'Customer ID': currentPatient?.id,
    'Circle Member': 'No',
  };
  postWebEngageEvent(
    WebEngageEventName.PHARMA_CART_CIRCLE_MEMBERSHIP_REMOVED,
    CircleEventAttributes
  );
};
