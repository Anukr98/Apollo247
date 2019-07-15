import 'reflect-metadata';
import _merge from 'lodash/merge';
import { ApolloServer } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';
import * as firebaseAdmin from 'firebase-admin';
import { doctorTypeDefs, doctorResolvers } from 'doctors-service/resolvers/doctorResolvers';
import {
  getSpecialtyTypeDefs,
  getSpecialtyResolvers,
} from 'doctors-service/resolvers/getSpecialties';

export interface Context {
  firebase: firebaseAdmin.app.App;
}

export type Resolver<Parent = any, Args = any> = (
  parent: Parent,
  args: Args,
  context: Context
) => any;

(async () => {
  const server = new ApolloServer({
    schema: buildFederatedSchema([
      {
        typeDefs: doctorTypeDefs,
        resolvers: _merge(doctorResolvers),
      },
      {
        typeDefs: getSpecialtyTypeDefs,
        resolvers: getSpecialtyResolvers,
      },
    ]),
  });

  server.listen({ port: 80 }).then(({ url }) => {
    console.log(`🚀 doctors-service ready`);
  });
})();
