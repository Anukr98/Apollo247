import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import {
  postWebEngageEvent,
  g,
  postAppsFlyerEvent,
  postFirebaseEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { Store } from '@aph/mobile-patients/src/helpers/apiCalls';
import moment from 'moment';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import { AppsFlyerEventName } from './AppsFlyerEvents';

type MyOrdersClicked = WebEngageEvents[WebEngageEventName.MY_ORDERS_CLICKED];

export const postMyOrdersClicked = (
  source: MyOrdersClicked['Source'],
  customer: GetCurrentPatients_getCurrentPatients_patients
) => {
  const eventAttributes: MyOrdersClicked = {
    Source: source,
    'Customer ID': g(customer, 'id')!,
    'Mobile Number': g(customer, 'mobileNumber')!,
  };
  postWebEngageEvent(WebEngageEventName.MY_ORDERS_CLICKED, eventAttributes);
};

type PharmacyMyOrderTrackingClicked = WebEngageEvents[WebEngageEventName.PHARMACY_MY_ORDER_TRACKING_CLICKED];

export const postPharmacyMyOrderTrackingClicked = (
  orderId: PharmacyMyOrderTrackingClicked['Order ID'],
  orderStatus: PharmacyMyOrderTrackingClicked['Order Status'],
  orderDate: PharmacyMyOrderTrackingClicked['Order Date'],
  deliveryDate: PharmacyMyOrderTrackingClicked['Delivery Date'],
  orderType: PharmacyMyOrderTrackingClicked['Order Type'],
  customer: GetCurrentPatients_getCurrentPatients_patients
) => {
  const eventAttributes: PharmacyMyOrderTrackingClicked = {
    'Order ID': orderId,
    'Order Type': orderType,
    'Order Status': orderStatus,
    'Order Date': orderDate,
    'Delivery Date': deliveryDate,
    'Customer ID': g(customer, 'id')!,
    'Mobile Number': g(customer, 'mobileNumber')!,
  };
  postWebEngageEvent(WebEngageEventName.PHARMACY_MY_ORDER_TRACKING_CLICKED, eventAttributes);
};

type PharmacyAddNewAddressClick = WebEngageEvents[WebEngageEventName.PHARMACY_ADD_NEW_ADDRESS_CLICK];

export const postPharmacyAddNewAddressClick = (source: PharmacyAddNewAddressClick['Source']) => {
  const eventAttributes: PharmacyAddNewAddressClick = {
    Source: source,
  };
  postWebEngageEvent(WebEngageEventName.PHARMACY_ADD_NEW_ADDRESS_CLICK, eventAttributes);
};

type PharmacyAddNewAddressCompleted = WebEngageEvents[WebEngageEventName.PHARMACY_ADD_NEW_ADDRESS_COMPLETED];

export const postPharmacyAddNewAddressCompleted = (
  source: PharmacyAddNewAddressCompleted['Source'],
  pincode: PharmacyAddNewAddressCompleted['Pincode'],
  deliveryAddress: PharmacyAddNewAddressCompleted['Delivery address'],
  tat: PharmacyAddNewAddressCompleted['TAT Displayed'],
  deliveryTat: PhamracyCartAddressSelectedSuccess['Delivery TAT'],
  success?: PharmacyAddNewAddressCompleted['Success']
) => {
  const eventAttributes: PharmacyAddNewAddressCompleted = {
    Source: source,
    Success: success,
    'Delivery address': deliveryAddress,
    Pincode: pincode,
    'TAT Displayed': tat,
    'Delivery TAT': deliveryTat,
  };
  postWebEngageEvent(WebEngageEventName.PHARMACY_ADD_NEW_ADDRESS_COMPLETED, eventAttributes);
};

type PhamracyCartAddressSelectedSuccess = WebEngageEvents[WebEngageEventName.PHARMACY_CART_ADDRESS_SELECTED_SUCCESS];

export const postPhamracyCartAddressSelectedSuccess = (
  pincode: PhamracyCartAddressSelectedSuccess['Pincode'],
  deliveryAddress: PhamracyCartAddressSelectedSuccess['Delivery Address'],
  success: PhamracyCartAddressSelectedSuccess['Delivery Successful'],
  tatDisplayed: PhamracyCartAddressSelectedSuccess['TAT Displayed'],
  deliveryTat: PhamracyCartAddressSelectedSuccess['Delivery TAT']
) => {
  const eventAttributes: PhamracyCartAddressSelectedSuccess = {
    'TAT Displayed': tatDisplayed,
    'Delivery Successful': success,
    'Delivery Address': deliveryAddress,
    Pincode: pincode,
    'Delivery TAT': deliveryTat,
  };
  postWebEngageEvent(WebEngageEventName.PHARMACY_CART_ADDRESS_SELECTED_SUCCESS, eventAttributes);

  const firebaseAttributes: FirebaseEvents[FirebaseEventName.PHARMACY_CART_ADDRESS_SELECTED_SUCCESS] = {
    TATDisplayed: tatDisplayed,
    DeliverySuccessful: success,
    DeliveryAddress: deliveryAddress,
    Pincode: pincode,
    DeliveryTAT: deliveryTat,
    LOB: 'Pharmacy',
  };
  postAppsFlyerEvent(AppsFlyerEventName.PHARMACY_CART_ADDRESS_SELECTED_SUCCESS, firebaseAttributes);
  postFirebaseEvent(FirebaseEventName.PHARMACY_CART_ADDRESS_SELECTED_SUCCESS, firebaseAttributes);
};

type PhamracyCartAddressSelectedFailure = WebEngageEvents[WebEngageEventName.PHARMACY_CART_ADDRESS_SELECTED_FAILURE];

export const postPhamracyCartAddressSelectedFailure = (
  pincode: PhamracyCartAddressSelectedFailure['Pincode'],
  deliveryAddress: PhamracyCartAddressSelectedFailure['Delivery Address'],
  success: PhamracyCartAddressSelectedFailure['Delivery Successful'],
  tatDisplayed?: PhamracyCartAddressSelectedFailure['TAT Displayed']
) => {
  const eventAttributes: PhamracyCartAddressSelectedFailure = {
    'TAT Displayed': tatDisplayed,
    'Delivery Successful': success,
    'Delivery Address': deliveryAddress,
    Pincode: pincode,
  };
  postWebEngageEvent(WebEngageEventName.PHARMACY_CART_ADDRESS_SELECTED_FAILURE, eventAttributes);
};

type ShowPrescriptionAtStoreSelected = WebEngageEvents[WebEngageEventName.SHOW_PRESCRIPTION_AT_STORE_SELECTED];

export const postShowPrescriptionAtStoreSelected = (
  eventAttributes: ShowPrescriptionAtStoreSelected
) => {
  postWebEngageEvent(WebEngageEventName.SHOW_PRESCRIPTION_AT_STORE_SELECTED, eventAttributes);
};

type PharmacyStorePickupViewed = WebEngageEvents[WebEngageEventName.PHARMACY_STORE_PICKUP_VIEWED];

export const postPharmacyStorePickupViewed = (eventAttributes: PharmacyStorePickupViewed) => {
  postWebEngageEvent(WebEngageEventName.PHARMACY_STORE_PICKUP_VIEWED, eventAttributes);
};

type PharmacyStoreSelectedSuccess = WebEngageEvents[WebEngageEventName.PHARMACY_STORE_SELECTED_SUCCESS];

export const postPharmacyStoreSelectedSuccess = (
  pincode: PharmacyStoreSelectedSuccess['Pincode'],
  store: Store
) => {
  const eventAttributes: PharmacyStoreSelectedSuccess = {
    Pincode: pincode,
    'Store Id': store.storeid,
    'Store Name': store.storename,
    'Store Number': store.phone,
    'Store Address': store.address,
  };
  postWebEngageEvent(WebEngageEventName.PHARMACY_STORE_SELECTED_SUCCESS, eventAttributes);
};
