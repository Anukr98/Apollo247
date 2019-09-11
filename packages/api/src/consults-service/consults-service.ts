import '@aph/universal/dist/global';
import { buildFederatedSchema } from '@apollo/federation';
import { GatewayHeaders } from 'api-gateway';
import { ApolloServer } from 'apollo-server';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { connect } from 'consults-service/database/connect';
import {
  createAppointmentSessionResolvers,
  createAppointmentSessionTypeDefs,
} from 'consults-service/resolvers/appointmentSession';
import {
  bookAppointmentResolvers,
  bookAppointmentTypeDefs,
} from 'consults-service/resolvers/bookAppointment';
import {
  makeAppointmentPaymentTypeDefs,
  makeAppointmentPaymentResolvers,
} from 'consults-service/resolvers/makeAppointmentPayment';
import { caseSheetResolvers, caseSheetTypeDefs } from 'consults-service/resolvers/caseSheet';
import {
  getAppointmentHistoryResolvers,
  getAppointmentHistoryTypeDefs,
} from 'consults-service/resolvers/getAppointmentHistory';
import {
  getAvailableSlotsResolvers,
  getAvailableSlotsTypeDefs,
} from 'consults-service/resolvers/getDoctorAvailability';
import {
  getNextAvailableSlotResolvers,
  getNextAvailableSlotTypeDefs,
} from 'consults-service/resolvers/getDoctorNextSlot';
import {
  getPhysicalAvailableSlotsResolvers,
  getPhysicalAvailableSlotsTypeDefs,
} from 'consults-service/resolvers/getDoctorPhysicalAvailability';
import {
  getPatinetAppointmentsResolvers,
  getPatinetAppointmentsTypeDefs,
} from 'consults-service/resolvers/getPatientAppointments';
import {
  transferAppointmentTypeDefs,
  transferAppointmentResolvers,
} from 'consults-service/resolvers/transferAppointment';
import {
  rescheduleAppointmentTypeDefs,
  rescheduleAppointmentResolvers,
} from 'consults-service/resolvers/rescheduleAppointment';
import {
  getPatientConsultsAndPrescriptionsTypeDefs,
  getPatientConsultsAndPrescriptionsResolvers,
} from 'consults-service/resolvers/getPatientPastConsultsAndPrescriptions';
import {
  chooseDoctorTypeDefs,
  chooseDoctorResolvers,
} from 'consults-service/resolvers/chooseDoctor';
import {
  cancelAppointmentTypeDefs,
  cancelAppointmentResolvers,
} from 'consults-service/resolvers/cancelAppointment';
import {
  bookFollowUpAppointmentTypeDefs,
  bookFollowUpAppointmentResolvers,
} from 'consults-service/resolvers/bookFollowUpAppointment';
import { GraphQLDate, GraphQLDateTime, GraphQLTime } from 'graphql-iso-date';
import gql from 'graphql-tag';
import 'reflect-metadata';
import { getConnection } from 'typeorm';
import {
  getConsultQueueTypeDefs,
  getConsultQueueResolvers,
} from 'consults-service/resolvers/getConsultQueue';
//import { AphMqClient, AphMqMessage, AphMqMessageTypes } from 'AphMqClient';
//import { SampleMessage } from 'types/appointmentTypes';

(async () => {
  await connect();

  const server = new ApolloServer({
    context: async ({ req }) => {
      const headers = req.headers as GatewayHeaders;
      const firebaseUid = headers.firebaseuid;
      const mobileNumber = headers.mobilenumber;
      const consultsDb = getConnection();
      const doctorsDb = getConnection('doctors-db');
      const patientsDb = getConnection('patients-db');
      const context: ConsultServiceContext = {
        firebaseUid,
        mobileNumber,
        doctorsDb,
        consultsDb,
        patientsDb,
      };
      return context;
    },
    schema: buildFederatedSchema([
      {
        typeDefs: gql`
          scalar Date
          scalar Time
          scalar DateTime
        `,
        resolvers: {
          Date: GraphQLDate,
          Time: GraphQLTime,
          DateTime: GraphQLDateTime,
        },
      },
      {
        typeDefs: getAvailableSlotsTypeDefs,
        resolvers: getAvailableSlotsResolvers,
      },
      {
        typeDefs: bookAppointmentTypeDefs,
        resolvers: bookAppointmentResolvers,
      },
      {
        typeDefs: makeAppointmentPaymentTypeDefs,
        resolvers: makeAppointmentPaymentResolvers,
      },
      {
        typeDefs: getAppointmentHistoryTypeDefs,
        resolvers: getAppointmentHistoryResolvers,
      },
      {
        typeDefs: getPatinetAppointmentsTypeDefs,
        resolvers: getPatinetAppointmentsResolvers,
      },
      {
        typeDefs: createAppointmentSessionTypeDefs,
        resolvers: createAppointmentSessionResolvers,
      },
      {
        typeDefs: getNextAvailableSlotTypeDefs,
        resolvers: getNextAvailableSlotResolvers,
      },
      {
        typeDefs: getPhysicalAvailableSlotsTypeDefs,
        resolvers: getPhysicalAvailableSlotsResolvers,
      },
      {
        typeDefs: caseSheetTypeDefs,
        resolvers: caseSheetResolvers,
      },
      {
        typeDefs: transferAppointmentTypeDefs,
        resolvers: transferAppointmentResolvers,
      },
      {
        typeDefs: rescheduleAppointmentTypeDefs,
        resolvers: rescheduleAppointmentResolvers,
      },
      {
        typeDefs: getPatientConsultsAndPrescriptionsTypeDefs,
        resolvers: getPatientConsultsAndPrescriptionsResolvers,
      },
      {
        typeDefs: chooseDoctorTypeDefs,
        resolvers: chooseDoctorResolvers,
      },
      {
        typeDefs: cancelAppointmentTypeDefs,
        resolvers: cancelAppointmentResolvers,
      },
      {
        typeDefs: bookFollowUpAppointmentTypeDefs,
        resolvers: bookFollowUpAppointmentResolvers,
      },
      {
        typeDefs: getConsultQueueTypeDefs,
        resolvers: getConsultQueueResolvers,
      },
    ]),
  });

  server.listen({ port: process.env.CONSULTS_SERVICE_PORT }).then(({ url }) => {
    console.log(`🚀 consults-service ready`);
  });

  /*AphMqClient.connect();
  const message = new Date().toISOString();
  const payload: SampleMessage = { message };
  type TestMessage = AphMqMessage<AphMqMessageTypes.TESTRECEIVER, SampleMessage>;
  const testMessage: TestMessage = {
    type: AphMqMessageTypes.TESTRECEIVER,
    payload,
  };
  AphMqClient.send(testMessage);
  type TestMessage1 = AphMqMessage<AphMqMessageTypes.TESTRECEIVER, SampleMessage>;
  AphMqClient.onReceive<TestMessage1>(AphMqMessageTypes.TESTRECEIVER, (receivedMessage) => {
    console.log('received message!', receivedMessage.message);
    console.log('accepting message hello');
    AphMqClient.send(testMessage);
    receivedMessage.accept();
  });*/
})();
