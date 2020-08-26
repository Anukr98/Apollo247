import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';

import { AppointmentsSessionRepository } from 'consults-service/repositories/appointmentsSessionRepository';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import {
  STATUS,
  REQUEST_ROLES,
  TRANSFER_INITIATED_TYPE,
  RescheduleAppointmentDetails,
  TRANSFER_STATUS,
  APPOINTMENT_STATE,
  AppointmentNoShow,
  CASESHEET_STATUS,
  DEVICETYPE,
  BOOKINGSOURCE,
  AppointmentCallDetails,
  APPOINTMENT_UPDATED_BY,
  AppointmentUpdateHistory,
  VALUE_TYPE,
} from 'consults-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { JuniorAppointmentsSessionRepository } from 'consults-service/repositories/juniorAppointmentsSessionRepository';
import { sendNotification, sendNotificationSMS } from 'notifications-service/handlers';

import {
  NotificationType,
  APPT_CALL_TYPE,
  DOCTOR_CALL_TYPE,
} from 'notifications-service/constants';
import { RescheduleAppointmentRepository } from 'consults-service/repositories/rescheduleAppointmentRepository';
import { AppointmentCallDetailsRepository } from 'consults-service/repositories/appointmentCallDetailsRepository';
import { AppointmentNoShowRepository } from 'consults-service/repositories/appointmentNoShowRepository';
import { AdminDoctorMap } from 'doctors-service/repositories/adminDoctorRepository';
import { sendMail } from 'notifications-service/resolvers/email';
import { cancellationEmailTemplate } from 'helpers/emailTemplates/cancellationEmailTemplate';
import { EmailMessage } from 'types/notificationMessageTypes';
import { ApiConstants } from 'ApiConstants';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { FacilityRepository } from 'doctors-service/repositories/facilityRepository';
import { addMilliseconds, format, isAfter } from 'date-fns';
import { getSessionToken, getExpirationTime } from 'helpers/openTok';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { WebEngageInput, postEvent } from 'helpers/webEngage';

export const createAppointmentSessionTypeDefs = gql`
  enum REQUEST_ROLES {
    DOCTOR
    PATIENT
    JUNIOR
    ADMIN
    SYSTEM
  }

  type AppointmentSession {
    sessionId: String!
    appointmentToken: String!
  }

  type CreateAppointmentSession {
    sessionId: String!
    appointmentToken: String!
    doctorId: ID!
    patientId: ID!
    appointmentDateTime: DateTime!
  }

  type CreateJuniorAppointmentSession {
    sessionId: String!
    appointmentToken: String!
  }

  input CreateAppointmentSessionInput {
    appointmentId: ID!
    requestRole: REQUEST_ROLES!
  }

  input UpdateAppointmentSessionInput {
    appointmentId: ID!
    requestRole: String!
  }

  input EndAppointmentSessionInput {
    appointmentId: ID!
    status: STATUS!
    noShowBy: REQUEST_ROLES
    deviceType: DEVICETYPE
    callSource: BOOKINGSOURCE
    callType: APPT_CALL_TYPE
    appVersion: String
  }

  extend type Mutation {
    createJuniorAppointmentSession(
      createAppointmentSessionInput: CreateAppointmentSessionInput
    ): CreateJuniorAppointmentSession!
    createAppointmentSession(
      createAppointmentSessionInput: CreateAppointmentSessionInput
    ): CreateAppointmentSession!
    updateAppointmentSession(
      updateAppointmentSessionInput: UpdateAppointmentSessionInput
    ): AppointmentSession!
    endAppointmentSession(endAppointmentSessionInput: EndAppointmentSessionInput): Boolean!
  }
`;

type AppointmentSession = {
  sessionId: string;
  appointmentToken: string;
};

type CreateAppointmentSession = {
  sessionId: string;
  appointmentToken: string;
  doctorId: string;
  patientId: string;
  appointmentDateTime: Date;
};

type CreateJuniorAppointmentSession = {
  sessionId: string;
  appointmentToken: string;
};

type CreateAppointmentSessionInput = {
  appointmentId: string;
  requestRole: String;
};

type UpdateAppointmentSessionInput = {
  appointmentId: string;
  requestRole: String;
};

type createAppointmentSessionInputArgs = {
  createAppointmentSessionInput: CreateAppointmentSessionInput;
};

type updateAppointmentSessionInputArgs = {
  updateAppointmentSessionInput: UpdateAppointmentSessionInput;
};

type endAppointmentSessionInputArgs = {
  endAppointmentSessionInput: EndAppointmentSessionInput;
};

type EndAppointmentSessionInput = {
  appointmentId: string;
  status: STATUS;
  noShowBy: REQUEST_ROLES;
  deviceType: DEVICETYPE;
  callSource: BOOKINGSOURCE;
  callType: APPT_CALL_TYPE;
  appVersion: string;
};

const createJuniorAppointmentSession: Resolver<
  null,
  createAppointmentSessionInputArgs,
  ConsultServiceContext,
  CreateJuniorAppointmentSession
> = async (parent, { createAppointmentSessionInput }, { consultsDb, patientsDb, doctorsDb }) => {
  if (!process.env.OPENTOK_KEY && !process.env.OPENTOK_SECRET) {
    throw new AphError(AphErrorMessages.INVALID_OPENTOK_KEYS);
  }

  if (createAppointmentSessionInput.requestRole != REQUEST_ROLES.JUNIOR) {
    throw new AphError(AphErrorMessages.INVALID_REQUEST_ROLE);
  }
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const apptDetails = await apptRepo.findById(createAppointmentSessionInput.appointmentId);
  if (apptDetails == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);
  if (apptDetails.status == STATUS.CANCELLED || apptDetails.status == STATUS.COMPLETED) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);
  }
  const juniorApptSessionRepo = consultsDb.getCustomRepository(JuniorAppointmentsSessionRepository);
  const apptSessionDets = await juniorApptSessionRepo.getJuniorAppointmentSession(
    createAppointmentSessionInput.appointmentId
  );

  if (apptSessionDets) {
    // send notification
    const pushNotificationInput = {
      appointmentId: createAppointmentSessionInput.appointmentId,
      notificationType: NotificationType.INITIATE_JUNIOR_APPT_SESSION,
    };
    const notificationResult = await sendNotification(
      pushNotificationInput,
      patientsDb,
      consultsDb,
      doctorsDb
    );
    console.log(notificationResult, 'notificationResult');
    return {
      sessionId: apptSessionDets.sessionId,
      appointmentToken: apptSessionDets.juniorDoctorToken,
    };
  }
  const tokenDetails = await getSessionToken('');
  const sessionId = tokenDetails.sessionId;
  const token = tokenDetails.token;

  const appointmentSessionAttrs = {
    sessionId,
    juniorDoctorToken: token,
    appointment: apptDetails,
    consultStartDateTime: new Date(),
  };
  await juniorApptSessionRepo.saveJuniorAppointmentSession(appointmentSessionAttrs);
  // send notification
  const pushNotificationInput = {
    appointmentId: createAppointmentSessionInput.appointmentId,
    notificationType: NotificationType.INITIATE_JUNIOR_APPT_SESSION,
  };
  const notificationResult = await sendNotification(
    pushNotificationInput,
    patientsDb,
    consultsDb,
    doctorsDb
  );
  console.log(notificationResult, 'notificationResult');
  const historyAttrs: Partial<AppointmentUpdateHistory> = {
    appointment: apptDetails,
    userType: APPOINTMENT_UPDATED_BY.PATIENT,
    fromValue: STATUS.PENDING,
    toValue: STATUS.PENDING,
    valueType: VALUE_TYPE.STATUS,
    fromState: apptDetails.appointmentState,
    toState: apptDetails.appointmentState,
    userName: apptDetails.doctorId,
    reason: 'JD ' + ApiConstants.APPT_SESSION_HISTORY.toString(),
  };
  apptRepo.saveAppointmentHistory(historyAttrs);
  return {
    sessionId: sessionId,
    appointmentToken: token,
  };
};

const createAppointmentSession: Resolver<
  null,
  createAppointmentSessionInputArgs,
  ConsultServiceContext,
  CreateAppointmentSession
> = async (parent, { createAppointmentSessionInput }, { consultsDb, patientsDb, doctorsDb }) => {
  if (!process.env.OPENTOK_KEY && !process.env.OPENTOK_SECRET) {
    throw new AphError(AphErrorMessages.INVALID_OPENTOK_KEYS);
  }

  let patientId = '',
    doctorId = '';
  let appointmentDateTime: Date = new Date();
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  if (
    createAppointmentSessionInput.requestRole != REQUEST_ROLES.DOCTOR &&
    createAppointmentSessionInput.requestRole != REQUEST_ROLES.JUNIOR
  ) {
    throw new AphError(AphErrorMessages.INVALID_REQUEST_ROLE);
  }

  const apptDetails = await apptRepo.findById(createAppointmentSessionInput.appointmentId);
  if (apptDetails == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientData = await patientRepo.getPatientDetails(apptDetails.patientId);

  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.findDoctorByIdWithoutRelations(apptDetails.doctorId);

  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);

  //post to webengage starts
  const eventName =
    createAppointmentSessionInput.requestRole == REQUEST_ROLES.DOCTOR
      ? ApiConstants.DOCTOR_STARTED_CONSULTATION_EVENT_NAME.toString()
      : ApiConstants.JD_CONSULTATION_STARTED_EVENT_NAME.toString();

  const postBody: Partial<WebEngageInput> = {
    userId: patientData ? patientData.mobileNumber : '',
    eventName: eventName,
    eventData: {
      consultID: apptDetails.id,
      displayID: apptDetails.displayId.toString(),
      consultMode: apptDetails.appointmentType.toString(),
      doctorName: doctorData ? doctorData.fullName : '',
    },
  };
  postEvent(postBody);
  //post to webengage ends

  if (createAppointmentSessionInput.requestRole == REQUEST_ROLES.JUNIOR) {
    const juniorDoctorcaseSheet = await caseSheetRepo.getJDCaseSheetByAppointmentId(apptDetails.id);
    if (juniorDoctorcaseSheet && juniorDoctorcaseSheet.status == CASESHEET_STATUS.COMPLETED) {
      return {
        sessionId: '',
        appointmentToken: '',
        patientId: '',
        doctorId: '',
        appointmentDateTime,
      };
    }
  }

  if (
    apptDetails &&
    (apptDetails.status === STATUS.PENDING || apptDetails.status === STATUS.CONFIRMED)
  ) {
    patientId = apptDetails.patientId;
    doctorId = apptDetails.doctorId;
    appointmentDateTime = apptDetails.appointmentDateTime;
  }
  const apptSessionRepo = consultsDb.getCustomRepository(AppointmentsSessionRepository);
  const apptSessionDets = await apptSessionRepo.getAppointmentSession(
    createAppointmentSessionInput.appointmentId
  );

  const currentDate = new Date();
  if (apptSessionDets) {
    const doctorTokenExpiryDate = apptSessionDets.doctorToken
      ? await getExpirationTime(apptSessionDets.doctorToken)
      : new Date();

    //if today date is greater than the token generated date, regenerate the tokens
    if (isAfter(new Date(), doctorTokenExpiryDate)) {
      const doctorTokenDetails = await getSessionToken(apptSessionDets.sessionId);
      apptSessionDets.doctorToken = doctorTokenDetails.token;

      //update appointment session record
      await apptSessionRepo.updateDoctorToken(doctorTokenDetails.token, apptSessionDets.id);
    }

    if (
      createAppointmentSessionInput.requestRole == REQUEST_ROLES.DOCTOR &&
      apptDetails.status != STATUS.IN_PROGRESS
    ) {
      apptRepo.updateSDAppointmentStatus(
        createAppointmentSessionInput.appointmentId,
        STATUS.IN_PROGRESS,
        true,
        new Date(),
        apptDetails
      );
    }

    // send notification
    const pushNotificationInput = {
      appointmentId: createAppointmentSessionInput.appointmentId,
      notificationType: NotificationType.INITIATE_SENIOR_APPT_SESSION,
    };
    if (createAppointmentSessionInput.requestRole == REQUEST_ROLES.JUNIOR) {
      caseSheetRepo.findAndUpdateJdConsultStatus(createAppointmentSessionInput.appointmentId);
      pushNotificationInput.notificationType = NotificationType.INITIATE_JUNIOR_APPT_SESSION;
    }
    const notificationResult = await sendNotification(
      pushNotificationInput,
      patientsDb,
      consultsDb,
      doctorsDb
    );
    console.log(notificationResult, 'notificationResult');
    if (
      createAppointmentSessionInput.requestRole != REQUEST_ROLES.JUNIOR &&
      currentDate < apptDetails.appointmentDateTime
    ) {
      if (patientData && doctorData) {
        const messageBody = ApiConstants.AUTO_SUBMIT_BY_SD_SMS_TEXT.replace(
          '{0}',
          patientData.firstName
        )
          .replace('{1}', doctorData.firstName)
          .replace('{2}', process.env.SMS_LINK_BOOK_APOINTMENT);
        sendNotificationSMS(patientData.mobileNumber, messageBody);
      }
    }
    return {
      sessionId: apptSessionDets.sessionId,
      appointmentToken: apptSessionDets.doctorToken,
      patientId,
      doctorId,
      appointmentDateTime,
    };
  }

  const tokenDetails = await getSessionToken('');
  const sessionId = tokenDetails.sessionId;
  const token = tokenDetails.token;

  const appointmentSessionAttrs = {
    sessionId,
    doctorToken: token,
    appointment: apptDetails,
    consultStartDateTime: new Date(),
  };
  await apptSessionRepo.saveAppointmentSession(appointmentSessionAttrs);
  if (
    createAppointmentSessionInput.requestRole == REQUEST_ROLES.DOCTOR &&
    apptDetails.status != STATUS.IN_PROGRESS
  ) {
    apptRepo.updateSDAppointmentStatus(
      createAppointmentSessionInput.appointmentId,
      STATUS.IN_PROGRESS,
      true,
      new Date(),
      apptDetails
    );
  }

  // send notification
  const pushNotificationInput = {
    appointmentId: createAppointmentSessionInput.appointmentId,
    notificationType: NotificationType.INITIATE_SENIOR_APPT_SESSION,
  };
  if (createAppointmentSessionInput.requestRole == REQUEST_ROLES.JUNIOR) {
    caseSheetRepo.findAndUpdateJdConsultStatus(createAppointmentSessionInput.appointmentId);
    pushNotificationInput.notificationType = NotificationType.INITIATE_JUNIOR_APPT_SESSION;
  }
  const notificationResult = await sendNotification(
    pushNotificationInput,
    patientsDb,
    consultsDb,
    doctorsDb
  );
  console.log(notificationResult, 'notificationResult');

  if (
    createAppointmentSessionInput.requestRole != REQUEST_ROLES.JUNIOR &&
    currentDate < apptDetails.appointmentDateTime
  ) {
    if (patientData && doctorData) {
      const messageBody = ApiConstants.AUTO_SUBMIT_BY_SD_SMS_TEXT.replace(
        '{0}',
        patientData.firstName
      )
        .replace('{1}', doctorData.firstName)
        .replace('{2}', process.env.SMS_LINK_BOOK_APOINTMENT);
      sendNotificationSMS(patientData.mobileNumber, messageBody);
    }
  }
  const historyAttrs: Partial<AppointmentUpdateHistory> = {
    appointment: apptDetails,
    userType: APPOINTMENT_UPDATED_BY.DOCTOR,
    fromValue: STATUS.PENDING,
    toValue: STATUS.IN_PROGRESS,
    valueType: VALUE_TYPE.STATUS,
    fromState: apptDetails.appointmentState,
    toState: apptDetails.appointmentState,
    userName: apptDetails.doctorId,
    reason: 'SD ' + ApiConstants.APPT_SESSION_HISTORY.toString(),
  };
  apptRepo.saveAppointmentHistory(historyAttrs);

  return {
    sessionId: sessionId,
    appointmentToken: token,
    patientId,
    doctorId,
    appointmentDateTime,
  };
};

const updateAppointmentSession: Resolver<
  null,
  updateAppointmentSessionInputArgs,
  ConsultServiceContext,
  AppointmentSession
> = async (parent, { updateAppointmentSessionInput }, { consultsDb }) => {
  if (!process.env.OPENTOK_KEY && !process.env.OPENTOK_SECRET) {
    throw new AphError(AphErrorMessages.INVALID_OPENTOK_KEYS);
  }

  let token = '',
    sessionId = '';

  const apptSessionRepo = consultsDb.getCustomRepository(AppointmentsSessionRepository);
  const apptSession = await apptSessionRepo.getAppointmentSession(
    updateAppointmentSessionInput.appointmentId
  );

  if (apptSession) {
    sessionId = apptSession.sessionId;
    const tokenDetails = await getSessionToken(sessionId);
    token = tokenDetails.token;
    await apptSessionRepo.updateAppointmentSession(token, apptSession.id);
  }
  return { sessionId: sessionId, appointmentToken: token };
};

const endAppointmentSession: Resolver<
  null,
  endAppointmentSessionInputArgs,
  ConsultServiceContext,
  Boolean
> = async (parent, { endAppointmentSessionInput }, { consultsDb, patientsDb, doctorsDb }) => {
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const apptDetails = await apptRepo.findById(endAppointmentSessionInput.appointmentId);
  if (apptDetails == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  const callDetailsRepo = consultsDb.getCustomRepository(AppointmentCallDetailsRepository);

  await apptRepo.updateAppointmentStatus(
    endAppointmentSessionInput.appointmentId,
    endAppointmentSessionInput.status,
    true,
    apptDetails
  );

  const apptSessionRepo = consultsDb.getCustomRepository(AppointmentsSessionRepository);
  const apptSession = await apptSessionRepo.getAppointmentSession(
    endAppointmentSessionInput.appointmentId
  );
  if (endAppointmentSessionInput.callSource && endAppointmentSessionInput.deviceType) {
    const appointmentCallDetailsAttrs: Partial<AppointmentCallDetails> = {
      appointment: apptDetails,
      callType: endAppointmentSessionInput.callType
        ? endAppointmentSessionInput.callType
        : APPT_CALL_TYPE.CHAT,
      doctorType: DOCTOR_CALL_TYPE.SENIOR,
      startTime: new Date(),
      endTime: new Date(),
      deviceType: endAppointmentSessionInput.deviceType,
      callSource: endAppointmentSessionInput.callSource,
      appVersion: endAppointmentSessionInput.appVersion,
    };
    await callDetailsRepo.saveAppointmentCallDetails(appointmentCallDetailsAttrs);
  }
  if (apptSession) {
    await apptSessionRepo.endAppointmentSession(apptSession.id, new Date());
  }

  const historyAttrs: Partial<AppointmentUpdateHistory> = {
    appointment: apptDetails,
    userType: APPOINTMENT_UPDATED_BY.DOCTOR,
    fromValue: apptDetails.status,
    toValue: endAppointmentSessionInput.status,
    valueType: VALUE_TYPE.STATUS,
    fromState: apptDetails.appointmentState,
    toState: apptDetails.appointmentState,
    userName: apptDetails.doctorId,
    reason: 'SD ' + ApiConstants.APPT_SESSION_COMPLETE_HISTORY.toString(),
  };
  apptRepo.saveAppointmentHistory(historyAttrs);

  if (
    endAppointmentSessionInput.status == STATUS.NO_SHOW ||
    endAppointmentSessionInput.status == STATUS.CALL_ABANDON
  ) {
    const rescheduleRepo = consultsDb.getCustomRepository(RescheduleAppointmentRepository);
    const noShowRepo = consultsDb.getCustomRepository(AppointmentNoShowRepository);
    const noShowAttrs: Partial<AppointmentNoShow> = {
      noShowType: endAppointmentSessionInput.noShowBy,
      appointment: apptDetails,
      noShowStatus: endAppointmentSessionInput.status,
    };

    await noShowRepo.saveNoShow(noShowAttrs);
    const rescheduleAppointmentAttrs: Partial<RescheduleAppointmentDetails> = {
      rescheduleReason: endAppointmentSessionInput.status.toString(),
      rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE.PATIENT,
      rescheduleInitiatedId: apptDetails.patientId,
      rescheduledDateTime: new Date(),
      rescheduleStatus: TRANSFER_STATUS.INITIATED,
      appointment: apptDetails,
    };
    const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
    const doctorDetails = await doctorRepo.findById(apptDetails.doctorId);
    let docName = '';
    let hospitalName = '';
    if (doctorDetails) {
      docName = doctorDetails.displayName;
    }
    if (apptDetails.hospitalId != '' && apptDetails.hospitalId != null) {
      const facilityRepo = doctorsDb.getCustomRepository(FacilityRepository);
      const facilityDets = await facilityRepo.getfacilityDetails(apptDetails.hospitalId);
      if (facilityDets) {
        const streetLine2 = facilityDets.streetLine2 == null ? '' : facilityDets.streetLine2 + ',';
        hospitalName =
          facilityDets.name +
          ', ' +
          facilityDets.streetLine1 +
          ', ' +
          streetLine2 +
          ' ' +
          facilityDets.city +
          ', ' +
          facilityDets.state;
      }
    }

    // const ccEmailIds =
    //   process.env.NODE_ENV == 'dev' ||
    //   process.env.NODE_ENV == 'development' ||
    //   process.env.NODE_ENV == 'local'
    //     ? ApiConstants.PATIENT_APPT_CC_EMAILID
    //     : ApiConstants.PATIENT_APPT_CC_EMAILID_PRODUCTION;
    let isDoctorNoShow = 0;
    if (endAppointmentSessionInput.noShowBy == REQUEST_ROLES.DOCTOR) {
      isDoctorNoShow = 1;
      rescheduleAppointmentAttrs.rescheduleInitiatedBy = TRANSFER_INITIATED_TYPE.DOCTOR;
      rescheduleAppointmentAttrs.rescheduleInitiatedId = apptDetails.doctorId;
    }
    await rescheduleRepo.saveReschedule(rescheduleAppointmentAttrs);
    await apptRepo.updateTransferState(
      apptDetails.id,
      APPOINTMENT_STATE.AWAITING_RESCHEDULE,
      apptDetails
    );

    // send notification
    let pushNotificationInput = {
      appointmentId: apptDetails.id,
      notificationType: NotificationType.INITIATE_RESCHEDULE,
    };
    if (isDoctorNoShow == 1) {
      pushNotificationInput = {
        appointmentId: apptDetails.id,
        notificationType: NotificationType.DOCTOR_NO_SHOW_INITIATE_RESCHEDULE,
      };
    }
    sendNotification(pushNotificationInput, patientsDb, consultsDb, doctorsDb);
  }

  return true;
};

export const createAppointmentSessionResolvers = {
  Mutation: {
    createAppointmentSession,
    updateAppointmentSession,
    endAppointmentSession,
    createJuniorAppointmentSession,
  },
};
