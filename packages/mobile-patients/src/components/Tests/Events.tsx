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
import { searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics } from '@aph/mobile-patients/src/graphql/types/searchDiagnosticsByCityID';

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

export function DiagnosticHomePageWidgetClicked(
  section: string,
  name?: string,
  id?: string,
  category?: string
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_HOME_PAGE_WIDGET_CLICKED] = {
    Source: 'Home Page',
    'Section Name': section,
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
}

export function DiagnosticAddToCartEvent(
  name: string,
  id: string,
  price: number,
  discountedPrice: number,
  source:
    | 'Home page'
    | 'Full search'
    | 'Details page'
    | 'Partial search'
    | 'Listing page'
    | 'Popular search'
    | 'Category page'
    | 'Prescription'
    | 'Cart page',
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
    | 'Cart page'
    | 'Partial Search'
    | 'Deeplink'
    | 'Popular search'
    | 'Category page',
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

export function DiagnosticBannerClick(slideIndex: number, itemId: number, title: string) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSITC_HOME_PAGE_BANNER_CLICKED] = {
    position: slideIndex,
    itemId: itemId,
    'Banner title': title,
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
  isCircle: boolean,
  pincode: string | number
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
    Pincode: pincode,
    UHID: currentPatient?.uhid,
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
  mode: 'Home Visit' | 'Clinic Visit',
  pincode: string | number,
  serviceName: 'Pharmacy' | 'Diagnostic',
  areaName: string,
  areaId: string | number,
  collectionCharges: number,
  timeSlot: string
) {
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
    'Area id': areaId,
    'Home collection charges': collectionCharges,
    'Collection Time Slot': timeSlot,
  };
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
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_AREA_SELECTED, eventAttributes);
}

export function DiagnosticAppointmentTimeSlot(
  selectedAddr: any,
  area: string,
  time: string,
  slotSelectedMode: 'Manual' | 'Automatic',
  isSlotAvailable: 'Yes' | 'No',
  currentPatient: any
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_APPOINTMENT_TIME_SELECTED] = {
    'Address Pincode': Number(selectedAddr?.zipcode!),
    'Area Selected': area,
    'Time Selected': time,
    'Slot selected': slotSelectedMode,
    'Slot available': isSlotAvailable,
    UHID: currentPatient?.uhid,
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_APPOINTMENT_TIME_SELECTED, eventAttributes);
}

export function PaymentInitiated(grandTotal: number, LOB: string, type: string) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.PAYMENT_INITIATED] = {
    Amount: grandTotal,
    LOB: LOB,
    type: type,
  };
  postWebEngageEvent(WebEngageEventName.PAYMENT_INITIATED, eventAttributes);
}

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
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ITEM_ADD_ON_CARTPAGE, {});
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
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ORDER_RESCHEDULE] = {
    'Reschedule reason': reason,
    'Slot Time': time,
    'Slot Date': date,
    'Order id': orderId,
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ORDER_RESCHEDULE, eventAttributes);
}

export function DiagnosticTrackOrderViewed(
  currentPatient: any,
  latestStatus: string,
  orderId: string,
  source: 'Home' | 'My Order' | 'Track Order' | 'Order Summary'
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_TRACK_ORDER_VIEWED] = {
    'Patient UHID': g(currentPatient, 'uhid'),
    'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
    'Latest Order Status': latestStatus,
    'Order id': orderId,
    Source: source,
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

export function DiagnosticItemSearched(
  currentPatient: any,
  keyword: string,
  results: searchDiagnosticsByCityID_searchDiagnosticsByCityID_diagnostics[]
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ITEM_SEARCHED] = {
    ...getPatientAttributes,
    'Keyword Entered': keyword,
    '# Results appeared': results?.length,
    Popular: keyword == '' ? 'Yes' : 'No',
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ITEM_SEARCHED, eventAttributes);
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

export function DiagnosticOrderSummaryViewed(
  amount: string | number,
  orderId: string,
  status: string
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_ORDER_SUMMARY_VIEWED] = {
    'Order amount': amount,
    'Order id': orderId,
    'Order status': status,
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_ORDER_SUMMARY_VIEWED, eventAttributes);
}

export function DiagnosticAddTestClicked(orderId: string, currentPatient: any, status: string) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSITC_MODIFY_CLICKED] = {
    'Order id': orderId,
    UHID: currentPatient?.uhid,
    'Order status': status,
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSITC_MODIFY_CLICKED, eventAttributes);
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
  action: 'View Report' | 'Download Report PDF' | 'Share on Whatsapp' | 'Copy Link to PDF',
  orderId?: string
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_VIEW_REPORT_CLICKED] = {
    Source: source,
    'Report generated': reportGenerated,
    'Action taken': action,
  };
  if (!!orderId) {
    eventAttributes['Order id'] = orderId;
  }
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_VIEW_REPORT_CLICKED, eventAttributes);
}

export function DiagnosticTrackPhleboClicked(
  orderId: string | number,
  source: 'Home' | 'My Order' | 'Track Order' | 'Order Summary',
  currentPatient: any,
  isOpen: 'Yes' | 'No'
) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_TRACK_PHLEBO_CLICKED] = {
    'Order id': orderId,
    Source: source,
    UHID: currentPatient?.uhid,
    'Link opened': isOpen,
  };
  postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_TRACK_PHLEBO_CLICKED, eventAttributes);
}

export function DiagnosticUserPaymentAborted(currentPatient: any, orderId: string) {
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIGNOSTIC_PAYMENT_ABORTED] = {
    'Order id': orderId,
    UHID: currentPatient?.uhid,
  };
  postWebEngageEvent(WebEngageEventName.DIGNOSTIC_PAYMENT_ABORTED, eventAttributes);
}
