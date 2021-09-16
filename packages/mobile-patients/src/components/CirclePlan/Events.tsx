import { Platform } from 'react-native';
import {
  CircleEventSource,
  g,
  getCircleNoSubscriptionText,
  getUserType,
  postCleverTapEvent,
  postWebEngageEvent,
  setCircleMembershipType,
  postAppsFlyerEvent,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import moment from 'moment';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  AppsFlyerEvents,
  AppsFlyerEventName,
  CircleNavigationSource,
} from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';

export const postCircleWEGEvent = (
  currentPatient: any,
  membershipState: 'Expired' | 'About to Expire' | 'Not Expiring',
  action: any,
  circlePlanValidity: any,
  circleSubscriptionId: string | boolean,
  source?: string,
  paymentType?: 'Direct Payment' | 'Direct by HC'
) => {
  const circleMembershipType = setCircleMembershipType(
    circlePlanValidity?.startDate!,
    circlePlanValidity?.endDate!
  );

  const eventAttributes: WebEngageEvents[
    | WebEngageEventName.CIRCLE_BENIFIT_CLICKED
    | WebEngageEventName.CIRCLE_MEMBERSHIP_RENEWED] = {
    'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
    'Patient UHID': g(currentPatient, 'uhid'),
    Relation: g(currentPatient, 'relation'),
    'Patient Age': Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
    'Patient Gender': g(currentPatient, 'gender'),
    'Mobile Number': g(currentPatient, 'mobileNumber'),
    'Customer ID': g(currentPatient, 'id'),
    'Circle Member': circleSubscriptionId ? 'Yes' : 'No',
    'Circle Plan': circleMembershipType,
    'Circle Start Date': circlePlanValidity?.startDate!,
    'Circle End Date': circlePlanValidity?.endDate!,
    Source: source || 'Homepage',
    Platform: Platform.OS,
    'Membership State': membershipState,
  };
  if (action === 'renew') {
    postWebEngageEvent(WebEngageEventName.CIRCLE_RENEW_NOW_CLICKED, eventAttributes);
  } else if (action === 'renewed') {
    const renewedAttributes = {
      ...eventAttributes,
      Type: paymentType,
    };
    postWebEngageEvent(WebEngageEventName.CIRCLE_MEMBERSHIP_RENEWED, renewedAttributes);
  } else if (action === 'viewed') {
    const renewedAttributes = {
      ...eventAttributes,
      'Platform Device': Platform.OS,
    };
    postWebEngageEvent(WebEngageEventName.CIRCLE_MEMBERSHIP_DETAILS_VIEWED, renewedAttributes);
  } else if (
    action?.cta_action === string.Hdfc_values.MEMBERSHIP_DETAIL_CIRCLE ||
    action === string.Hdfc_values.MEMBERSHIP_DETAIL_CIRCLE
  ) {
    // view more benefits cta
    postWebEngageEvent(WebEngageEventName.CIRCLE_VIEW_BENEFITS_CLICKED, eventAttributes);
  } else {
    postWebEngageEvent(WebEngageEventName.CIRCLE_BENIFIT_CLICKED, eventAttributes);
  }
};

export const postAppsFlyerCircleAddRemoveCartEvent = (
  membershipPlan: any,
  source: CircleNavigationSource,
  action: 'add' | 'remove',
  currentPatient: any
) => {
  const eventAttributes: AppsFlyerEvents[AppsFlyerEventName.CIRCLE_ADD_TO_CART] = {
    userId: currentPatient?.mobileNumber,
    navigation_source: source,
    price: membershipPlan?.currentSellingPrice,
    duration_in_month: membershipPlan?.durationInMonth,
    circle_plan_id: membershipPlan?.subPlanId,
    corporate_name: currentPatient?.partnerId,
    af_currency: 'INR',
    af_revenue: membershipPlan?.currentSellingPrice,
    special_price_enabled:
      membershipPlan?.price - membershipPlan?.currentSellingPrice <= 0 ? 'No' : 'Yes',
  };
  if (action == 'add') {
    postAppsFlyerEvent(AppsFlyerEventName.CIRCLE_ADD_TO_CART, eventAttributes);
  } else {
    postAppsFlyerEvent(AppsFlyerEventName.CIRCLE_REMOVE_FROM_CART, eventAttributes);
  }
};

export const fireCirclePaymentPageViewedEvent = (
  circleData: any,
  circleEventSource: CircleEventSource,
  allCurrentPatients: any,
  currentPatient: any
) => {
  const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.CIRCLE_PAYMENT_PAGE_VIEWED_STANDALONE_CIRCLE_PURCHASE_PAGE] = {
    navigation_source: circleEventSource,
    circle_end_date: getCircleNoSubscriptionText(),
    circle_start_date: getCircleNoSubscriptionText(),
    circle_planid: circleData?.subPlanId,
    customer_id: currentPatient?.id,
    duration_in_month: circleData?.durationInMonth,
    user_type: getUserType(allCurrentPatients),
    price: circleData?.currentSellingPrice,
  };
  postCleverTapEvent(CleverTapEventName.CIRCLE_PLAN_TO_CART, cleverTapEventAttributes);
  postAppsFlyerCircleAddRemoveCartEvent(circleData, circleEventSource, 'add', currentPatient);
  setTimeout(
    () =>
      postCleverTapEvent(
        CleverTapEventName.CIRCLE_PAYMENT_PAGE_VIEWED_STANDALONE_CIRCLE_PURCHASE_PAGE,
        cleverTapEventAttributes
      ),
    1000
  );
};
