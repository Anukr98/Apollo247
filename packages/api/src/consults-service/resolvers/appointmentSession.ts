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
} from 'consults-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { JuniorAppointmentsSessionRepository } from 'consults-service/repositories/juniorAppointmentsSessionRepository';
import { NotificationType, sendNotification } from 'notifications-service/resolvers/notifications';
import { RescheduleAppointmentRepository } from 'consults-service/repositories/rescheduleAppointmentRepository';
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

export const createAppointmentSessionTypeDefs = gql`
  enum REQUEST_ROLES {
    DOCTOR
    PATIENT
    JUNIOR
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
        new Date()
      );
    }

    // send notification
    const pushNotificationInput = {
      appointmentId: createAppointmentSessionInput.appointmentId,
      notificationType: NotificationType.INITIATE_SENIOR_APPT_SESSION,
    };
    if (createAppointmentSessionInput.requestRole == REQUEST_ROLES.JUNIOR) {
      pushNotificationInput.notificationType = NotificationType.INITIATE_JUNIOR_APPT_SESSION;
    }
    const notificationResult = await sendNotification(
      pushNotificationInput,
      patientsDb,
      consultsDb,
      doctorsDb
    );
    console.log(notificationResult, 'notificationResult');
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
      new Date()
    );
  }

  // send notification
  const pushNotificationInput = {
    appointmentId: createAppointmentSessionInput.appointmentId,
    notificationType: NotificationType.INITIATE_SENIOR_APPT_SESSION,
  };
  if (createAppointmentSessionInput.requestRole == REQUEST_ROLES.JUNIOR) {
    pushNotificationInput.notificationType = NotificationType.INITIATE_JUNIOR_APPT_SESSION;
  }
  const notificationResult = await sendNotification(
    pushNotificationInput,
    patientsDb,
    consultsDb,
    doctorsDb
  );
  console.log(notificationResult, 'notificationResult');
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
  await apptRepo.updateAppointmentStatus(
    endAppointmentSessionInput.appointmentId,
    endAppointmentSessionInput.status,
    true
  );
  const apptSessionRepo = consultsDb.getCustomRepository(AppointmentsSessionRepository);
  const apptSession = await apptSessionRepo.getAppointmentSession(
    endAppointmentSessionInput.appointmentId
  );
  if (apptSession) {
    await apptSessionRepo.endAppointmentSession(apptSession.id, new Date());
  }

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
    const istDateTime = addMilliseconds(apptDetails.appointmentDateTime, 19800000);

    const apptDate = format(istDateTime, 'dd/MM/yyyy');
    const apptTime = format(istDateTime, 'hh:mm aa');
    const mailSubject = ApiConstants.CANCEL_APPOINTMENT_SUBJECT;

    const mailContent = cancellationEmailTemplate({
      Title: ApiConstants.CANCEL_APPOINTMENT_BODY,
      PatientName: apptDetails.patientName,
      AppointmentDateTime: apptDate + ',  ' + apptTime,
      DoctorName: docName,
      HospitalName: hospitalName,
    });
    const ccEmailIds =
      process.env.NODE_ENV == 'dev' ||
      process.env.NODE_ENV == 'development' ||
      process.env.NODE_ENV == 'local'
        ? ApiConstants.PATIENT_APPT_CC_EMAILID
        : ApiConstants.PATIENT_APPT_CC_EMAILID_PRODUCTION;
    if (endAppointmentSessionInput.noShowBy == REQUEST_ROLES.DOCTOR) {
      rescheduleAppointmentAttrs.rescheduleInitiatedBy = TRANSFER_INITIATED_TYPE.DOCTOR;
      rescheduleAppointmentAttrs.rescheduleInitiatedId = apptDetails.doctorId;
      const adminRepo = doctorsDb.getCustomRepository(AdminDoctorMap);
      const adminDetails = await adminRepo.findByadminId(apptDetails.doctorId);
      console.log(adminDetails, 'adminDetails');
      if (adminDetails == null) throw new AphError(AphErrorMessages.GET_ADMIN_USER_ERROR);

      const listOfEmails: string[] = [];

      adminDetails.length > 0 &&
        adminDetails.map((value) => listOfEmails.push(value.adminuser.email));
      console.log('listOfEmails', listOfEmails);
      listOfEmails.forEach(async (adminemail) => {
        const adminEmailContent: EmailMessage = {
          ccEmail: ccEmailIds.toString(),
          toEmail: adminemail.toString(),
          subject: mailSubject.toString(),
          fromEmail: ApiConstants.PATIENT_HELP_FROM_EMAILID.toString(),
          fromName: ApiConstants.PATIENT_HELP_FROM_NAME.toString(),
          messageContent: mailContent,
        };
        sendMail(adminEmailContent);
      });
    }
    await rescheduleRepo.saveReschedule(rescheduleAppointmentAttrs);
    await apptRepo.updateTransferState(apptDetails.id, APPOINTMENT_STATE.AWAITING_RESCHEDULE);
    // send notification
    const pushNotificationInput = {
      appointmentId: apptDetails.id,
      notificationType: NotificationType.INITIATE_RESCHEDULE,
    };
    const notificationResult = sendNotification(
      pushNotificationInput,
      patientsDb,
      consultsDb,
      doctorsDb
    );
    console.log(notificationResult, 'notificationResult');
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
