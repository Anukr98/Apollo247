import 'reflect-metadata';
import _merge from 'lodash/merge';
import { ApolloServer } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';
import * as firebaseAdmin from 'firebase-admin';
import { createConnection } from 'typeorm';
import { Patient } from 'profiles-service/entity/patient';
import { patientTypeDefs, patientResolvers } from 'profiles-service/resolvers/patientResolvers';

export interface Context {
  firebase: firebaseAdmin.app.App;
}

export type Resolver<Parent = any, Args = any> = (
  parent: Parent,
  args: Args,
  context: Context
) => any;

(async () => {
  const firebase = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.applicationDefault(),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  });

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

  await Promise.all([firebase, dbConn]);

  const context: Context = { firebase };

  const server = new ApolloServer({
    context: () => context,
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
