import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import openTok, { TokenOptions } from 'opentok';
import { AppointmentsSessionRepository } from 'consults-service/repositories/appointmentsSessionRepository';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';

export const createAppointmentSessionTypeDefs = gql`
  enum REQUEST_ROLES {
    DOCTOR
    PATIENT
  }

  type AppointmentSession {
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

  extend type Mutation {
    createAppointmentSession(
      createAppointmentSessionInput: CreateAppointmentSessionInput
    ): AppointmentSession!
    updateAppointmentSession(
      updateAppointmentSessionInput: UpdateAppointmentSessionInput
    ): AppointmentSession!
  }
`;

type AppointmentSession = {
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

const createAppointmentSession: Resolver<
  null,
  createAppointmentSessionInputArgs,
  ConsultServiceContext,
  AppointmentSession
> = async (parent, { createAppointmentSessionInput }, { consultsDb }) => {
  const opentok = new openTok('46393582', 'f27789a7bad5d0ec7e5fd2c36ffba08a4830a91d');
  let sessionId = '',
    token = '';

  function getSessionToken() {
    return new Promise((resolve, reject) => {
      opentok.createSession({}, (error, session) => {
        if (error) {
          reject(error);
        }
        if (session) {
          sessionId = session.sessionId;
          const tokenOptions: TokenOptions = { role: 'publisher', data: '' };
          token = opentok.generateToken(sessionId, tokenOptions);
        }
        resolve(token);
      });
    });
  }
  await getSessionToken();
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const apptDetails = await apptRepo.findById(createAppointmentSessionInput.appointmentId);
  const appointmentSessionAttrs = {
    sessionId,
    doctorToken: token,
    appointment: apptDetails,
  };
  const repo = consultsDb.getCustomRepository(AppointmentsSessionRepository);
  await repo.saveAppointmentSession(appointmentSessionAttrs);
  return { sessionId: sessionId, appointmentToken: token };
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
  const tokenOptions: TokenOptions = { role: 'subscriber', data: '' };
  if (apptSession) {
    sessionId = apptSession.sessionId;
    token = opentok.generateToken(sessionId, tokenOptions);
    await apptSessionRepo.updateAppointmentSession(token, apptSession.id);
  }
  return { sessionId: sessionId, appointmentToken: token };
};

export const createAppointmentSessionResolvers = {
  Mutation: {
    createAppointmentSession,
    updateAppointmentSession,
  },
};
