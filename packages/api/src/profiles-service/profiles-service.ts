import 'reflect-metadata';
import { GraphQLDate } from 'graphql-iso-date';
import { ApolloServer } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';
import { createConnection } from 'typeorm';
import { Patient } from 'profiles-service/entity/patient';
import {
  getCurrentPatientsTypeDefs,
  getCurrentPatientsResolvers,
} from 'profiles-service/resolvers/getCurrentPatients';
import {
  updatePatientTypeDefs,
  updatePatientResolvers,
} from 'profiles-service/resolvers/updatePatient';
import { getPatientTypeDefs, getPatientResolvers } from 'profiles-service/resolvers/getPatients';
import { GatewayContext, GatewayHeaders } from 'api-gateway';
import gql from 'graphql-tag';
import { AphAuthenticationError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/AphErrorMessages';

export interface ProfilesServiceContext extends GatewayContext {
  currentPatient: Patient;
}

(async () => {
  await createConnection({
    entities: [Patient],
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
      const mobileNumber = headers.mobilenumber;
      const firebaseUid = headers.firebaseuid;
      const currentPatient = await Patient.findOneOrFail({ where: { firebaseUid } }).catch(
        (error) => {
          throw new AphAuthenticationError(AphErrorMessages.NO_CURRENT_USER);
        }
      );
      const context: ProfilesServiceContext = { mobileNumber, firebaseUid, currentPatient };
      return context;
    },
    schema: buildFederatedSchema([
      {
        typeDefs: gql`
          scalar Date
        `,
        resolvers: {
          Date: GraphQLDate,
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
    ]),
  });

  server.listen({ port: 80 }).then(({ url }) => {
    console.log(`🚀 profiles-service ready`);
  });
})();
