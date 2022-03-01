import { PharmaUserStatus } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { OfferBannerSection } from '@aph/mobile-patients/src/helpers/apiCalls';
import { AppsFlyerEventName } from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import {
  getAge,
  postAppsFlyerEvent,
  postCleverTapEvent,
  postFirebaseEvent,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import moment from 'moment';

export const postwebEngageCategoryClickedEvent = (
  categoryId: string,
  categoryName: string,
  sectionName: string,
  source: WebEngageEvents[WebEngageEventName.CATEGORY_CLICKED]['Source']
) => {
  try {
    const eventAttributes: WebEngageEvents[WebEngageEventName.CATEGORY_CLICKED] = {
      'category name': categoryName,
      'category ID': categoryId,
      'Section Name': sectionName,
      Source: source,
    };
    postWebEngageEvent(WebEngageEventName.CATEGORY_CLICKED, eventAttributes);
    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_CATEGORY_VIEWED] = {
      'Category name': categoryName || undefined,
      'Category ID': categoryId || undefined,
      'Section name': sectionName || undefined,
      'Nav src': source,
    };
    postCleverTapEvent(CleverTapEventName.PHARMACY_CATEGORY_VIEWED, cleverTapEventAttributes);
    postAppsFlyerEvent(AppsFlyerEventName.CATEGORY_CLICKED, eventAttributes);

    const firebaseEventAttributes: FirebaseEvents[FirebaseEventName.CATEGORY_CLICKED] = {
      categoryname: categoryName,
      categoryID: categoryId,
      Source: 'Home', // Home
      SectionName: sectionName,
    };
    postFirebaseEvent(FirebaseEventName.CATEGORY_CLICKED, firebaseEventAttributes);
  } catch (e) {}
};

export const WebEngageEventAutoDetectLocation = (
  pincode: string,
  serviceable: boolean,
  currentPatient: any
) => {
  try {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_AUTO_SELECT_LOCATION_CLICKED] = {
      'Patient UHID': currentPatient?.uhid,
      'Mobile Number': currentPatient?.mobileNumber,
      'Customer ID': currentPatient?.id,
      pincode: pincode,
      Serviceability: serviceable,
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_AUTO_SELECT_LOCATION_CLICKED, eventAttributes);
  } catch (e) {}
};

export const webEngageDeliveryPincodeEntered = (
  pincode: string,
  serviceable: boolean,
  currentPatient: any
) => {
  try {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_ENTER_DELIVERY_PINCODE_SUBMITTED] = {
      'Patient UHID': currentPatient?.uhid,
      'Mobile Number': currentPatient?.mobileNumber,
      'Customer ID': currentPatient?.id,
      Serviceable: serviceable ? 'true' : 'false',
      Keyword: pincode,
      Source: 'Pharmacy Home',
    };
    postWebEngageEvent(
      WebEngageEventName.PHARMACY_ENTER_DELIVERY_PINCODE_SUBMITTED,
      eventAttributes
    );
  } catch (e) {}
};

export const CleverTapEventAutoDetectLocation = (
  pincode: string,
  serviceable: boolean,
  currentPatient: any
) => {
  try {
    const eventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_ENTER_DELIVERY_PINCODE_SUBMITTED] = {
      'Patient UHID': currentPatient?.uhid,
      'Mobile number': currentPatient?.mobileNumber,
      'Customer ID': currentPatient?.id,
      Serviceability: serviceable ? 'true' : 'false',
      Pincode: pincode,
      'Nav src': 'Pharmacy Home',
      'Auto selected': 'Yes',
    };
    postCleverTapEvent(
      CleverTapEventName.PHARMACY_ENTER_DELIVERY_PINCODE_SUBMITTED,
      eventAttributes
    );
  } catch (e) {}
};

export const CleverTapDeliveryPincodeEntered = (
  pincode: string,
  serviceable: boolean,
  currentPatient: any
) => {
  try {
    const eventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_ENTER_DELIVERY_PINCODE_SUBMITTED] = {
      'Patient UHID': currentPatient?.uhid,
      'Mobile number': currentPatient?.mobileNumber,
      'Customer ID': currentPatient?.id,
      Serviceability: serviceable ? 'true' : 'false',
      Pincode: pincode,
      'Nav src': 'Pharmacy Home',
      'Auto selected': 'No',
    };
    postCleverTapEvent(
      CleverTapEventName.PHARMACY_ENTER_DELIVERY_PINCODE_SUBMITTED,
      eventAttributes
    );
  } catch (e) {}
};

export const cleverTapEventForHomeIconClick = (
  currentPatient: any,
  userType: string,
  cartCircleSubscriptionId: string
) => {
  try {
    const eventAttributes = {
      'Patient name': `${currentPatient?.firstName} ${currentPatient?.lastName}`,
      'Patient UHID': currentPatient?.uhid,
      Relation: currentPatient?.relation,
      'Patient age': Math.round(moment().diff(currentPatient?.dateOfBirth || 0, 'years', true)),
      'Patient gender': currentPatient?.gender,
      'Mobile Number': currentPatient?.mobileNumber,
      'Customer ID': currentPatient?.id,
      User_Type: userType,
      'Page name': 'Medicine page',
      'Circle Member': cartCircleSubscriptionId ? 'True' : 'False',
    };
    postCleverTapEvent(CleverTapEventName.HOME_ICON_CLICKED, eventAttributes);
  } catch (e) {}
};

export const calltheNearestPharmacyEvent = (pharmacyPincode: string, currentPatient: any) => {
  try {
    let eventAttributes: WebEngageEvents[WebEngageEventName.CALL_THE_NEAREST_PHARMACY] = {
      pincode: pharmacyPincode || '',
      'Mobile Number': currentPatient?.mobileNumber,
    };
    postWebEngageEvent(WebEngageEventName.CALL_THE_NEAREST_PHARMACY, eventAttributes);
  } catch (e) {}
};

export const bannerClickEvent = (slideIndex: number, item: OfferBannerSection) => {
  try {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_BANNER_CLICK] = {
      BannerPosition: slideIndex + 1,
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_BANNER_CLICK, eventAttributes);
    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_HOME_PAGE_BANNER] = {
      'Nav src': 'Home Page',
      'Banner position': slideIndex + 1,
      Name: item?.name,
      'IP ID': item?.ip_id,
      'IP section name': item?.ip_section_name,
    };
    postCleverTapEvent(CleverTapEventName.PHARMACY_HOME_PAGE_BANNER, cleverTapEventAttributes);
  } catch (e) {}
};

export const uploadPrescriptionClickedEvent = (
  pharmacyUserType: PharmaUserStatus,
  currentPatient: any
) => {
  try {
    const eventAttributes: WebEngageEvents[WebEngageEventName.UPLOAD_PRESCRIPTION_CLICKED] = {
      Source: 'Home',
      User_Type: pharmacyUserType,
    };
    postWebEngageEvent(WebEngageEventName.UPLOAD_PRESCRIPTION_CLICKED, eventAttributes);
    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.PHARMACY_UPLOAD_PRESCRIPTION_CLICKED] = {
      'Nav src': 'Home',
      'User type': pharmacyUserType,
      patient_name: currentPatient?.firstName,
      patient_uhid: currentPatient?.uhid,
      relation: currentPatient?.relation,
      gender: currentPatient?.gender,
      mobile_number: currentPatient?.mobileNumber,
      age: moment().year() - moment(currentPatient?.dateOfBirth).year(),
      customerId: currentPatient?.id,
    };
    postCleverTapEvent(
      CleverTapEventName.PHARMACY_UPLOAD_PRESCRIPTION_CLICKED,
      cleverTapEventAttributes
    );
  } catch (e) {}
};

export const searchSuggestionEvent = (
  _searchText: string,
  length: number,
  pharmacyUserType: PharmaUserStatus
) => {
  try {
    const eventAttributes: WebEngageEvents[WebEngageEventName.SEARCH] = {
      keyword: _searchText,
      Source: 'Pharmacy Home',
      resultsdisplayed: length,
      User_Type: pharmacyUserType,
    };
    postWebEngageEvent(WebEngageEventName.SEARCH, eventAttributes);
  } catch (e) {}
};

export const searchSuccessEvent = (
  searchText: string,
  queryName: string,
  index: number,
  status: string,
  availability?: boolean,
  position?: number,
  medicineLength?: number,
  sku?: string,
  name?: string,
  discountPercentage?: string
) => {
  try {
    const cleverTapSearchSuccessEventAttributes = {
      'Nav src': 'Pharmacy Home',
      Status: status,
      Keyword: searchText,
      'Suggested keyword': queryName,
      Position: index + 1,
      'Suggested keyword position': index + 1,
      Source: 'Partial search',
      ...(position ? { 'Product position': index + 1 - (position || 0) } : {}),
      ...(availability === true || availability === false
        ? { 'Product availability': availability ? 'Is in stock' : 'Out of stock' }
        : {}),
      ...((medicineLength || 0) > 0 ? { 'Results shown': medicineLength } : {}),
      ...(sku ? { 'SKU ID': sku } : {}),
      ...(name ? { 'Product name': name } : {}),
      ...(discountPercentage ? { Discount: discountPercentage } : {}),
    };
    postCleverTapEvent(
      CleverTapEventName.PHARMACY_SEARCH_SUCCESS,
      cleverTapSearchSuccessEventAttributes
    );
  } catch (e) {}
};

export const pharmacyScrollScreenEvent = (
  pharmacyUserType: string,
  currentPatient: any,
  cartCircleSubscriptionId: string,
  navSrc: string,
  scrolls: number
) => {
  try {
    const eventAttributes: CleverTapEvents[CleverTapEventName.SCREEN_SCROLLED] = {
      User_Type: pharmacyUserType,
      'Patient Name': currentPatient?.firstName,
      'Patient UHID': currentPatient?.uhid,
      'Patient age': getAge(currentPatient?.dateOfBirth),
      'Circle Member': cartCircleSubscriptionId ? 'True' : 'False',
      'Customer ID': currentPatient?.id,
      'Patient gender': currentPatient?.gender,
      'Mobile number': currentPatient?.mobileNumber,
      'Page name': 'medicine page',
      'Nav src': navSrc || '',
      Scrolls: scrolls,
    };
    postCleverTapEvent(CleverTapEventName.SCREEN_SCROLLED, eventAttributes);
  } catch (e) {}
};
