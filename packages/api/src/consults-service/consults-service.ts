import 'reflect-metadata';
import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';
import { ApolloServer } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';
import gql from 'graphql-tag';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { createConnections, getConnection } from 'typeorm';
import { Appointment } from 'consults-service/entities/appointment';
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
import { GatewayHeaders } from 'api-gateway';

(async () => {
  await createConnections([
    {
      entities: [Appointment],
      type: 'postgres',
      host: 'consults-db',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: `consults_${process.env.NODE_ENV}`,
      logging: true,
      synchronize: true,
    },
    {
      name: 'doctorsDbConnection',
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
      host: 'doctors-db',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
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
      const doctorsDbConnect = getConnection('doctorsDbConnection');
      const consultsDbConnect = getConnection();
      const context: ConsultServiceContext = {
        firebaseUid,
        mobileNumber,
        doctorsDbConnect,
        consultsDbConnect,
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
    ]),
  });

  server.listen({ port: 80 }).then(({ url }) => {
    console.log(`🚀 consults-service ready`);
  });
})();
