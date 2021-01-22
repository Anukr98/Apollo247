import moment from 'moment';
import {
  g,
  postAppsFlyerEvent,
  postFirebaseEvent,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import { AppsFlyerEventName } from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';

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
  isServiceable: string | undefined
) {
  const getPatientAttributes = createPatientAttributes(currentPatient);
  const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_LANDING_PAGE_VIEWED] = {
    ...getPatientAttributes,
    Serviceability: isServiceable === 'true' ? 'Yes' : 'No',
  };
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
  source: 'Home page' | 'Full search' | 'Details page' | 'Partial search',
  section?: 'Featured tests' | 'Browse packages'
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
