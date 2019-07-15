import 'reflect-metadata';
import { ApolloServer } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';
import { createConnection } from 'typeorm';
import { Patient } from 'profiles-service/entity/patient';
import { patientTypeDefs, patientResolvers } from 'profiles-service/resolvers/patientSignIn';
import { updatePatientTypeDefs, updatePatientResolvers } from 'profiles-service/resolvers/updatePatient';
import { getPatientTypeDefs, getPatientResolvers } from 'profiles-service/resolvers/getPatients';
import { GatewayContext, GatewayHeaders } from 'api-gateway';

export interface ProfilesServiceContext extends GatewayContext {}

export type Resolver<Parent = any, Args = any> = (
  parent: Parent,
  args: Args,
  context: ProfilesServiceContext
) => any;

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
    context: ({ req }) => {
      const headers = req.headers as GatewayHeaders;
      const context: ProfilesServiceContext = {
        mobileNumber: headers.mobilenumber,
        firebaseUid: headers.firebaseuid,
      };
      return context;
    },
    schema: buildFederatedSchema([
      {
        typeDefs: patientTypeDefs,
        resolvers: patientResolvers,
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
