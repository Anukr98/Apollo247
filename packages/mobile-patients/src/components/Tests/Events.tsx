import moment from 'moment';
import {
  g,
  postAppsFlyerEvent,
  postCleverTapEvent,
  postFirebaseEvent,
  postWebEngageEvent,
  setCircleMembershipType,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  DIAGNOSTIC_SLOT_TYPE,
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  CleverTapEventName,
  CleverTapEvents,
  DiagnosticHomePageSource,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import {
  AppsFlyerEventName,
  AppsFlyerEvents,
  DiagnosticsDetailsPageViewedSource,
} from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import { circleValidity } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { DiagnosticsCartItem } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import AsyncStorage from '@react-native-community/async-storage';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { searchDiagnosticItem_searchDiagnosticItem_data } from '@aph/mobile-patients/src/graphql/types/searchDiagnosticItem';
import { searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics } from '@aph/mobile-patients/src/graphql/types/searchDiagnosticsByCityID';
import {
  DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE,
  DIAGNOSTIC_PINCODE_SOURCE_TYPE,
} from '@aph/mobile-patients/src/utils/commonUtils';
import { getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_patientObj } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';

function createPatientAttributes(currentPatient: any) {
  const patientAttributes = {
    'Patient UHID': g(currentPatient, 'uhid'),
    'Patient Gender': g(currentPatient, 'gender'),
    'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
    'Patient Age': Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
  };
  return patientAttributes;
}

export async function DiagnosticLandingPageViewedEvent(
  currentPatient: any,
  isDiagnosticCircleSubscription: boolean | undefined,
  source: DiagnosticHomePageSource
) {
  const getPatientAttributes = await createPatientAttributes(currentPatient);

  const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.DIAGNOSTIC_LANDING_PAGE_VIEWED] = {
    ...getPatientAttributes,
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
    Source: source,
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_LANDING_PAGE_VIEWED, cleverTapEventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_LANDING_PAGE_VIEWED, cleverTapEventAttributes);
}
export function DiagnosticHomePageSearchItem(
  currentPatient: any,
  keyword: string,
  results: any[],
  isDiagnosticCircleSubscription?: boolean | undefined
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  if (keyword.length > 2) {
    const eventAttributes:
      | WebEngageEvents[WebEngageEventName.DIAGNOSTIC_LANDING_ITEM_SEARCHED]
      | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_SEARCH_CLICKED] = {
      ...getPatientAttributes,
      'Keyword Entered': keyword,
      '# Results appeared': results.length,
      'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
    };

    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_LANDING_ITEM_SEARCHED, eventAttributes);
    postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_SEARCH_CLICKED, eventAttributes);
  }
}

export async function DiagnosticPinCodeClicked(
  currentPatient: any,
  pincode: string,
  serviceable: boolean,
  source: DIAGNOSTIC_PINCODE_SOURCE_TYPE,
  isDiagnosticCircleSubscription?: boolean | undefined
) {
  const getPatientAttributes = await createPatientAttributes(currentPatient);
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIAGNOSTIC_PINCODE_ENTERED_ON_LOCATION_BAR]
    | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_PINCODE_ENTERED_ON_LOCATION_BAR] = {
    ...getPatientAttributes,
    Pincode: Number(pincode!),
    Serviceability: serviceable ? 'Yes' : 'No',
    Source: source,
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
  };
  postWebEngageEvent(
    WebEngageEventName.DIAGNOSTIC_PINCODE_ENTERED_ON_LOCATION_BAR,
    eventAttributes
  );
  postCleverTapEvent(
    CleverTapEventName.DIAGNOSTIC_PINCODE_ENTERED_ON_LOCATION_BAR,
    eventAttributes
  );
}

export function DiagnosticHomePageWidgetClicked(
  currentPatient: any,
  section: string,
  name?: string,
  id?: string,
  category?: string,
  isDiagnosticCircleSubscription?: boolean | undefined
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIAGNOSTIC_HOME_PAGE_WIDGET_CLICKED]
    | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_HOME_PAGE_WIDGET_CLICKED] = {
    ...getPatientAttributes,
    Source: 'Home Page',
    'Section Name': section,
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
  };
  if (!!category) {
    eventAttributes['Category Name'] = category;
  }
  if (!!id) {
    eventAttributes['Item ID'] = id;
  }
  if (!!name) {
    eventAttributes['Item Name'] = name;
  }
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_HOME_PAGE_WIDGET_CLICKED, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_HOME_PAGE_WIDGET_CLICKED, eventAttributes);
}

export function DiagnosticAddToCartEvent(
  name: string,
  id: string,
  price: number,
  discountedPrice: number,
  source: DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE,
  section?: string,
  currentPatient?: any,
  isDiagnosticCircleSubscription?: boolean | undefined
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ADD_TO_CART]
    | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_ADD_TO_CART] = {
    ...getPatientAttributes,
    'Item Name': name,
    'Item ID': id,
    Source: source,
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
  };
  if (section) {
    eventAttributes['Section name'] = section;
  }
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ADD_TO_CART, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_ADD_TO_CART, eventAttributes);

  const appsFlyerAttributes: AppsFlyerEvents[AppsFlyerEventName.DIAGNOSTIC_ADD_TO_CART] = {
    af_content: name,
    af_content_id: id,
    af_price: price,
    DiscountedPrice: !!discountedPrice ? discountedPrice : 0,
    af_quantity: 1,
    af_content_type: source,
    af_currency: 'INR',
    af_customer_user_id: currentPatient?.id,
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
    LOB: 'Diagnostics',
  };

  if (!!section) {
    appsFlyerAttributes['af_category'] = section;
  }

  const firebaseAttributes: FirebaseEvents[FirebaseEventName.DIAGNOSTIC_ADD_TO_CART] = {
    productname: name,
    productid: id,
    Source: 'Diagnostic',
    Price: price,
    DiscountedPrice: discountedPrice,
    Quantity: 1,
  };

  postAppsFlyerEvent(AppsFlyerEventName.DIAGNOSTIC_ADD_TO_CART, appsFlyerAttributes);
  postFirebaseEvent(FirebaseEventName.DIAGNOSTIC_ADD_TO_CART, firebaseAttributes);
}

export const firePurchaseEvent = (
  orderId: string,
  grandTotal: number,
  cartItems: any,
  currentPatient: any,
  homeCollectionCharges: number
) => {
  let items: any = [],
    itemIds: any = [],
    itemNames: any = [],
    itemPrices: any = [],
    itemCategories: any = [],
    itemCollectionMethods: any = [],
    itemIndexs: any = [],
    itemQuantity: any = [],
    itemCurrency: any = [];

  !!cartItems &&
    cartItems?.length > 0 &&
    cartItems?.forEach((item: any, index: number) => {
      let itemObj: any = {};
      itemObj.item_name = item?.name;
      itemObj.item_id = item?.id;
      itemObj.price = !!item?.specialPrice ? item.specialPrice : item.price;
      itemObj.item_category = 'Diagnostics';
      itemObj.item_variant = item.collectionMethod; // "Default" (for Pharmacy) or Virtual / Physcial (for Consultations)
      itemObj.index = index + 1; // Item sequence number in the list
      itemObj.quantity = 1;
      itemObj.currency = 'INR';
      items.push(itemObj);

      itemIds.push(item?.id);
      itemNames.push(item?.name);
      itemPrices.push(!!item?.specialPrice ? String(item.specialPrice) : String(item.price));
      itemCategories.push('Diagnostics');
      itemCollectionMethods.push(item?.collectionMethod);
      itemIndexs.push(String(index));
      itemQuantity.push(String(1));
      itemCurrency.push('INR');
    });

  let appsFlyerObject = {} as any;
  appsFlyerObject.af_content = itemNames;
  appsFlyerObject.af_content_id = itemIds;
  appsFlyerObject.af_price = itemPrices;
  appsFlyerObject.af_category = itemCategories;
  appsFlyerObject.item_variant = itemCollectionMethods;
  appsFlyerObject.index = itemIndexs;
  appsFlyerObject.af_quantity = itemQuantity;
  appsFlyerObject.af_currency = itemCurrency;

  const stringifiedAppsFlyerObject = JSON.stringify(appsFlyerObject);

  const eventAttributes: FirebaseEvents[FirebaseEventName.PURCHASE] = {
    currency: 'INR',
    items: items,
    transaction_id: orderId,
    value: Number(grandTotal),
    LOB: 'Diagnostics',
  };
  const appsFlyerAttributes = {
    items: stringifiedAppsFlyerObject,
    af_revenue: Number(grandTotal),
    af_currency: 'INR',
    af_order_id: orderId,
    af_customer_user_id: currentPatient?.id,
  };

  const fireBaseSuccessEvent = {
    transaction_id: orderId,
    currency: 'INR',
    value: Number(grandTotal), //total revenue
    items: items,
    shipping: homeCollectionCharges,
  };

  postFirebaseEvent(FirebaseEventName.DIAGNOSTIC_ORDER_PLACE, fireBaseSuccessEvent);
  postFirebaseEvent(FirebaseEventName.PURCHASE, eventAttributes);
  postAppsFlyerEvent(AppsFlyerEventName.PURCHASE, appsFlyerAttributes);
};

export function DiagnosticDetailsViewed(
  source: DiagnosticsDetailsPageViewedSource,
  itemName: string,
  itemType: string,
  itemCode: string,
  currentPatient: any,
  itemPrice: number,
  pharmacyCircleAttributes: any,
  isDiagnosticCircleSubscription?: boolean | undefined
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIAGNOSTIC_TEST_DESCRIPTION]
    | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_TEST_DESCRIPTION] = {
    ...getPatientAttributes,
    Source: source,
    'Item Name': itemName,
    'Item Code': itemCode,
    'Item ID': itemCode,
    'Patient Name': `${currentPatient?.firstName} ${currentPatient?.lastName}`,
    'Patient UHID': currentPatient?.uhid,
    'Item Price': itemPrice,
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
  };
  if (!!itemType) {
    eventAttributes['Item Type'] = itemType;
  }
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_TEST_DESCRIPTION, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_TEST_DESCRIPTION, eventAttributes);

  const appsFlyerAttribute = {
    af_content_type: source,
    af_content_id: itemCode,
    af_content: itemName,
    af_customer_user_id: currentPatient?.id,
    PatientUHID: currentPatient?.uhid,
    PatientName: `${currentPatient?.firstName} ${currentPatient?.lastName}`,
    af_price: itemPrice,
    LOB: 'Diagnostics',
    ...pharmacyCircleAttributes,
  };

  const firebaseEventAttributes: FirebaseEvents[FirebaseEventName.PRODUCT_PAGE_VIEWED] = {
    PatientUHID: currentPatient?.uhid,
    PatientName: `${currentPatient?.firstName} ${currentPatient?.lastName}`,
    source: source,
    ItemName: itemName,
    ItemType: itemType,
    ItemCode: itemCode,
    ItemPrice: itemPrice,
    LOB: 'Diagnostics',
    ...pharmacyCircleAttributes,
  };
  postFirebaseEvent(FirebaseEventName.PRODUCT_PAGE_VIEWED, firebaseEventAttributes);
  postAppsFlyerEvent(AppsFlyerEventName.PRODUCT_PAGE_VIEWED, appsFlyerAttribute);
}

export function DiagnosticBannerClick(
  slideIndex: number,
  itemId: number,
  title: string,
  currentPatient?: any,
  isDiagnosticCircleSubscription?: boolean | undefined
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIAGNOSITC_HOME_PAGE_BANNER_CLICKED]
    | CleverTapEvents[CleverTapEventName.DIAGNOSITC_HOME_PAGE_BANNER_CLICKED] = {
    ...getPatientAttributes,
    position: slideIndex,
    itemId: itemId,
    'Banner title': title,
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
  };

  postWebEngageEvent(WebEngageEventName.DIAGNOSITC_HOME_PAGE_BANNER_CLICKED, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSITC_HOME_PAGE_BANNER_CLICKED, eventAttributes);
}

export async function DiagnosticCartViewed(
  source: string,
  currentPatient: any,
  cartItems: DiagnosticsCartItem[],
  isCircle: boolean,
  pincode: string | number,
  city: string,
  prescReqd?: boolean,
  gTotal?: number,
  collectionCharges?: number,
  circleSubId?: string,
  couponCode?: string,
  couponDiscount?: number,
  validity?: circleValidity | null
) {
  const getPatientAttributes = await createPatientAttributes(currentPatient);
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIAGNOSTIC_CART_VIEWED]
    | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_CART_VIEWED] = {
    ...getPatientAttributes,
    'Page source': source,
    'Total items in cart': cartItems?.length,
    'Cart Items': cartItems?.map(
      (item) =>
        (({
          id: item?.id,
          name: item?.name,
          price: item?.price,
          specialPrice: item?.specialPrice || item.price,
        } as unknown) as DiagnosticsCartItem)
    ),
    'Circle user': isCircle ? 'Yes' : 'No',
    Pincode: pincode,
    UHID: currentPatient?.uhid,
    city: city,
    'Prescription Needed': prescReqd ? 'Yes' : 'No',
  };

  if (!!gTotal) {
    eventAttributes['Net after discount'] = gTotal;
  }
  if (!!collectionCharges) {
    eventAttributes['Delivery charge'] = collectionCharges;
  }
  if (!!couponCode && !!couponDiscount) {
    eventAttributes['Coupon code used'] = couponCode;
    eventAttributes['Coupon Discount'] = couponDiscount;
  }
  // fireCircleBenifitAppliedEvent(currentPatient, validity, circleSubId, isCircle);
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_CART_VIEWED, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_CART_VIEWED, eventAttributes);
}

function fireCircleBenifitAppliedEvent(
  currentPatient: any,
  validity: circleValidity | null,
  circleSubId: string,
  isCircle: boolean
) {
  const circleMembershipType = setCircleMembershipType(validity?.startDate!, validity?.endDate!);
  const CircleEventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_CIRCLE_BENIFIT_APPLIED] = {
    'Patient UHID': currentPatient?.uhid,
    'Mobile Number': currentPatient?.mobileNumber,
    'Customer ID': currentPatient?.id,
    'Circle Member': circleSubId ? 'Yes' : 'No',
    'Membership Type': circleMembershipType,
    'Circle Membership Start Date': validity?.startDate!,
    'Circle Membership End Date': validity?.endDate!,
  };
  isCircle &&
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_CIRCLE_BENIFIT_APPLIED, CircleEventAttributes);
}

export function DiagnosticProceedToPay(
  noOfPatient: number,
  noOfSlots: number,
  slotType: DIAGNOSTIC_SLOT_TYPE,
  totalItems: number,
  cartTotal: number, //subtotal
  grandTotal: number, //net after discount
  pincode: string | number,
  address: string,
  collectionCharges: number,
  timeSlot: string,
  timeDate: string | Date,
  isCircle: 'Yes' | 'No',
  currentPatient: any
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIAGNOSTIC_MAKE_PAYMENT_CLICKED]
    | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_PROCEED_TO_PAY_CLICKED] = {
    ...getPatientAttributes,
    'No. of patients': noOfPatient,
    'No. of slots': noOfSlots,
    'Slot type': slotType,
    'Total items in cart': totalItems,
    'Sub Total': cartTotal,
    'Net after discount': grandTotal,
    'Pin Code': pincode,
    Address: address,
    'Home collection charges': collectionCharges,
    'Collection Time Slot': timeSlot,
    'Collection Date Slot': timeDate,
    'Circle user': isCircle,
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_MAKE_PAYMENT_CLICKED, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_PROCEED_TO_PAY_CLICKED, eventAttributes);
}

export function DiagnosticNonServiceableAddressSelected(
  selectedAddr: any,
  currentPatient: any,
  pincode: string | number,
  cartItems: DiagnosticsCartItem[],
  cartItemsWithId: any
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ADDRESS_NON_SERVICEABLE_CARTPAGE] = {
    'Patient UHID': g(currentPatient, 'uhid'),
    State: selectedAddr?.state || '',
    City: selectedAddr?.city || '',
    PinCode: Number(pincode),
    'Number of items in cart': cartItemsWithId.length,
    'Items in cart': cartItems,
  };
  postWebEngageEvent(
    WebEngageEventName.DIAGNOSTIC_ADDRESS_NON_SERVICEABLE_CARTPAGE,
    eventAttributes
  );
}

export function DiagnosticAppointmentTimeSlot(
  slotType: DIAGNOSTIC_SLOT_TYPE,
  time: string,
  numOfSlots: number,
  slotDate: string,
  currentPatient: any,
  isDiagnosticCircleSubscription?: boolean | undefined
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIAGNOSTIC_SLOT_TIME_SELECTED]
    | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_APPOINTMENT_TIME_SELECTED] = {
    ...getPatientAttributes,
    'Slot time': time,
    'Slot date': slotDate,
    'No. of slots': numOfSlots,
    Type: slotType,
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_SLOT_TIME_SELECTED, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_APPOINTMENT_TIME_SELECTED, eventAttributes);
}

export function PaymentInitiated(grandTotal: number, LOB: string, type: string) {
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.PAYMENT_INITIATED]
    | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_PAYMENT_INITIATED] = {
    'Order Amount': grandTotal,
    LOB: LOB,
    type: type,
  };
  const consultEventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_PAYMENT_INITIATED] = {
    Amount: grandTotal,
    LOB: LOB,
    Paymentmode: type,
  };
  postWebEngageEvent(WebEngageEventName.PAYMENT_INITIATED, eventAttributes);
  LOB == 'diagnostics' &&
    postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_PAYMENT_INITIATED, eventAttributes);
  LOB == 'consult' &&
    postCleverTapEvent(CleverTapEventName.CONSULT_PAYMENT_INITIATED, consultEventAttributes);
}

export async function DiagnosticAddresssSelected(
  type: 'New' | 'Existing',
  serviceable: 'Yes' | 'No',
  pincode: string | number,
  source: 'Home page' | 'Cart page',
  currentPatient?: any,
  isDiagnosticCircleSubscription?: boolean | undefined
) {
  const getPatientAttributes = await createPatientAttributes(currentPatient);
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ADDRESS_SELECTED_CARTPAGE]
    | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_ADDRESS_SELECTED_CARTPAGE] = {
    ...getPatientAttributes,
    'Selection type': type,
    Serviceability: serviceable,
    Pincode: pincode,
    Source: source,
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ADDRESS_SELECTED_CARTPAGE, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_ADDRESS_SELECTED_CARTPAGE, eventAttributes);
}

export function DiagnosticAddToCartClicked(
  pincode: string | number,
  currentPatient?: string,
  isDiagnosticCircleSubscription?: boolean | undefined
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ITEM_ADD_ON_CARTPAGE]
    | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_ITEM_ADD_ON_CARTPAGE] = {
    ...getPatientAttributes,
    Pincode: pincode,
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ITEM_ADD_ON_CARTPAGE, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_ITEM_ADD_ON_CARTPAGE, eventAttributes);
}

export function DiagnosticRemoveFromCartClicked(
  itemId: string | number,
  itemName: string,
  pincode: string | number,
  mode: 'Customer' | 'Automated',
  currentPatient?: any,
  isDiagnosticCircleSubscription?: boolean | undefined
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ITEM_REMOVE_ON_CARTPAGE]
    | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_ITEM_REMOVE_ON_CARTPAGE] = {
    ...getPatientAttributes,
    'Item ID': itemId,
    'Item name': itemName,
    Pincode: pincode,
    Mode: mode,
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ITEM_REMOVE_ON_CARTPAGE, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_ITEM_REMOVE_ON_CARTPAGE, eventAttributes);

  const appsFlyerAttributes = {
    af_content_id: String(itemId),
    af_customer_user_id: currentPatient?.id,
    af_content: itemName,
    af_quantity: 1,
  };

  postAppsFlyerEvent(AppsFlyerEventName.ITEMS_REMOVED_FROM_CART, appsFlyerAttributes);
}

export function DiagnosticRescheduleOrder(
  reason: string,
  time: string,
  date: string,
  orderId: string,
  currentPatient: any,
  patientObject: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_patientObj,
  isDiagnosticCircleSubscription?: boolean | undefined
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ORDER_RESCHEDULE]
    | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_ORDER_RESCHEDULE] = {
    ...getPatientAttributes,
    'Reschedule reason': reason,
    'Slot Time': time,
    'Slot Date': moment(date)?.format('DD-MM-YYYY'),
    'Order id': orderId,
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
    'Patient Name':
      (!!patientObject && `${patientObject?.firstName} ${patientObject?.lastName}`) ||
      `${currentPatient?.firstName} ${currentPatient?.lastName}`,
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ORDER_RESCHEDULE, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_ORDER_RESCHEDULE, eventAttributes);
}

export function DiagnosticTrackOrderViewed(
  currentPatient: any,
  latestStatus: string,
  orderId: string,
  source: 'Home' | 'My Order',
  isDiagnosticCircleSubscription?: boolean | undefined
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);

  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIAGNOSTIC_TRACK_ORDER_VIEWED]
    | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_TRACK_ORDER_VIEWED] = {
    ...getPatientAttributes,
    'Patient UHID': g(currentPatient, 'uhid'),
    'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
    'Latest Order Status': latestStatus,
    'Order id': orderId,
    Source: source,
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_TRACK_ORDER_VIEWED, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_TRACK_ORDER_VIEWED, eventAttributes);
}

export function DiagnosticFeedbackSubmitted(
  currentPatient: any,
  rating: string,
  reason: string,
  isDiagnosticCircleSubscription?: boolean | undefined
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIAGNOSTIC_FEEDBACK_GIVEN]
    | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_FEEDBACK_GIVEN] = {
    ...getPatientAttributes,
    Rating: rating,
    'Thing to Improve selected': reason,
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_FEEDBACK_GIVEN, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_FEEDBACK_GIVEN, eventAttributes);
}

export async function DiagnosticItemSearched(
  currentPatient: any,
  keyword: string,
  results: searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics[],
  isDiagnosticCircleSubscription: boolean | undefined
) {
  const getPatientAttributes = await createPatientAttributes(currentPatient);
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ITEM_SEARCHED]
    | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_SEARCH_CLICKED] = {
    ...getPatientAttributes,
    'Keyword Entered': keyword,
    '# Results appeared': results?.length,
    Popular: keyword == '' ? 'Yes' : 'No',
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ITEM_SEARCHED, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_SEARCH_CLICKED, eventAttributes);
}

export function DiagnosticPaymentPageViewed(
  currentPatient: any,
  amount: number,
  isDiagnosticCircleSubscription: boolean | undefined
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIAGNOSTIC_PAYMENT_PAGE_VIEWED]
    | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_PAYMENT_PAGE_VIEWED] = {
    ...getPatientAttributes,
    UHID: currentPatient?.uhid,
    'Order amount': amount,
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_PAYMENT_PAGE_VIEWED, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_PAYMENT_PAGE_VIEWED, eventAttributes);
}
export function DiagnosticPhleboFeedbackSubmitted(
  rating: string | number,
  feedback: string | number,
  phleboName: string,
  orderId: string | number,
  phleboId: string | number,
  patientComment: string,
  currentPatient?: string
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIAGNOSTIC_PHLEBO_FEEDBACK_SUBMITTED]
    | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_PHLEBO_FEEDBACK_SUBMITTED] = {
    ...getPatientAttributes,
    Rating: rating,
    Feedback: feedback,
    'Phlebo Name': phleboName,
    'Order id': orderId,
    'Phlebo id': phleboId,
    Comment: patientComment,
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_PHLEBO_FEEDBACK_SUBMITTED, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_PHLEBO_FEEDBACK_SUBMITTED, eventAttributes);
}
export function DiagnosticPhleboCallingClicked(
  currentPatient: any,
  orderId: string | number,
  phleboName: string,
  isDiagnosticCircleSubscription?: boolean | undefined
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIAGNOSTIC_PHLEBO_CALLING_CLICKED]
    | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_PHLEBO_CALLING_CLICKED] = {
    ...getPatientAttributes,
    UHID: g(currentPatient, 'uhid'),
    'Order id': orderId,
    'Phlebo Name': phleboName,
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_PHLEBO_CALLING_CLICKED, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_PHLEBO_CALLING_CLICKED, eventAttributes);
}

export function DiagnosticOrderSummaryViewed(
  amount: string | number,
  orderId: string | number,
  status: string,
  currentPatient?: string,
  isDiagnosticCircleSubscription?: boolean | undefined
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ORDER_SUMMARY_VIEWED]
    | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_ORDER_SUMMARY_VIEWED] = {
    ...getPatientAttributes,
    'Order amount': amount,
    'Order id': String(orderId),
    'Order status': status,
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ORDER_SUMMARY_VIEWED, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_ORDER_SUMMARY_VIEWED, eventAttributes);
}

export function DiagnosticAddTestClicked(
  orderId: string,
  currentPatient: any,
  status: string,
  isDiagnosticCircleSubscription: boolean | undefined
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIAGNOSITC_MODIFY_CLICKED]
    | CleverTapEvents[CleverTapEventName.DIAGNOSITC_MODIFY_CLICKED] = {
    ...getPatientAttributes,
    'Order id': orderId,
    UHID: currentPatient?.uhid,
    'Order status': status,
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSITC_MODIFY_CLICKED, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSITC_MODIFY_CLICKED, eventAttributes);
}

export function DiagnosticModifyOrder(
  totalItems: number,
  itemArray: string,
  oldTotal: number,
  newTotal: number,
  hcUpdated: 'Yes' | 'No',
  mode: 'Prepaid' | 'Cash'
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_MODIFY_ORDER] = {
    'No of items Added': totalItems,
    'Item ids in array': itemArray,
    'Old order value': oldTotal,
    'updated order value': newTotal,
    'HC charge updated': hcUpdated,
    'payment mode': mode,
    'time of modification': new Date(),
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_MODIFY_ORDER, eventAttributes);
}

export function DiagnosticViewReportClicked(
  source: 'Home' | 'My Order' | 'Track Order' | 'Order Summary',
  reportGenerated: 'Yes' | 'No',
  action: 'Download Report PDF',
  orderId?: string,
  currentPatient?: string,
  isDiagnosticCircleSubscription?: boolean | undefined
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIAGNOSTIC_VIEW_REPORT_CLICKED]
    | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_VIEW_REPORT_CLICKED] = {
    ...getPatientAttributes,
    Source: source,
    'Report generated': reportGenerated,
    'Action taken': action,
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
  };
  if (!!orderId) {
    eventAttributes['Order id'] = orderId;
  }
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_VIEW_REPORT_CLICKED, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_VIEW_REPORT_CLICKED, eventAttributes);
}

export function DiagnosticCallToOrderClicked(
  page: string,
  currentPatient?: any,
  sectionName?: string,
  itemId?: string,
  itemName?: string,
  city?: string,
  isDiagnosticCircleSubscription?: boolean | undefined
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  const eventAttributes:
    | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_CALL_TO_ORDER_CLICKED] = {
    ...getPatientAttributes,
    'Mobile Number': currentPatient?.mobileNumber,
    'Page': page,
    'Section Name': sectionName,
    'ItemId': itemId,
    'ItemName': itemName,
    'Patient City': city,
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
  };
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_CALL_TO_ORDER_CLICKED, eventAttributes);
}

export function DiagnosticTrackPhleboClicked(
  orderId: string | number,
  source: 'Home' | 'My Order' | 'Track Order' | 'Order Summary',
  currentPatient: any,
  isOpen: 'Yes' | 'No',
  isDiagnosticCircleSubscription?: boolean | undefined
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIAGNOSTIC_TRACK_PHLEBO_CLICKED]
    | CleverTapEvents[CleverTapEventName.DIAGNOSTIC_TRACK_PHLEBO_CLICKED] = {
    ...getPatientAttributes,
    'Order id': orderId,
    Source: source,
    UHID: currentPatient?.uhid,
    'Link opened': isOpen,
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_TRACK_PHLEBO_CLICKED, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_TRACK_PHLEBO_CLICKED, eventAttributes);
}

export function DiagnosticUserPaymentAborted(currentPatient: any, orderId: string) {
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.DIGNOSTIC_PAYMENT_ABORTED]
    | CleverTapEvents[CleverTapEventName.DIGNOSTIC_PAYMENT_ABORTED] = {
    'Order id': orderId,
    UHID: currentPatient?.uhid,
  };
  postWebEngageEvent(WebEngageEventName.DIGNOSTIC_PAYMENT_ABORTED, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIGNOSTIC_PAYMENT_ABORTED, eventAttributes);
}

export function DiagnosticPatientSelected(
  patientCount: number,
  patientUhid: string,
  patientNames: string
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_PATIENT_SELECTED] = {
    'No. of patients': patientCount,
    'Patient UHID': patientUhid,
    'Patient name': patientNames,
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_PATIENT_SELECTED, eventAttributes);
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_PATIENT_SELECTED, eventAttributes);
}

export function DiagnosticProductListingPageViewed(
  type: 'Category' | 'Widget',
  source: any,
  categoryName: string,
  sectionName: string
) {
  const eventAttributes: CleverTapEvents[CleverTapEventName.DIAGNOSTIC_PRODUCT_LISTING_PAGE_VIEWED] = {
    Type: type,
    Source: source,
    'Category Name': categoryName,
    'Section name': sectionName,
  };
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_PRODUCT_LISTING_PAGE_VIEWED, eventAttributes);
}

export function DiagnosticPrescriptionSubmitted(
  currentPatient: any,
  prescriptionUrl: any,
  itemName: any,
  userType: string | null,
  isDiagnosticCircleSubscription?: boolean | undefined
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  const eventAttributes: CleverTapEvents[CleverTapEventName.DIAGNOSTIC_PRESCRIPTION_SUBMITTED] = {
    ...getPatientAttributes,
    'Patient MobileNumber': currentPatient?.mobileNumber,
    'Circle user': isDiagnosticCircleSubscription ? 'Yes' : 'No',
    'User Type': userType,
    Source: 'Apollo247App',
    PrescriptionUrl: prescriptionUrl,
    'Item Name': itemName,
  };
  postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_PRESCRIPTION_SUBMITTED, eventAttributes);
}

export function DiagnosticHomePageClicked(
  currentPatient: any,
  userType: any,
  navSrc: string,
  circleMember: any,
  deviceId: any
) {
  const eventAttributes = {
    'Patient name': `${currentPatient?.firstName} ${currentPatient?.lastName}`,
    'Patient UHID': currentPatient?.uhid,
    Relation: currentPatient?.relation,
    'Patient age': Math.round(moment().diff(currentPatient?.dateOfBirth || 0, 'years', true)),
    'Patient gender': currentPatient?.gender,
    'Mobile Number': currentPatient?.mobileNumber,
    'Customer ID': currentPatient?.id,
    User_Type: userType,
    'Nav src': navSrc,
    'Circle Member': circleMember,
    'Device Id': deviceId,
  };
  postCleverTapEvent(CleverTapEventName.HOME_ICON_CLICKED, eventAttributes);
}
