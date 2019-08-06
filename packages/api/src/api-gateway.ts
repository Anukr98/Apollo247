import { ApolloServer } from 'apollo-server';
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway';
import { GraphQLExecutor } from 'apollo-server-core';
import * as firebaseAdmin from 'firebase-admin';
import { IncomingHttpHeaders } from 'http';
import { AphAuthenticationError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/AphErrorMessages';
import { webPatientsBaseUrl, webDoctorsBaseUrl } from '@aph/universal/aphRoutes';

declare global {
  interface Window {
    __TEST__: string;
  }
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'local' | 'development' | 'staging' | 'production';
      USE_SSL: 'true' | 'false';
      WEB_PATIENTS_HOST: string;
      WEB_PATIENTS_PORT: string;
      WEB_DOCTORS_HOST: string;
      WEB_DOCTORS_PORT: string;
      API_GATEWAY_HOST: string;
      API_GATEWAY_PORT: string;
      GOOGLE_APPLICATION_CREDENTIALS: string;
      FIREBASE_PROJECT_ID: string;
    }
  }
}

export interface GatewayContext {
  firebaseUid: string;
  mobileNumber: string;
}

export interface GatewayHeaders extends IncomingHttpHeaders {
  firebaseuid: string;
  mobilenumber: string;
}

export type Resolver<Parent, Args, Context, Result> = (
  parent: Parent,
  args: Args,
  context: Context
) => AsyncIterator<Result> | Promise<Result>;

const isLocal = process.env.NODE_ENV == 'local';
const isDev = process.env.NODE_ENV == 'development';

(async () => {
  const gateway = new ApolloGateway({
    serviceList: [
      { name: 'profiles', url: 'http://profiles-service/graphql' },
      { name: 'doctors', url: 'http://doctors-service/graphql' },
      { name: 'consults', url: 'http://consults-service/graphql' },
    ],
    buildService({ name, url }) {
      return new RemoteGraphQLDataSource({
        url,
        willSendRequest(requestContext) {
          const request = requestContext.request;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const context = (requestContext.context as any) as GatewayContext;
          if (request && request.http) {
            request.http.headers.set('mobilenumber', context.mobileNumber);
            request.http.headers.set('firebaseuid', context.firebaseUid);
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
    cors: { origin: [webDoctorsBaseUrl(), webPatientsBaseUrl()] },
    schema,
    executor,
    context: async ({ req }) => {
      const isSchemaIntrospectionQuery = req.body.operationName == 'IntrospectionQuery';

      if ((isLocal || isDev) && isSchemaIntrospectionQuery) {
        const gatewayContext: GatewayContext = { firebaseUid: '', mobileNumber: '' };
        return gatewayContext;
      }

      const jwt = req.headers.authorization || '';

      const firebaseIdToken = await firebase
        .auth()
        .verifyIdToken(jwt)
        .catch((firebaseError: firebaseAdmin.FirebaseError) => {
          throw new AphAuthenticationError(AphErrorMessages.FIREBASE_AUTH_TOKEN_ERROR);
        });

      const firebaseUser = await firebase
        .auth()
        .getUser(firebaseIdToken.uid)
        .catch((firebaseError: firebaseAdmin.FirebaseError) => {
          throw new AphAuthenticationError(AphErrorMessages.FIREBASE_GET_USER_ERROR);
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
