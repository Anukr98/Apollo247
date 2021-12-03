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
  postCleverTapEvent,
  getCleverTapCircleMemberValues,
  getCircleNoSubscriptionText,
  getUserType,
  CircleEventSource,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import moment from 'moment';
import { AppsFlyerEventName } from '@aph/mobile-patients/src//helpers/AppsFlyerEvents';
import {
  FirebaseEventName,
  FirebaseEvents,
} from '@aph/mobile-patients/src//helpers/firebaseEvents';
import { PharmacyUserTypeEvent } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';

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
    serverCartAmount,
    serverCartItems,
    isCartPrescriptionRequired,
    pinCode,
    storeId,
    stores: storesFromContext,
    cartCoupon
  } = shoppingCart;
  const selectedStore =
    (storeId && storesFromContext.find((item) => item.storeid == storeId)) || undefined;
  const numberOfOutOfStockItems = serverCartItems.filter((medicine) => medicine.isInStock === false)
    .length;

  const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_PROCEED_TO_PAY_CLICKED] = {
    'Total items in cart': serverCartItems.length,
    'Sub Total': serverCartAmount?.cartTotal,
    'Delivery charge': serverCartAmount?.isDeliveryFree ? 0 : serverCartAmount?.deliveryCharges,
    'Net after discount': serverCartAmount?.estimatedAmount,
    'Prescription Needed?': isCartPrescriptionRequired ? true : false,
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
  const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_PROCEED_TO_PAY_CLICKED] = {
    'Total items in cart': serverCartItems.length,
    'Sub Total': serverCartAmount?.cartTotal,
    'Shipping Charges': serverCartAmount?.isDeliveryFree ? 0 : serverCartAmount?.deliveryCharges,
    'Net after discount': serverCartAmount?.estimatedAmount,
    'Prescription Required?': isCartPrescriptionRequired ? 'Yes' : 'No',
    'Mode of Delivery': !isStorePickup ? 'Home' : 'Pickup',
    'Delivery Date Time': !isStorePickup && moment(deliveryTime).isValid ? deliveryTime||undefined : undefined, // Optional (only if Home)
    'Pincode': pinCode,
    'Service Area': 'Pharmacy',
    'No. of out of stock items': numberOfOutOfStockItems,
    'Split Cart': !!isSplitCart ? 'Yes' : 'No',
    'Prescription Option selected': !!isPrescriptionUploaded
      ? 'Prescription Upload'
      : 'Not Applicable',
    'Delivery charge': serverCartAmount?.isDeliveryFree ? 0 : serverCartAmount?.deliveryCharges,
    'Coupon Applied': (cartCoupon?.coupon && cartCoupon?.valid) || undefined,
    'User Type': pharmacyUserTypeAttribute?.User_Type || undefined,
    'Circle Member': getCleverTapCircleMemberValues(pharmacyCircleEvent?.['Circle Membership Added']!)||undefined,
    'Circle Membership Value':pharmacyCircleEvent?.['Circle Membership Value'] || undefined,
    ...splitCartDetails,
  };
  if (selectedStore) {
    eventAttributes['Store Id'] = selectedStore.storeid;
    eventAttributes['Store Name'] = selectedStore.storename;
    cleverTapEventAttributes['Store ID'] = selectedStore.storeid||undefined;
    cleverTapEventAttributes['Store Name'] = selectedStore.storename||undefined;
  }
  postWebEngageEvent(WebEngageEventName.PHARMACY_PROCEED_TO_PAY_CLICKED, eventAttributes);
  postCleverTapEvent(CleverTapEventName.PHARMACY_PROCEED_TO_PAY_CLICKED,cleverTapEventAttributes)
}

export function PharmacyCartViewedEvent(
  shoppingCart: ShoppingCartContextProps,
  id: string,
  pharmacyCircleEvent: PharmacyCircleEvent,
  pharmacyUserTypeAttribute: PharmacyUserTypeEvent
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_CART_VIEWED] = {
    'Total items in cart': shoppingCart.serverCartItems.length,
    'Sub Total': shoppingCart.serverCartAmount?.cartTotal,
    'Delivery charge': shoppingCart.serverCartAmount?.isDeliveryFree ? 0 : shoppingCart.serverCartAmount?.deliveryCharges,
    'Total Discount': Number(
      (
        shoppingCart?.serverCartAmount?.couponSavings || 0 + 
        shoppingCart?.serverCartAmount?.cartSavings || 0).toFixed(2)
    ),
    'Net after discount': shoppingCart.serverCartAmount?.estimatedAmount,
    'Prescription Needed?': shoppingCart.isCartPrescriptionRequired,
    'Cart Items': shoppingCart.serverCartItems.map(
      (item) =>
        ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          specialPrice: item.sellingPrice,
        })
    ),
    'Service Area': 'Pharmacy',
    'Customer ID': id,
    ...pharmacyUserTypeAttribute,
    ...pharmacyCircleEvent,
  };

  let revenue = 0
  shoppingCart?.serverCartItems?.forEach(item => {
    revenue+=(item?.quantity * (item?.sellingPrice ? item?.sellingPrice : item?.price))
  })
  const appsFlyerEvents = {
    'Total items in cart': shoppingCart?.serverCartItems?.length,
    'Sub Total': shoppingCart?.serverCartAmount?.cartTotal,
    'Delivery charge': shoppingCart.serverCartAmount?.isDeliveryFree ? 0 : shoppingCart.serverCartAmount?.deliveryCharges,
    'Total Discount': Number(
      (
        shoppingCart?.serverCartAmount?.couponSavings || 0 + 
        shoppingCart?.serverCartAmount?.cartSavings || 0).toFixed(2)
    ),
    'Net after discount': shoppingCart?.serverCartAmount?.estimatedAmount,
    'Prescription Needed?': shoppingCart?.isCartPrescriptionRequired,
    'Cart Items': shoppingCart?.serverCartItems?.map(
      (item) =>
        ({
          af_content_id: item?.id,
          af_content: item?.name,
          quantity: item?.quantity,
          price: item?.price,
          af_price: item?.sellingPrice,
        })
    ),
    "af_content_id": shoppingCart?.serverCartItems?.map(item => `${item?.id}`),
    "af_quantity": shoppingCart?.serverCartItems?.map(item => item?.quantity),
    "af_price": shoppingCart?.serverCartItems?.map(item => item?.sellingPrice ? item?.sellingPrice : item?.price),
    "af_revenue": revenue,
    "af_currency": "INR",
    'Service Area': 'Pharmacy',
    af_customer_user_id: id,
    af_content_type: "Cart Page",
    ...pharmacyUserTypeAttribute,
    ...pharmacyCircleEvent,
  };
  

  const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_CART_VIEWED] = {
    'Total items in cart': shoppingCart?.serverCartItems?.length,
    'Sub total': shoppingCart?.serverCartAmount?.cartTotal,
    'Shipping charges': shoppingCart.serverCartAmount?.isDeliveryFree ? 0 : shoppingCart.serverCartAmount?.deliveryCharges,
    'Total discount': NumberNumber(
      (
        shoppingCart?.serverCartAmount?.couponSavings || 0 + 
        shoppingCart?.serverCartAmount?.cartSavings || 0).toFixed(2)
    ),
    'Order value': shoppingCart?.serverCartAmount?.estimatedAmount,
    'Prescription required': shoppingCart?.isCartPrescriptionRequired?'Yes':'No',
    'Cart items': shoppingCart?.serverCartItems?.map(
      (item) =>
        ({
          id: item?.id,
          name: item?.name,
          quantity: item?.quantity,
          price: item?.price,
          specialPrice: item?.sellingPrice,
        })
    ) || undefined,
    'Service area': 'Pharmacy',
    'Customer ID': id,
    'User type':pharmacyUserTypeAttribute?.User_Type||undefined,
    'Circle member': getCleverTapCircleMemberValues(pharmacyCircleEvent?.['Circle Membership Added']!)||undefined,
    'Circle membership value':pharmacyCircleEvent?.['Circle Membership Value']||undefined
  };
  if (shoppingCart?.cartCoupon?.valid) {
    eventAttributes['Coupon code used'] = shoppingCart?.cartCoupon?.coupon;
    cleverTapEventAttributes['Coupon code used'] = shoppingCart?.cartCoupon?.coupon||undefined;
  }
  postWebEngageEvent(WebEngageEventName.PHARMACY_CART_VIEWED, eventAttributes);
  postCleverTapEvent(CleverTapEventName.PHARMACY_CART_VIEWED,cleverTapEventAttributes);
  postAppsFlyerEvent(AppsFlyerEventName.PHARMACY_CART_VIEWED, appsFlyerEvents);

  const firebaseAttributes: FirebaseEvents[FirebaseEventName.PHARMACY_CART_VIEWED] = {
    TotalItemsInCart: shoppingCart.serverCartItems.length,
    SubTotal: shoppingCart.serverCartAmount?.cartTotal,
    Deliverycharge: shoppingCart.serverCartAmount?.isDeliveryFree ? 0 : shoppingCart.serverCartAmount?.deliveryCharges,
    TotalDiscount: Number(
      (
        shoppingCart?.serverCartAmount?.couponSavings || 0 + 
        shoppingCart?.serverCartAmount?.cartSavings || 0).toFixed(2)
    ),
    NetAfterDiscount: shoppingCart.serverCartAmount?.estimatedAmount,
    PrescriptionNeeded: shoppingCart.isCartPrescriptionRequired,
    CartItems: shoppingCart.serverCartItems.map(
      (item) =>
        ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          specialPrice: item.sellingPrice,
        })
    ),
    ServiceArea: 'Pharmacy',
    CustomerID: id,
    ...pharmacyCircleEvent,
  };

  if (shoppingCart?.cartCoupon?.valid) {
    firebaseAttributes['CouponCodeUsed'] = shoppingCart?.cartCoupon?.coupon;
  }
  postFirebaseEvent(FirebaseEventName.PHARMACY_CART_VIEWED, firebaseAttributes);
}

export function PricemismatchEvent(cartItem: any, id: string, storeItemPrice: number, previousCartPrice: number) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.SKU_PRICE_MISMATCH]|CleverTapEvents[CleverTapEventName.PHARMACY_CART_SKU_PRICE_MISMATCH] = {
    'Mobile number': id,
    'SKU ID': cartItem.id,
    'Magento MRP': previousCartPrice,
    'Magento pack size': Number(cartItem.mou),
    'Store API MRP': storeItemPrice,
    'Price change in cart': 'Yes',
  };
  postCleverTapEvent(CleverTapEventName.PHARMACY_CART_SKU_PRICE_MISMATCH,eventAttributes);
  postWebEngageEvent(WebEngageEventName.SKU_PRICE_MISMATCH, eventAttributes);
}

export function postTatResponseFailureEvent(
  serverCartItems: ShoppingCartItem[],
  pincode: string,
  error: object
) {
  const lookUp = serverCartItems.map((item) => ({ sku: item.id, qty: item.quantity }));
  const eventAttributes: WebEngageEvents[WebEngageEventName.TAT_API_FAILURE] = {
    pincode,
    lookUp,
    error,
    'Cart Items': JSON.stringify(serverCartItems),
  };
  postWebEngageEvent(WebEngageEventName.TAT_API_FAILURE, eventAttributes);
}

export function postwebEngageProductRemovedEvent(cartItem: any, id: string) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.ITEMS_REMOVED_FROM_CART]|CleverTapEvents[CleverTapEventName.PHARMACY_ITEMS_REMOVED_FROM_CART] = {
    'Customer ID': id,
    'No of items': cartItem.quantity,
    'Product ID': cartItem.id,
    'Product name': cartItem.name,
  };
  const appsFlyerEvents = {
    af_customer_user_id: id,
    'No. of items': cartItem?.quantity,
    af_content_id: cartItem?.id,
    af_content: cartItem?.name,
    af_content_type: "Cart Page",
    af_currency: "INR",
    af_price: cartItem?.sellingPrice
  }
  postCleverTapEvent(CleverTapEventName.PHARMACY_ITEMS_REMOVED_FROM_CART,eventAttributes);
  postWebEngageEvent(WebEngageEventName.ITEMS_REMOVED_FROM_CART, eventAttributes);
  postAppsFlyerEvent(AppsFlyerEventName.ITEMS_REMOVED_FROM_CART, appsFlyerEvents);

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
  const cleverTapAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_APPLY_COUPON_CLICKED] = {};
  postCleverTapEvent(CleverTapEventName.PHARMACY_APPLY_COUPON_CLICKED,cleverTapAttributes);
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

export const fireCleverTapCirclePlanRemovedEvent = (
  currentPatient: any,
  circleEventSource?: CircleEventSource,
  circleData?: any,
  allCurrentPatients?: any
) => {
  const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.CIRCLE_PLAN_TO_CART] = {
    navigation_source: circleEventSource,
    circle_end_date: getCircleNoSubscriptionText(),
    circle_start_date: getCircleNoSubscriptionText(),
    plan_id: circleData?.subPlanId,
    customer_id: currentPatient?.id,
    duration_in_months: circleData?.durationInMonth,
    user_type: getUserType(allCurrentPatients),
    price: circleData?.currentSellingPrice,
  };
  postCleverTapEvent(
    CleverTapEventName.CIRCLE_PLAN_REMOVE_FROM_CART,
    cleverTapEventAttributes
  );
};
