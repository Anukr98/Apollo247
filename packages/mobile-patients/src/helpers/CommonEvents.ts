import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  g,
  postWebEngageEvent,
  getUserType,
  postCleverTapEvent,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import moment from 'moment';
import { getPatientPastConsultedDoctors_getPatientPastConsultedDoctors } from '@aph/mobile-patients/src/graphql/types/getPatientPastConsultedDoctors';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';

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

export const consultUserLocationCleverTapEvents = (
  currentPatient: any,
  location: any,
  screen: 'Payment confirmation screen' | 'Doctor listing screen',
  type: 'Auto Detect' | 'Manual entry',
  doctorDetails?: any,
  changeLocation?: boolean
) => {
  const eventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_USER_LOCATION] = {
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
    postCleverTapEvent(CleverTapEventName.USER_CHANGED_LOCATION, eventAttributes);
  } else {
    postCleverTapEvent(CleverTapEventName.CONSULT_USER_LOCATION, eventAttributes);
  }
};

export const truecallerWEBEngage = (
  currentPatient: any,
  action: 'login' | 'sdk error' | 'login error',
  errorAttributes?: any,
  allCurrentPatients?: any
) => {
  if (currentPatient) {
    const eventAttributes:
      | WebEngageEvents[WebEngageEventName.USER_LOGGED_IN_WITH_TRUECALLER]
      | CleverTapEvents[CleverTapEventName.USER_LOGGED_IN_WITH_TRUECALLER] = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid') || undefined,
      Relation: g(currentPatient, 'relation') || undefined,
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender') || undefined,
      'Mobile Number': g(currentPatient, 'mobileNumber') || undefined,
      'Customer ID': g(currentPatient, 'id'),
      User_Type: allCurrentPatients ? getUserType(allCurrentPatients) : undefined,
    };
    if (action === 'login') {
      postWebEngageEvent(WebEngageEventName.USER_LOGGED_IN_WITH_TRUECALLER, eventAttributes);
      postCleverTapEvent(CleverTapEventName.USER_LOGGED_IN_WITH_TRUECALLER, eventAttributes);
    }
  } else {
    if (action === 'sdk error') {
      postWebEngageEvent(WebEngageEventName.TRUECALLER_EVENT_ERRORS, errorAttributes);
      postCleverTapEvent(CleverTapEventName.TRUECALLER_EVENT_ERRORS, errorAttributes);
    } else {
      postWebEngageEvent(WebEngageEventName.TRUECALLER_APOLLO247_LOGIN_ERRORS, errorAttributes);
      postCleverTapEvent(CleverTapEventName.TRUECALLER_APOLLO247_LOGIN_ERRORS, errorAttributes);
    }
  }
};

export const myConsultedDoctorsClickedWEBEngage = (
  currentPatient: any,
  doctor: getPatientPastConsultedDoctors_getPatientPastConsultedDoctors,
  allCurrentPatients: any,
  pageName: string,
) => {
  const eventAttributes:
    | WebEngageEvents[WebEngageEventName.MY_CONSULTED_DOCTORS_CLICKED]
    | CleverTapEvents[CleverTapEventName.CONSULT_MY_DOCTOR_CLICKED] = {
    'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
    'Patient UHID': g(currentPatient, 'uhid'),
    Relation: g(currentPatient, 'relation'),
    'Patient Age': Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
    'Patient Gender': g(currentPatient, 'gender'),
    'Mobile Number': g(currentPatient, 'mobileNumber'),
    'Customer ID': g(currentPatient, 'id'),
    User_Type: getUserType(allCurrentPatients),
    'Doctor Name': doctor?.fullName || '',
    'Doctor Id': doctor?.id,
    'Doctor Speciality': doctor?.specialty?.name,
    'Page Name': pageName,
    'Nav src': pageName === 'Home Screen' ? 'homepage bar' : 'Bottom bar',
    'Previous consult Details': {
      'Consult Date & Time': doctor?.consultDetails?.consultDateTime || '',
      'Display ID': doctor?.consultDetails?.displayId || '',
      'Appointment Id': doctor?.consultDetails?.appointmentId || '',
      'Hospital Id': doctor?.consultDetails?.hospitalId || '',
      'Hospital Name': doctor?.consultDetails?.hospitalName || '',
      _247_Flag: doctor?.consultDetails?._247_Flag || undefined,
      'Consult Mode': doctor?.consultDetails?.consultMode || '',
    },
  };
  postWebEngageEvent(WebEngageEventName.MY_CONSULTED_DOCTORS_CLICKED, eventAttributes);
  postCleverTapEvent(CleverTapEventName.CONSULT_MY_DOCTOR_CLICKED, eventAttributes);
};
