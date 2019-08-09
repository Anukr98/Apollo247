import '@aph/universal/dist/global';
import 'reflect-metadata';
import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';
import { ApolloServer } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';
import gql from 'graphql-tag';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { createConnections, getConnection } from 'typeorm';
import { Appointment, AppointmentSessions } from 'consults-service/entities';
import {
  Doctor,
  DoctorSpecialty,
  StarTeam,
  DoctorAndHospital,
  Facility,
  ConsultHours,
  DoctorBankAccounts,
  Packages,
} from 'doctors-service/entities';
import {
  getAvailableSlotsTypeDefs,
  getAvailableSlotsResolvers,
} from 'consults-service/resolvers/getDoctorAvailability';
import {
  bookAppointmentTypeDefs,
  bookAppointmentResolvers,
} from 'consults-service/resolvers/bookAppointment';
import {
  getAppointmentHistoryTypeDefs,
  getAppointmentHistoryResolvers,
} from 'consults-service/resolvers/getAppointmentHistory';
import {
  getPatinetAppointmentsTypeDefs,
  getPatinetAppointmentsResolvers,
} from 'consults-service/resolvers/getPatientAppointments';
import {
  createAppointmentSessionTypeDefs,
  createAppointmentSessionResolvers,
} from 'consults-service/resolvers/appointmentSession';
import { GatewayHeaders } from 'api-gateway';

(async () => {
  await createConnections([
    {
      entities: [Appointment, AppointmentSessions],
      type: 'postgres',
      host: process.env.CONSULTS_DB_HOST,
      port: parseInt(process.env.CONSULTS_DB_PORT, 10),
      username: process.env.CONSULTS_DB_USER,
      password: process.env.CONSULTS_DB_PASSWORD,
      database: `consults_${process.env.NODE_ENV}`,
      logging: true,
      synchronize: true,
    },
    {
      name: 'doctors-db',
      entities: [
        Doctor,
        DoctorSpecialty,
        StarTeam,
        DoctorAndHospital,
        Facility,
        ConsultHours,
        DoctorBankAccounts,
        Packages,
      ],
      type: 'postgres',
      host: process.env.DOCTORS_DB_HOST,
      port: parseInt(process.env.DOCTORS_DB_PORT, 10),
      username: process.env.DOCTORS_DB_USER,
      password: process.env.DOCTORS_DB_PASSWORD,
      database: `doctors_${process.env.NODE_ENV}`,
      logging: true,
      synchronize: true,
    },
  ]).catch((error) => {
    throw new Error(error);
  });

  const server = new ApolloServer({
    context: async ({ req }) => {
      const headers = req.headers as GatewayHeaders;
      const firebaseUid = headers.firebaseuid;
      const mobileNumber = headers.mobilenumber;
      const doctorsDb = getConnection('doctors-db');
      const consultsDb = getConnection();
      const context: ConsultServiceContext = {
        firebaseUid,
        mobileNumber,
        doctorsDb,
        consultsDb,
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
    ]),
  });

  server.listen({ port: 80 }).then(({ url }) => {
    console.log(`🚀 consults-service ready`);
  });
})();
