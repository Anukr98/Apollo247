import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import openTok, { TokenOptions } from 'opentok';
import { AppointmentsSessionRepository } from 'consults-service/repositories/appointmentsSessionRepository';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { STATUS } from 'consults-service/entities';

export const createAppointmentSessionTypeDefs = gql`
  enum REQUEST_ROLES {
    DOCTOR
    PATIENT
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

const createAppointmentSession: Resolver<
  null,
  createAppointmentSessionInputArgs,
  ConsultServiceContext,
  CreateAppointmentSession
> = async (parent, { createAppointmentSessionInput }, { consultsDb }) => {
  const opentok = new openTok('46393582', 'f27789a7bad5d0ec7e5fd2c36ffba08a4830a91d');
  let sessionId = '',
    token = '',
    patientId = '',
    doctorId = '';
  let appointmentDateTime: Date = new Date();
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);

  const apptDetails = await apptRepo.findById(createAppointmentSessionInput.appointmentId);
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
      opentok.createSession({}, (error, session) => {
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
  const opentok = new openTok('46393582', 'f27789a7bad5d0ec7e5fd2c36ffba08a4830a91d');
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
  },
};
