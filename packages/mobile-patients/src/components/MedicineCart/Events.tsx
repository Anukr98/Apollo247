import {
  ShoppingCartItem,
  ShoppingCartContextProps,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { g, postWebEngageEvent } from '@aph/mobile-patients/src//helpers/helperFunctions';
import moment from 'moment';

export function postwebEngageProceedToPayEvent(
  shoppingCart: ShoppingCartContextProps,
  isStorePickup?: boolean,
  deliveryTime?: string
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
  };
  if (selectedStore) {
    eventAttributes['Store Id'] = selectedStore.storeid;
    eventAttributes['Store Name'] = selectedStore.storename;
  }
  postWebEngageEvent(WebEngageEventName.PHARMACY_PROCEED_TO_PAY_CLICKED, eventAttributes);
}

export function PharmacyCartViewedEvent(shoppingCart: ShoppingCartContextProps, id: string) {
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
  };
  if (shoppingCart.coupon) {
    eventAttributes['Coupon code used'] = shoppingCart.coupon.coupon;
  }
  postWebEngageEvent(WebEngageEventName.PHARMACY_CART_VIEWED, eventAttributes);
}

export function PricemismatchEvent(cartItem: ShoppingCartItem, id: string, storeItemPrice: number) {
  const isDiffLessOrGreaterThan25Percent = (num1: number, num2: number) => {
    const diffP = ((num1 - num2) / num1) * 100;
    const result = diffP > 25 || diffP < -25;
    return result;
  };
  const isDiff = storeItemPrice
    ? isDiffLessOrGreaterThan25Percent(cartItem.price, storeItemPrice)
    : true;
  const eventAttributes: WebEngageEvents[WebEngageEventName.SKU_PRICE_MISMATCH] = {
    'Mobile Number': id,
    'Sku Id': cartItem.id,
    'Magento MRP': cartItem.price,
    'Magento Pack Size': Number(cartItem.mou),
    'Store API MRP': storeItemPrice,
    'Price Change In Cart': isDiff ? 'No' : 'Yes',
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
  };
  postWebEngageEvent(WebEngageEventName.TAT_API_FAILURE, eventAttributes);
}

export function postwebEngageProductClickedEvent(cartItem: ShoppingCartItem) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_PRODUCT_CLICKED] = {
    'product name': cartItem.name,
    'product id': cartItem.id,
    Brand: '',
    'Brand ID': '',
    'category name': '',
    'category ID': '',
    Source: 'List',
    'Section Name': 'CART',
  };
  postWebEngageEvent(WebEngageEventName.PHARMACY_PRODUCT_CLICKED, eventAttributes);
}

export function postwebEngageProductRemovedEvent(cartItem: ShoppingCartItem, id: string) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.ITEMS_REMOVED_FROM_CART] = {
    'Customer ID': id,
    'No. of items': cartItem.quantity,
    'Product ID': cartItem.id,
    'Product Name': cartItem.name,
  };
  postWebEngageEvent(WebEngageEventName.ITEMS_REMOVED_FROM_CART, eventAttributes);
}

export function applyCouponClickedEvent(id: string) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.CART_APPLY_COUPON_CLCIKED] = {
    'Customer ID': id,
  };
  postWebEngageEvent(WebEngageEventName.CART_APPLY_COUPON_CLCIKED, eventAttributes);
}
