import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import openTok, { TokenOptions } from 'opentok';
import { AppointmentsSessionRepository } from 'consults-service/repositories/appointmentsSessionRepository';

export const createAppointmentSessionTypeDefs = gql`
  type AppointmentSession {
    sessionId: String!
    appointmentToken: String!
  }

  input CreateAppointmentSessionInput {
    appointmentId: ID!
    requestRole: String!
  }

  extend type Mutation {
    createAppointmentSession(
      createAppointmentSessionInput: CreateAppointmentSessionInput
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

type createAppointmentSessionInputArgs = {
  createAppointmentSessionInput: CreateAppointmentSessionInput;
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
    return new Promise((resolve) => {
      opentok.createSession({}, (error, session) => {
        if (error) {
          console.log('Error creating session:', error);
        }
        if (session) {
          sessionId = session.sessionId;
          console.log('Session ID: ' + sessionId);
          const tokenOptions: TokenOptions = { role: 'publisher', data: 'username=bob' };
          token = opentok.generateToken(sessionId, tokenOptions);
          console.log(token);
        }
        resolve(token);
      });
    });
  }
  await getSessionToken();
  const appointmentSessionAttrs = {
    appointmentId: createAppointmentSessionInput.appointmentId,
    sessionId,
    doctorToken: token,
  };
  const repo = consultsDb.getCustomRepository(AppointmentsSessionRepository);
  const resp = await repo.saveAppointmentSession(appointmentSessionAttrs);
  console.log(resp);
  return { sessionId: sessionId, appointmentToken: token };
};

export const createAppointmentSessionResolvers = {
  Mutation: {
    createAppointmentSession,
  },
};
