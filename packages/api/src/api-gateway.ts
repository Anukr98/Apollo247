import '@aph/universal/dist/global';
import { ApolloServer } from 'apollo-server';
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway';
import { GraphQLExecutor } from 'apollo-server-core';
import * as firebaseAdmin from 'firebase-admin';
import { IncomingHttpHeaders } from 'http';
import { AphAuthenticationError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { webPatientsBaseUrl, webDoctorsBaseUrl, getPortStr } from '@aph/universal/src/aphRoutes';
//import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
// import { AphMqClient, AphMqMessage, AphMqMessageTypes } from 'AphMqClient';

console.log('gateway starting');

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

(async () => {
  const gateway = new ApolloGateway({
    serviceList: [
      {
        name: 'profiles',
        url: `http://${process.env.PROFILES_SERVICE_HOST}${getPortStr(
          process.env.PROFILES_SERVICE_PORT
        )}/graphql`,
      },
      {
        name: 'doctors',
        url: `http://${process.env.DOCTORS_SERVICE_HOST}${getPortStr(
          process.env.DOCTORS_SERVICE_PORT
        )}/graphql`,
      },
      {
        name: 'consults',
        url: `http://${process.env.CONSULTS_SERVICE_HOST}${getPortStr(
          process.env.CONSULTS_SERVICE_PORT
        )}/graphql`,
      },
      {
        name: 'notifications',
        url: `http://${process.env.NOTIFICATIONS_SERVICE_HOST}${getPortStr(
          process.env.NOTIFICATIONS_SERVICE_PORT ? process.env.NOTIFICATIONS_SERVICE_PORT : '80'
        )}/graphql`,
      },
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

  const config = await gateway.load().catch((error) => {
    throw error;
  });
  const schema = config.schema;
  const executor = config.executor as GraphQLExecutor;

  const firebase = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.applicationDefault(),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  });

  const corsOrigins = [
    webPatientsBaseUrl(),
    webDoctorsBaseUrl(),
    'http://localhost:3000',
    'http://localhost:3001',
    '183.82.124.217',
    '104.211.90.216',
    '104.211.216.178',
  ];

  const server = new ApolloServer({
    cors: { origin: corsOrigins },
    schema,
    executor,
    context: async ({ req }) => {
      const isNotProduction = process.env.NODE_ENV !== 'production';
      const isSchemaIntrospectionQuery = req.body.operationName == 'IntrospectionQuery';
      if (isNotProduction && isSchemaIntrospectionQuery) {
        const gatewayContext: GatewayContext = { firebaseUid: '', mobileNumber: '' };
        return gatewayContext;
      }

      const jwt = req.headers.authorization || '';

      if (jwt.indexOf('Bearer 3d1833da7020e0602165529446587434') == 0) {
        const gatewayContext: GatewayContext = {
          firebaseUid: '',
          mobileNumber: '',
        };
        return gatewayContext;
      }

      const isLocal = process.env.NODE_ENV === 'local';
      const isFromLocalPlayground = jwt === 'FromLocalPlayground';
      if (isLocal && isFromLocalPlayground) {
        const gatewayContext: GatewayContext = {
          firebaseUid: (req.headers.firebaseuid as string) || '',
          mobileNumber: (req.headers.mobilenumber as string) || '',
        };
        return gatewayContext;
      }

      const firebaseIdToken = await firebase
        .auth()
        .verifyIdToken(jwt)
        .catch((firebaseError: firebaseAdmin.FirebaseError) => {
          throw new AphAuthenticationError(AphErrorMessages.FIREBASE_AUTH_TOKEN_ERROR);
        });

      //console.log('IDToken:::::::::::::', firebaseIdToken);

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

  server
    .listen(process.env.API_GATEWAY_PORT)
    .then(({ url }) => {
      console.log(`🚀 api gateway ready at ${url}`);
      console.log('allowed cors origins:', corsOrigins.join(','));
    })
    .catch((error) => {
      throw error;
    });
})();

/*(async () => {
  console.log('------------------------STORAGE TEST----------------------------');
  const client = new AphStorageClient(
    process.env.AZURE_STORAGE_CONNECTION_STRING_API,
    process.env.AZURE_STORAGE_CONTAINER_NAME
  );

  if (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'development') {
    console.log('deleting container...');
    await client
      .deleteContainer()
      .then((res) => console.log(res))
      .catch((error) => console.log('error deleting', error));

    console.log('setting service properties...');
    await client
      .setServiceProperties()
      .then((res) => console.log(res))
      .catch((error) => console.log('error setting service properties', error));

    console.log('creating container...');
    await client
      .createContainer()
      .then((res) => console.log('Storage test succeeded!', res))
      .catch((error) => console.log('error creating', error));
  }

  console.log('testing storage connection...');
  await client
    .testStorageConnection()
    .then((res) => console.log(res))
    .catch((error) => console.log('error testing', error));
})();*/

// (async () => {
//   console.log('------------------------MESSAGE QUEUE TEST----------------------------');

//   AphMqClient.connect();

//   type TestMessage = AphMqMessage<AphMqMessageTypes.TEST, { time: Date }>;
//   const testMessage: TestMessage = {
//     type: AphMqMessageTypes.TEST,
//     payload: {
//       time: new Date(),
//     },
//   };

//   console.log('sending message', testMessage);
//   AphMqClient.send(testMessage);

//   AphMqClient.onReceive<TestMessage>(AphMqMessageTypes.TEST, (receivedMessage) => {
//     console.log('received message!', receivedMessage.message);
//     console.log('accepting message');
//     receivedMessage.accept();
//   });
// })();
