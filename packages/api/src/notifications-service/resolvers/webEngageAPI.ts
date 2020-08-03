import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { NotificationsServiceContext } from 'notifications-service/NotificationsServiceContext';
import { WebEngageEvent, WebEngageResponse, postEvent, WebEngageInput } from 'helpers/webEngage';
import { ConsultMode, Doctor } from 'doctors-service/entities';
import { ApiConstants } from 'ApiConstants';
import { isMobileNumberValid } from '@aph/universal/dist/aphValidators';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import {
  RescheduleAppointmentDetails,
  TRANSFER_INITIATED_TYPE,
  TRANSFER_STATUS,
  Appointment,
  STATUS,
  REQUEST_ROLES,
  AppointmentCallDetails,
} from 'consults-service/entities';
import { getConnection } from 'typeorm';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

export const webEngageTypeDefs = gql`
  enum WebEngageEvent {
    DOCTOR_IN_CHAT_WINDOW
    DOCTOR_LEFT_CHAT_WINDOW
    DOCTOR_SENT_MESSAGE
  }
  enum ConsultMode {
    ONLINE
    PHYSICAL
    BOTH
  }

  input DoctorConsultEventInput {
    mobileNumber: String!
    eventName: WebEngageEvent!
    consultID: ID!
    displayId: String!
    consultMode: ConsultMode!
    doctorFullName: String!
  }

  type WebEngageResponseData {
    status: String!
  }

  type WebEngageResponse {
    response: WebEngageResponseData!
  }

  extend type Mutation {
    postDoctorConsultEvent(doctorConsultEventInput: DoctorConsultEventInput): WebEngageResponse
  }
`;

type DoctorConsultEventInput = {
  mobileNumber: string;
  eventName: WebEngageEvent;
  consultID: string;
  displayId: string;
  consultMode: ConsultMode;
  doctorFullName: string;
};

type DoctorConsultEventInputArgs = { doctorConsultEventInput: DoctorConsultEventInput };

const postDoctorConsultEvent: Resolver<
  null,
  DoctorConsultEventInputArgs,
  NotificationsServiceContext,
  WebEngageResponse
> = async (parent, { doctorConsultEventInput }) => {
  if (!isMobileNumberValid(doctorConsultEventInput.mobileNumber))
    throw new AphError(AphErrorMessages.INVALID_MOBILE_NUMBER);

  let eventName;
  switch (doctorConsultEventInput.eventName) {
    case WebEngageEvent.DOCTOR_IN_CHAT_WINDOW:
      eventName = ApiConstants.DOCTOR_IN_CHAT_WINDOW_EVENT_NAME.toString();
      break;
    case WebEngageEvent.DOCTOR_LEFT_CHAT_WINDOW:
      eventName = ApiConstants.DOCTOR_LEFT_CHAT_WINDOW_EVENT_NAME.toString();
      break;
    case WebEngageEvent.DOCTOR_SENT_MESSAGE:
      eventName = ApiConstants.DOCTOR_SENT_MESSAGE_EVENT_NAME.toString();
      break;
  }

  const postBody: Partial<WebEngageInput> = {
    userId: doctorConsultEventInput.mobileNumber,
    eventName: eventName,
    eventData: {
      consultID: doctorConsultEventInput.consultID,
      displayID: doctorConsultEventInput.displayId,
      consultMode: doctorConsultEventInput.consultMode,
      doctorName: doctorConsultEventInput.doctorFullName,
    },
  };
  return await postEvent(postBody);
};

export async function trackWebEngageEventForDoctorReschedules(
  rescheduleDetails: RescheduleAppointmentDetails
) {
  if (
    rescheduleDetails.rescheduleInitiatedBy === TRANSFER_INITIATED_TYPE.DOCTOR &&
    rescheduleDetails.rescheduleStatus === TRANSFER_STATUS.INITIATED
  ) {
    const appointmentDetails = rescheduleDetails.appointment;
    //get doctor details
    const doctorsDb = getConnection('doctors-db');
    const doctorRepo = doctorsDb.getRepository(Doctor);
    const doctorDetails = await doctorRepo.findOne({
      select: ['fullName'],
      where: { id: appointmentDetails.doctorId },
    });
    //get patient details
    const patientsDb = getConnection('patients-db');
    const patientRepo = patientsDb.getCustomRepository(PatientRepository);
    const patientDetails = await patientRepo.findByIdWithRelations(
      appointmentDetails.patientId,
      []
    );
    const postBody: Partial<WebEngageInput> = {
      userId: patientDetails ? patientDetails.mobileNumber : '',
      eventName: ApiConstants.DOCTOR_INITATED_RESCHEDULE_EVENT_NAME.toString(),
      eventData: {
        consultID: appointmentDetails.id,
        displayID: appointmentDetails.displayId.toString(),
        consultMode: appointmentDetails.appointmentType.toString(),
        doctorName: doctorDetails ? doctorDetails.fullName : '',
      },
    };
    return await postEvent(postBody);
  }
}

export async function trackWebEngageEventForDoctorCancellation(appointmentDetails: Appointment) {
  if (
    appointmentDetails.status === STATUS.CANCELLED &&
    (appointmentDetails.cancelledBy === REQUEST_ROLES.DOCTOR ||
      appointmentDetails.cancelledBy === REQUEST_ROLES.JUNIOR)
  ) {
    //get doctor details
    const doctorsDb = getConnection('doctors-db');
    const doctorRepo = doctorsDb.getRepository(Doctor);
    const doctorDetails = await doctorRepo.findOne({
      select: ['fullName'],
      where: { id: appointmentDetails.doctorId },
    });
    //get patient details
    const patientsDb = getConnection('patients-db');
    const patientRepo = patientsDb.getCustomRepository(PatientRepository);
    const patientDetails = await patientRepo.findByIdWithRelations(
      appointmentDetails.patientId,
      []
    );
    const eventName =
      appointmentDetails.cancelledBy === REQUEST_ROLES.DOCTOR
        ? ApiConstants.SD_CANCELLED_CONSULT_EVENT_NAME.toString()
        : ApiConstants.JD_CANCELLED_CONSULT_EVENT_NAME.toString();
    const postBody: Partial<WebEngageInput> = {
      userId: patientDetails ? patientDetails.mobileNumber : '',
      eventName: eventName,
      eventData: {
        consultID: appointmentDetails.id,
        displayID: appointmentDetails.displayId.toString(),
        consultMode: appointmentDetails.appointmentType.toString(),
        doctorName: doctorDetails ? doctorDetails.fullName : '',
      },
    };
    return await postEvent(postBody);
  }
}

export enum APPT_CALL_TYPE {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  CHAT = 'CHAT',
}

export enum DOCTOR_CALL_TYPE {
  SENIOR = 'SENIOR',
  JUNIOR = 'JUNIOR',
}

export async function trackWebEngageEventForDoctorCallInitiation(
  appointmentCallData: AppointmentCallDetails
) {
  const juniorDoctorType = DOCTOR_CALL_TYPE.JUNIOR.toString();
  const callType = appointmentCallData.callType;
  if (
    appointmentCallData.doctorType == juniorDoctorType ||
    callType == APPT_CALL_TYPE.CHAT.toString()
  )
    return '';

  const appointmentDetails = appointmentCallData.appointment;

  //get doctor details
  const doctorsDb = getConnection('doctors-db');
  const doctorRepo = doctorsDb.getRepository(Doctor);
  const doctorDetails = await doctorRepo.findOne({
    select: ['fullName'],
    where: { id: appointmentDetails.doctorId },
  });

  //get patient details
  const patientsDb = getConnection('patients-db');
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.findByIdWithRelations(appointmentDetails.patientId, []);

  let eventName = '';
  switch (callType) {
    case APPT_CALL_TYPE.AUDIO.toString():
      eventName = ApiConstants.DOCTOR_INITIATED_AUDIO_CALL_EVENT_NAME.toString();
      break;
    case APPT_CALL_TYPE.VIDEO.toString():
      eventName = ApiConstants.DOCTOR_INITIATED_VIDEO_CALL_EVENT_NAME.toString();
      break;
  }

  const postBody: Partial<WebEngageInput> = {
    userId: patientDetails ? patientDetails.mobileNumber : '',
    eventName: eventName,
    eventData: {
      consultID: appointmentDetails.id,
      displayID: appointmentDetails.displayId.toString(),
      consultMode: appointmentDetails.appointmentType.toString(),
      doctorName: doctorDetails ? doctorDetails.fullName : '',
    },
  };

  return await postEvent(postBody);
}

export const webEngageResolvers = {
  Mutation: {
    postDoctorConsultEvent,
  },
};
