import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import { postWebEngageEvent, g } from '@aph/mobile-patients/src/helpers/helperFunctions';

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
  success?: PharmacyAddNewAddressCompleted['Success']
) => {
  const eventAttributes: PharmacyAddNewAddressCompleted = {
    Source: source,
    Success: success,
    'Delivery address': deliveryAddress,
    Pincode: pincode,
  };
  postWebEngageEvent(WebEngageEventName.PHARMACY_ADD_NEW_ADDRESS_COMPLETED, eventAttributes);
};

type PhamracyCartAddressSelectedSuccess = WebEngageEvents[WebEngageEventName.PHAMRACY_CART_ADDRESS_SELECTED_SUCCESS];

export const postPhamracyCartAddressSelectedSuccess = (
  pincode: PhamracyCartAddressSelectedSuccess['Pincode'],
  deliveryAddress: PhamracyCartAddressSelectedSuccess['Delivery Address'],
  success: PhamracyCartAddressSelectedSuccess['Delivery Successful'],
  tatDisplayed?: PhamracyCartAddressSelectedSuccess['TAT Displayed']
) => {
  const eventAttributes: PhamracyCartAddressSelectedSuccess = {
    'TAT Displayed': tatDisplayed,
    'Delivery Successful': success,
    'Delivery Address': deliveryAddress,
    Pincode: pincode,
  };
  postWebEngageEvent(WebEngageEventName.PHAMRACY_CART_ADDRESS_SELECTED_SUCCESS, eventAttributes);
};
