import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { g, postWebEngageEvent } from '@aph/mobile-patients/src//helpers/helperFunctions';
import moment from 'moment';
import { Platform } from 'react-native';

export const userLocationConsultWEBEngage = (
  currentPatient: any,
  location: any,
  screen: string,
  type: 'Auto Detect' | 'Manual entry',
  doctorDetails?: any,
  changeLocation?: boolean
) => {
  const eventAttributes: WebEngageEvents[WebEngageEventName.USER_LOCATION_CONSULT] = {
    'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
    'Patient UHID': g(currentPatient, 'uhid'),
    Relation: g(currentPatient, 'relation'),
    'Patient Age': Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
    'Patient Gender': g(currentPatient, 'gender'),
    'Mobile Number': g(currentPatient, 'mobileNumber'),
    'Customer ID': g(currentPatient, 'id'),
    'User location': location,
    Screen: screen,
    Platform: 'App',
    'Doctor details': doctorDetails,
    Type: type,
  };
  if (changeLocation) {
    postWebEngageEvent(WebEngageEventName.USER_CHANGED_LOCATION, eventAttributes);
  } else {
    postWebEngageEvent(WebEngageEventName.USER_LOCATION_CONSULT, eventAttributes);
  }
};
