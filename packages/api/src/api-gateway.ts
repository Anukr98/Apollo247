import { ApolloServer } from 'apollo-server';
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway';
import { GraphQLExecutor } from 'apollo-server-core';
import * as firebaseAdmin from 'firebase-admin';
import { IncomingHttpHeaders } from 'http';
import { AphAuthenticationError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/AphErrorMessages';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'local' | 'dev';
      WEB_PATIENTS_PORT: string;
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
const isDev = process.env.NODE_ENV == 'dev';

const getPortStr = (port: string) => (port === '80' ? '' : `:${port}`);
const webPatientsPort = getPortStr(process.env.WEB_PATIENTS_PORT!);
const webDoctorsPort = getPortStr(process.env.WEB_DOCTORS_PORT!);
const envToCorsOrigin: Record<NodeJS.ProcessEnv['NODE_ENV'], string[]> = {
  local: [`http://localhost${webPatientsPort}`, `http://localhost${webDoctorsPort}`],
  dev: [
    'http://dev.web-patients.aph.popcornapps.com',
    'http://dev.web-doctors.aph.popcornapps.com',
  ],
};

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
    cors: { origin: envToCorsOrigin[process.env.NODE_ENV] },
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
