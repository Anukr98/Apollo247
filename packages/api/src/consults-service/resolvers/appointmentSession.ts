import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import openTok, { TokenOptions } from 'opentok';
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
import { EmailMessage } from 'types/notificationMessageTypes';
import { ApiConstants } from 'ApiConstants';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { FacilityRepository } from 'doctors-service/repositories/facilityRepository';
import { addMilliseconds, format, differenceInHours } from 'date-fns';

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
  const opentok_key = process.env.OPENTOK_KEY ? process.env.OPENTOK_KEY : '';
  const opentok_secret = process.env.OPENTOK_SECRET ? process.env.OPENTOK_SECRET : '';
  const opentok = new openTok(opentok_key, opentok_secret);
  let sessionId = '',
    token = '';
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
  function getSessionToken() {
    return new Promise((resolve, reject) => {
      opentok.createSession({ mediaMode: 'routed', archiveMode: 'always' }, (error, session) => {
        if (error) {
          reject(error);
        }
        if (session) {
          sessionId = session.sessionId;
          const tokenOptions: TokenOptions = { role: 'moderator', data: '' };
          token = opentok.generateToken(sessionId, tokenOptions);
        }
        resolve(token);
      });
    });
  }
  await getSessionToken();

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

  const opentok_key = process.env.OPENTOK_KEY ? process.env.OPENTOK_KEY : '';
  const opentok_secret = process.env.OPENTOK_SECRET ? process.env.OPENTOK_SECRET : '';
  const opentok = new openTok(opentok_key, opentok_secret);
  let sessionId = '',
    token = '',
    patientId = '',
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

  if (apptSessionDets && differenceInHours(apptSessionDets.createdDate, new Date()) <= 23) {
    if (
      createAppointmentSessionInput.requestRole == REQUEST_ROLES.DOCTOR &&
      apptDetails.status != STATUS.IN_PROGRESS
    ) {
      await apptRepo.updateAppointmentStatus(
        createAppointmentSessionInput.appointmentId,
        STATUS.IN_PROGRESS,
        true
      );
    }
    // If appointment started with junior doctor
    // if (
    //   createAppointmentSessionInput.requestRole == REQUEST_ROLES.JUNIOR &&
    //   apptDetails.status != STATUS.IN_PROGRESS &&
    //   apptDetails.status != STATUS.JUNIOR_DOCTOR_STARTED
    // ) {
    //   await apptRepo.updateAppointmentStatus(
    //     createAppointmentSessionInput.appointmentId,
    //     STATUS.JUNIOR_DOCTOR_STARTED
    //   );
    // }
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
  function getSessionToken() {
    return new Promise((resolve, reject) => {
      opentok.createSession({ mediaMode: 'routed', archiveMode: 'always' }, (error, session) => {
        if (error) {
          reject(error);
        }
        if (session) {
          sessionId = session.sessionId;
          const tokenOptions: TokenOptions = { role: 'moderator', data: '' };
          token = opentok.generateToken(sessionId, tokenOptions);
        }
        resolve(token);
      });
    });
  }
  await getSessionToken();
  const appointmentSessionAttrs = {
    sessionId,
    doctorToken: token,
    appointment: apptDetails,
    consultStartDateTime: new Date(),
  };
  const repo = consultsDb.getCustomRepository(AppointmentsSessionRepository);
  if (
    createAppointmentSessionInput.requestRole == REQUEST_ROLES.DOCTOR &&
    apptDetails.status != STATUS.IN_PROGRESS
  ) {
    await apptRepo.updateAppointmentStatus(
      createAppointmentSessionInput.appointmentId,
      STATUS.IN_PROGRESS,
      true
    );
  }
  if (apptSessionDets == null) {
    await repo.saveAppointmentSession(appointmentSessionAttrs);
  } else {
    await repo.updateDoctorAppointmentSession(token, apptSessionDets.id, sessionId);
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
  const opentok_key = process.env.OPENTOK_KEY ? process.env.OPENTOK_KEY : '';
  const opentok_secret = process.env.OPENTOK_SECRET ? process.env.OPENTOK_SECRET : '';
  const opentok = new openTok(opentok_key, opentok_secret);
  let token = '',
    sessionId = '';
  const apptSessionRepo = consultsDb.getCustomRepository(AppointmentsSessionRepository);
  const apptSession = await apptSessionRepo.getAppointmentSession(
    updateAppointmentSessionInput.appointmentId
  );
  const tokenOptions: TokenOptions = { role: 'moderator', data: '' };
  if (apptSession) {
    sessionId = apptSession.sessionId;
    token = opentok.generateToken(sessionId, tokenOptions);
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

    const mailContent = `Appointment booked on Apollo 247 has been cancelled. <br>Patient Name: ${apptDetails.patientName}<br>Appointment Date Time: ${apptDate}, ${apptTime}<br>Doctor Name: ${docName}<br>Hospital Name: ${hospitalName}`;
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
