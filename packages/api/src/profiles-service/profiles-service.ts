import 'reflect-metadata';
import _merge from 'lodash/merge';
import { ApolloServer } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';
import { createConnection } from 'typeorm';
import { Patient } from 'profiles-service/entity/patient';
import { patientTypeDefs, patientResolvers } from 'profiles-service/resolvers/patientResolvers';

export interface Context {
  firebaseUid: any;
  mobileNumber: any;
}

export type Resolver<Parent = any, Args = any> = (
  parent: Parent,
  args: Args,
  context: Context
) => any;

(async () => {
  const dbConn = createConnection({
    entities: [Patient],
    type: 'postgres',
    host: 'profiles-db',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: `profiles_${process.env.NODE_ENV}`,
    logging: true,
    synchronize: true,
  });

  await Promise.all([dbConn]);

  const context: Context = { firebaseUid: '', mobileNumber: '' };

  const server = new ApolloServer({
    context: ({ req }) => {
      context.mobileNumber = req.headers.mobilenumber;
      context.firebaseUid = req.headers.firebaseuid;
      return context;
    },
    schema: buildFederatedSchema([
      {
        typeDefs: patientTypeDefs,
        resolvers: _merge(patientResolvers),
      },
    ]),
  });

  server.listen({ port: 80 }).then(({ url }) => {
    console.log(`🚀 profiles-service ready`);
  });
})();
