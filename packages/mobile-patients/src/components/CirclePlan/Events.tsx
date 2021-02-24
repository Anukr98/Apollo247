import { Platform } from 'react-native';
import {
  g,
  postWebEngageEvent,
  setCircleMembershipType,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import moment from 'moment';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import string from '@aph/mobile-patients/src/strings/strings.json';

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