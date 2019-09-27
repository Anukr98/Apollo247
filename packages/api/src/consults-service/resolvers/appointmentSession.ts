import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import openTok, { TokenOptions } from 'opentok';
import { AppointmentsSessionRepository } from 'consults-service/repositories/appointmentsSessionRepository';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { STATUS, CaseSheet, REQUEST_ROLES } from 'consults-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { JuniorAppointmentsSessionRepository } from 'consults-service/repositories/juniorAppointmentsSessionRepository';
import { NotificationType, sendNotification } from 'notifications-service/resolvers/notifications';

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
    caseSheetId: String
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
  caseSheetId: string;
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
  let caseSheetId = '';
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  if (createAppointmentSessionInput.requestRole != REQUEST_ROLES.DOCTOR) {
    throw new AphError(AphErrorMessages.INVALID_REQUEST_ROLE);
  }
  const apptDetails = await apptRepo.findById(createAppointmentSessionInput.appointmentId);
  if (apptDetails == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  // senior doctor case sheet creation starts
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const juniorDoctorcaseSheet = await caseSheetRepo.getJuniorDoctorCaseSheet(apptDetails.id);
  if (juniorDoctorcaseSheet == null) throw new AphError(AphErrorMessages.INVALID_CASESHEET_ID);

  //check whether if senior doctors casesheet already exists
  let caseSheetDetails;
  caseSheetDetails = await caseSheetRepo.getSeniorDoctorCaseSheet(apptDetails.id);

  if (caseSheetDetails == null) {
    //get doctor details
    const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
    const doctordata = await doctorRepository.findById(apptDetails.doctorId);
    if (doctordata == null) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID);

    const caseSheetAttrs: Partial<CaseSheet> = {
      diagnosis: juniorDoctorcaseSheet.diagnosis,
      diagnosticPrescription: juniorDoctorcaseSheet.diagnosticPrescription,
      followUp: juniorDoctorcaseSheet.followUp,
      followUpAfterInDays: juniorDoctorcaseSheet.followUpAfterInDays,
      followUpDate: juniorDoctorcaseSheet.followUpDate,
      otherInstructions: juniorDoctorcaseSheet.otherInstructions,
      symptoms: juniorDoctorcaseSheet.symptoms,
      consultType: apptDetails.appointmentType,
      doctorId: apptDetails.doctorId,
      patientId: apptDetails.patientId,
      appointment: apptDetails,
      createdDoctorId: apptDetails.doctorId,
      doctorType: doctordata.doctorType,
    };
    caseSheetDetails = await caseSheetRepo.savecaseSheet(caseSheetAttrs);
    if (caseSheetDetails == null) throw new AphError(AphErrorMessages.INVALID_CASESHEET_ID);
  }
  caseSheetId = caseSheetDetails.id;
  // senior doctor case sheet creation ends

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
    // send notification
    const pushNotificationInput = {
      appointmentId: createAppointmentSessionInput.appointmentId,
      notificationType: NotificationType.INITIATE_SENIOR_APPT_SESSION,
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
      appointmentToken: apptSessionDets.doctorToken,
      patientId,
      doctorId,
      appointmentDateTime,
      caseSheetId,
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
  await apptRepo.updateAppointmentStatus(
    createAppointmentSessionInput.appointmentId,
    STATUS.IN_PROGRESS
  );
  await repo.saveAppointmentSession(appointmentSessionAttrs);
  // send notification
  const pushNotificationInput = {
    appointmentId: createAppointmentSessionInput.appointmentId,
    notificationType: NotificationType.INITIATE_SENIOR_APPT_SESSION,
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
    patientId,
    doctorId,
    appointmentDateTime,
    caseSheetId,
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
> = async (parent, { endAppointmentSessionInput }, { consultsDb }) => {
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  await apptRepo.updateAppointmentStatus(
    endAppointmentSessionInput.appointmentId,
    STATUS.COMPLETED
  );
  const apptSessionRepo = consultsDb.getCustomRepository(AppointmentsSessionRepository);
  const apptSession = await apptSessionRepo.getAppointmentSession(
    endAppointmentSessionInput.appointmentId
  );
  if (apptSession) {
    await apptSessionRepo.endAppointmentSession(apptSession.id, new Date());
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
