import { ApolloServer, AuthenticationError } from 'apollo-server';
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway';
import { GraphQLExecutor } from 'apollo-server-core';
import * as firebaseAdmin from 'firebase-admin';

interface GatewayContext {
  firebaseUid: string;
  mobileNumber: string;
}

const env = process.env.NODE_ENV as 'local' | 'development';
const port = process.env.WEB_CLIENT_PORT === '80' ? '' : `:${process.env.WEB_CLIENT_PORT}`;
const envToCorsOrigin = {
  local: '*', // `http://localhost${port}`,
  development: '*', // 'http://patients-web.aph.popcornapps.com'
  // staging: '',
  // production: ''
};

(async () => {
  const gateway = new ApolloGateway({
    serviceList: [
      { name: 'profiles', url: 'http://profiles-service/graphql' },
      { name: 'doctors', url: 'http://doctors-service/graphql' },
    ],
    buildService({ name, url }) {
      return new RemoteGraphQLDataSource({
        url,
        willSendRequest({ request, context }) {
          const firebaseData = (context as any) as GatewayContext;
          if (request && request.http) {
            request.http.headers.set('mobileNumber', firebaseData.mobileNumber);
            request.http.headers.set('firebaseUid', firebaseData.firebaseUid);
          }
        },
      });
    },
  });

  const config = await gateway.load();
  const schema = config.schema;
  const executor = config.executor as GraphQLExecutor;

  const firebase = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.applicationDefault(),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  });

  const server = new ApolloServer({
    cors: { origin: envToCorsOrigin[env] },
    schema,
    executor,
    context: async ({ req }) => {
      const isLocal = process.env.NODE_ENV == 'local';
      const isDevelopment = process.env.NODE_ENV == 'development';
      const isSchemaIntrospectionQuery = req.body.operationName == 'IntrospectionQuery';
      if ((isLocal || isDevelopment) && isSchemaIntrospectionQuery) {
        return { firebaseUid: '', mobileNumber: '' };
      }

      const jwt = req.headers.authorization || '';

      const firebaseIdToken = await firebase
        .auth()
        .verifyIdToken(jwt)
        .catch((error: firebaseAdmin.FirebaseError) => {
          throw new AuthenticationError(error.code);
        });

      const firebaseUser = await firebase
        .auth()
        .getUser(firebaseIdToken.uid)
        .catch((error: firebaseAdmin.FirebaseError) => {
          throw new AuthenticationError(error.message);
        });

      const gatewayContext: GatewayContext = {
        firebaseUid: firebaseUser.uid,
        mobileNumber: firebaseUser.phoneNumber || '',
      };

      return gatewayContext;
    },
  });

  server.listen(process.env.API_GATEWAY_PORT).then(({ url }) => {
    console.log(`🚀 api gateway ready at ${url}`);
  });
})();
