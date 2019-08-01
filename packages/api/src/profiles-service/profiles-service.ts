import 'reflect-metadata';
import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';
import { ApolloServer } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';
import { createConnection } from 'typeorm';
import { Patient } from 'profiles-service/entity/patient';
import { Appointments } from 'profiles-service/entity/appointment';
import {
  getCurrentPatientsTypeDefs,
  getCurrentPatientsResolvers,
} from 'profiles-service/resolvers/getCurrentPatients';
import {
  updatePatientTypeDefs,
  updatePatientResolvers,
} from 'profiles-service/resolvers/updatePatient';
import { getPatientTypeDefs, getPatientResolvers } from 'profiles-service/resolvers/getPatients';
import {
  getPastSearchesTypeDefs,
  getPastSearchesResolvers,
} from 'profiles-service/resolvers/getPastSearches';
import {
  getAppointmentHistoryTypeDefs,
  getAppointmentHistoryResolvers,
} from 'profiles-service/resolvers/getAppointmentHistory';
import {
  bookAppointmentTypeDefs,
  bookAppointmentResolvers,
} from 'profiles-service/resolvers/bookAppointment';
import gql from 'graphql-tag';
import { GatewayHeaders } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
// import { AphAuthenticationError } from 'AphError';
// import { AphErrorMessages } from '@aph/universal/AphErrorMessages';

(async () => {
  await createConnection({
    entities: [Patient, Appointments],
    type: 'postgres',
    host: 'profiles-db',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: `profiles_${process.env.NODE_ENV}`,
    logging: true,
    synchronize: true,
  }).catch((error) => {
    throw new Error(error);
  });

  const server = new ApolloServer({
    context: async ({ req }) => {
      const headers = req.headers as GatewayHeaders;
      const firebaseUid = headers.firebaseuid;
      const mobileNumber = headers.mobilenumber;
      // const isSignInQuery = req.query === 'getCurrentPatients';
      // const currentPatient = isSignInQuery
      //   ? null
      //   : await Patient.findOneOrFail({ where: { firebaseUid } }).catch(() => {
      //       throw new AphAuthenticationError(AphErrorMessages.NO_CURRENT_USER);
      //     });
      const currentPatient = null;
      const context: ProfilesServiceContext = { firebaseUid, mobileNumber, currentPatient };
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
        typeDefs: getCurrentPatientsTypeDefs,
        resolvers: getCurrentPatientsResolvers,
      },
      {
        typeDefs: updatePatientTypeDefs,
        resolvers: updatePatientResolvers,
      },
      {
        typeDefs: getPatientTypeDefs,
        resolvers: getPatientResolvers,
      },
      {
        typeDefs: bookAppointmentTypeDefs,
        resolvers: bookAppointmentResolvers,
      },
      {
        typeDefs: getPastSearchesTypeDefs,
        resolvers: getPastSearchesResolvers,
      },
      {
        typeDefs: getAppointmentHistoryTypeDefs,
        resolvers: getAppointmentHistoryResolvers,
      },
    ]),
  });

  server.listen({ port: 80 }).then(({ url }) => {
    console.log(`🚀 profiles-service ready`);
  });
})();
