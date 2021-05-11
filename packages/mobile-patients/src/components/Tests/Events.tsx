import moment from 'moment';
import {
  g,
  postAppsFlyerEvent,
  postFirebaseEvent,
  postWebEngageEvent,
  setCircleMembershipType,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import {
  AppsFlyerEventName,
  AppsFlyerEvents,
} from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import { circleValidity } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { DiagnosticsCartItem } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';

function createPatientAttributes(currentPatient: any) {
  const patientAttributes = {
    'Patient UHID': g(currentPatient, 'uhid'),
    'Patient Gender': g(currentPatient, 'gender'),
    'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
    'Patient Age': Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
  };
  return patientAttributes;
}

export function DiagnosticLandingPageViewedEvent(
  currentPatient: any,
  isServiceable: boolean | undefined,
  source?: string | undefined
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_LANDING_PAGE_VIEWED] = {
    ...getPatientAttributes,
    Serviceability: isServiceable ? 'Yes' : 'No',
  };
  if (!!source) {
    eventAttributes['Source'] = source;
  }
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_LANDING_PAGE_VIEWED, eventAttributes);
}

export function DiagnosticHomePageSearchItem(currentPatient: any, keyword: string, results: any[]) {
  const getPatientAttributes = createPatientAttributes(currentPatient);

  if (keyword.length > 2) {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_LANDING_ITEM_SEARCHED] = {
      ...getPatientAttributes,
      'Keyword Entered': keyword,
      '# Results appeared': results.length,
    };
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_LANDING_ITEM_SEARCHED, eventAttributes);
  }
}

export function DiagnosticPinCodeClicked(
  currentPatient: any,
  mode: string,
  pincode: string,
  serviceable: boolean
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);

  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_PINCODE_ENTERED_ON_LOCATION_BAR] = {
    ...getPatientAttributes,
    Mode: mode,
    Pincode: parseInt(pincode!),
    Serviceability: serviceable ? 'Yes' : 'No',
  };
  postWebEngageEvent(
    WebEngageEventName.DIAGNOSTIC_PINCODE_ENTERED_ON_LOCATION_BAR,
    eventAttributes
  );
}

export function DiagnosticHomePageWidgetClicked(name: string, id: string, section: string) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_HOME_PAGE_WIDGET_CLICKED] = {
    'Item Name': name,
    'Item ID': id,
    Source: 'Home Page',
    'Section Name': section,
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_HOME_PAGE_WIDGET_CLICKED, eventAttributes);
}

export function DiagnosticAddToCartEvent(
  name: string,
  id: string,
  price: number,
  discountedPrice: number,
  source: 'Home page' | 'Full search' | 'Details page' | 'Partial search' | 'Listing page',
  section?: string
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ADD_TO_CART] = {
    'Item Name': name,
    'Item ID': id,
    Source: source,
  };
  if (section) {
    eventAttributes['Section'] = section;
  }
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ADD_TO_CART, eventAttributes);

  const firebaseAttributes: FirebaseEvents[FirebaseEventName.DIAGNOSTIC_ADD_TO_CART] = {
    productname: name,
    productid: id,
    Source: 'Diagnostic',
    Price: price,
    DiscountedPrice: discountedPrice,
    Quantity: 1,
  };
  postFirebaseEvent(FirebaseEventName.DIAGNOSTIC_ADD_TO_CART, firebaseAttributes);
  postAppsFlyerEvent(AppsFlyerEventName.DIAGNOSTIC_ADD_TO_CART, firebaseAttributes);
}

export const firePurchaseEvent = (orderId: string, grandTotal: number, cartItems: any) => {
  let items: any = [];
  cartItems.forEach((item: any, index: number) => {
    let itemObj: any = {};
    itemObj.item_name = item.name; // Product Name or Doctor Name
    itemObj.item_id = item.id; // Product SKU or Doctor ID
    itemObj.price = item.specialPrice ? item.specialPrice : item.price; // Product Price After discount or Doctor VC price (create another item in array for PC price)
    itemObj.item_brand = ''; // Product brand or Apollo (for Apollo doctors) or Partner Doctors (for 3P doctors)
    itemObj.item_category = 'Diagnostics'; // 'Pharmacy' or 'Consultations'
    itemObj.item_category2 = ''; // FMCG or Drugs (for Pharmacy) or Specialty Name (for Consultations)
    itemObj.item_variant = item.collectionMethod; // "Default" (for Pharmacy) or Virtual / Physcial (for Consultations)
    itemObj.index = index + 1; // Item sequence number in the list
    itemObj.quantity = 1; // "1" or actual quantity
    items.push(itemObj);
  });
  const eventAttributes: FirebaseEvents[FirebaseEventName.PURCHASE] = {
    currency: 'INR',
    items: items,
    transaction_id: orderId,
    value: Number(grandTotal),
    LOB: 'Diagnostics',
  };
  const appsFlyerAttributes: AppsFlyerEvents[AppsFlyerEventName.PURCHASE] = {
    currency: 'INR',
    items: items,
    transaction_id: orderId,
    af_revenue: Number(grandTotal),
    af_currency: 'INR',
  };
  postFirebaseEvent(FirebaseEventName.PURCHASE, eventAttributes);
  postAppsFlyerEvent(AppsFlyerEventName.PURCHASE, appsFlyerAttributes);
};

export function DiagnosticDetailsViewed(
  source:
    | 'Full Search'
    | 'Home Page'
    | 'Cart Page'
    | 'Partial Search'
    | 'Deeplink'
    | 'Popular search',
  itemName: string,
  itemType: string,
  itemCode: string,
  currentPatient: any,
  itemPrice: number,
  pharmacyCircleAttributes: any
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_TEST_DESCRIPTION] = {
    Source: source,
    'Item Name': itemName,
    'Item Code': itemCode,
    'Item ID': itemCode,
    'Patient Name': `${currentPatient?.firstName} ${currentPatient?.lastName}`,
    'Patient UHID': currentPatient?.uhid,
    'Item Price': itemPrice,
  };
  if (!!itemType) {
    eventAttributes['Item Type'] = itemType;
  }
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_TEST_DESCRIPTION, eventAttributes);

  const firebaseEventAttributes: FirebaseEvents[FirebaseEventName.PRODUCT_PAGE_VIEWED] = {
    PatientUHID: g(currentPatient, 'uhid'),
    PatientName: `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
    source: source,
    ItemName: itemName,
    ItemType: itemType,
    ItemCode: itemCode,
    ItemPrice: itemPrice,
    LOB: 'Diagnostics',
    ...pharmacyCircleAttributes,
  };
  postFirebaseEvent(FirebaseEventName.PRODUCT_PAGE_VIEWED, firebaseEventAttributes);
  postAppsFlyerEvent(AppsFlyerEventName.PRODUCT_PAGE_VIEWED, firebaseEventAttributes);
}

export function DiagnosticBannerClick(slideIndex: number, itemId: number) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSITC_HOME_PAGE_BANNER_CLICKED] = {
    position: slideIndex,
    itemId: itemId,
  };

  postWebEngageEvent(WebEngageEventName.DIAGNOSITC_HOME_PAGE_BANNER_CLICKED, eventAttributes);
}

export function DiagnosticCartViewed(
  currentPatient: any,
  cartItems: DiagnosticsCartItem[],
  couponDiscount: number | string,
  gTotal: number,
  prescReqd: boolean,
  diagnosticSlot: any,
  coupon: any,
  collectionCharges: number,
  validity: circleValidity | null,
  circleSubId: string,
  isCircle: boolean
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_CART_VIEWED] = {
    'Total items in cart': cartItems?.length,
    // 'Delivery charge': deliveryCharges,
    'Total Discount': Number(couponDiscount),
    'Net after discount': gTotal,
    'Prescription Needed?': prescReqd ? 'Yes' : 'No',
    'Cart Items': cartItems?.map(
      (item) =>
        (({
          id: item?.id,
          name: item?.name,
          price: item?.price,
          specialPrice: item?.specialPrice || item.price,
        } as unknown) as DiagnosticsCartItem)
    ),
  };
  if (diagnosticSlot) {
    eventAttributes['Delivery charge'] = collectionCharges;
  }
  if (coupon) {
    eventAttributes['Coupon code used'] = coupon?.code;
  }
  fireCircleBenifitAppliedEvent(currentPatient, validity, circleSubId, isCircle);
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_CART_VIEWED, eventAttributes);
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
  date: Date,
  currentPatient: any,
  cartItems: DiagnosticsCartItem[],
  cartTotal: number,
  grandTotal: number,
  prescRqd: boolean,
  mode: 'Home' | 'Pickup' | 'Home Visit' | 'Clinic Visit',
  pincode: string | number,
  serviceName: 'Pharmacy' | 'Diagnostic',
  areaName: string,
  collectionCharges: number,
  timeSlot: string
) {
  const diffInDays = date.getDate() - new Date().getDate();
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_PROCEED_TO_PAY_CLICKED] = {
    'Patient Name selected': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
    'Total items in cart': cartItems?.length,
    'Sub Total': cartTotal,
    // 'Delivery charge': deliveryCharges,
    'Net after discount': grandTotal,
    'Prescription Uploaded?': false, //from backend
    'Prescription Mandatory?': prescRqd,
    'Mode of Sample Collection': mode,
    'Pin Code': pincode,
    'Service Area': serviceName,
    'Area Name': areaName,
    'No of Days ahead of Order Date selected': diffInDays,
    'Home collection charges': collectionCharges,
    'Collection Time Slot': timeSlot,
  };
  if (mode == 'Home' || mode == 'Home Visit') {
    eventAttributes['Delivery Date Time'] = date;
  }
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_PROCEED_TO_PAY_CLICKED, eventAttributes);
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

export function DiagnosticAreaSelected(selectedAddr: any, area: string) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_AREA_SELECTED] = {
    'Address Pincode': Number(selectedAddr?.zipcode!),
    'Area Selected': area,
    Servicability: 'Yes',
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_AREA_SELECTED, eventAttributes);
}

export function DiagnosticAppointmentTimeSlot(
  selectedAddr: any,
  area: string,
  time: string,
  diffInDays: number
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_APPOINTMENT_TIME_SELECTED] = {
    'Address Pincode': Number(selectedAddr?.zipcode!),
    'Area Selected': area,
    'Time Selected': time,
    'No of Days ahead of Order Date selected': diffInDays,
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_APPOINTMENT_TIME_SELECTED, eventAttributes);
}

export function DiagnosticPaymentInitiated(
  mode: 'Prepaid' | 'Cash',
  grandTotal: number,
  serviceArea: 'Diagnostic' | 'Pharmacy',
  LOB: string,
  type: string
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_PAYMENT_INITIATED] = {
    Paymentmode: mode,
    Amount: grandTotal,
    ServiceArea: serviceArea,
    LOB: LOB,
    type: type,
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_PAYMENT_INITIATED, eventAttributes);
}

export function DiagnosticViewReportClicked() {
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_VIEW_REPORT_CLICKED, {});
}

//to do
export function DiagnosticAddresssSelected(
  type: 'New' | 'Existing',
  serviceable: 'Yes' | 'No',
  pincode: string | number,
  source: 'Home page' | 'Cart page'
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ADDRESS_SELECTED_CARTPAGE] = {
    'Selection type': type,
    Serviceability: serviceable,
    Pincode: pincode,
    Source: source,
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ADDRESS_SELECTED_CARTPAGE, eventAttributes);
}

export function DiagnosticAddToCartClicked() {
  postWebEngageEvent(WebEngageEventName.DIAGNOSITC_ITEM_ADD_ON_CARTPAGE, {});
}

export function DiagnosticRemoveFromCartClicked(
  itemId: string | number,
  itemName: string,
  pincode: string | number,
  mode: 'Customer' | 'Automated'
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ITEM_REMOVE_ON_CARTPAGE] = {
    'Item ID': itemId,
    'Item name': itemName,
    Pincode: pincode,
    Mode: mode,
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ITEM_REMOVE_ON_CARTPAGE, eventAttributes);
}

export function DiagnosticRescheduleOrder(
  reason: string,
  time: string,
  date: string,
  orderId: string
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSITC_ORDER_RESCHEDULE] = {
    Reschedule: reason,
    'Slot Time': time,
    'Slot Date': date,
    'Order id': orderId,
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSITC_ORDER_RESCHEDULE, eventAttributes);
}

export function DiagnosticTrackOrderViewed(
  currentPatient: any,
  latestStatus: string,
  orderId: string
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_TRACK_ORDER_VIEWED] = {
    'Patient UHID': g(currentPatient, 'uhid'),
    'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
    'Latest Order Status': latestStatus,
    'Order id': orderId,
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_TRACK_ORDER_VIEWED, eventAttributes);
}

export function DiagnosticFeedbackSubmitted(currentPatient: any, rating: string, reason: string) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_FEEDBACK_GIVEN] = {
    'Patient UHID': g(currentPatient, 'uhid'),
    'Patient Name': g(currentPatient, 'firstName'),
    Rating: rating,
    'Thing to Improve selected': reason,
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_FEEDBACK_GIVEN, eventAttributes);
}

export function DiagnosticPaymentPageViewed(currentPatient: any, amount: string | number) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_PAYMENT_PAGE_VIEWED] = {
    UHID: g(currentPatient, 'uhid'),
    'Order amount': amount,
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_PAYMENT_PAGE_VIEWED, eventAttributes);
}
export function DiagnosticPhleboFeedbackSubmitted(
  rating: string | number,
  feedback: string | number,
  phleboName: string,
  orderId: string | number,
  phleboId: string | number
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_PHLEBO_FEEDBACK_SUBMITTED] = {
    Rating: rating,
    Feedback: feedback,
    'Phlebo Name': phleboName,
    'Order id': orderId,
    'Phlebo id': phleboId,
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_PHLEBO_FEEDBACK_SUBMITTED, eventAttributes);
}
export function DiagnosticPhleboCallingClicked(
  currentPatient: any,
  orderId: string | number,
  phleboName: string
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_PHLEBO_CALLING_CLICKED] = {
    UHID: g(currentPatient, 'uhid'),
    'Order id': orderId,
    'Phlebo Name': phleboName,
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_PHLEBO_CALLING_CLICKED, eventAttributes);
}
export function DiagnosticPhleboTrackClicked(
  currentPatient: any,
  orderId: string | number,
  isOpened: boolean
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_TRACK_PHLEBO_CLICKED] = {
    UHID: g(currentPatient, 'uhid'),
    'Order id': orderId,
    'Linked opened': isOpened ? 'Yes' : 'No',
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_TRACK_PHLEBO_CLICKED, eventAttributes);
}
