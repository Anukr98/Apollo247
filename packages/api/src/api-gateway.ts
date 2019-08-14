import '@aph/universal/dist/global';
import { ApolloServer } from 'apollo-server';
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway';
import { GraphQLExecutor } from 'apollo-server-core';
import * as firebaseAdmin from 'firebase-admin';
import { IncomingHttpHeaders } from 'http';
import { AphAuthenticationError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { webPatientsBaseUrl, webDoctorsBaseUrl, protocol } from '@aph/universal/dist/aphRoutes';
//import { AphMqClient, AphMqMessage, AphMqMessageTypes } from 'AphMqClient';

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
      { name: 'profiles', url: `${protocol}://${process.env.PROFILES_SERVICE_HOST}/graphql` },
      { name: 'doctors', url: `${protocol}://${process.env.DOCTORS_SERVICE_HOST}/graphql` },
      { name: 'consults', url: `${protocol}://${process.env.CONSULTS_SERVICE_HOST}/graphql` },
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
    cors: { origin: [webDoctorsBaseUrl(), webPatientsBaseUrl(), 'http://localhost:3001'] },
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

  /*console.log('------------------------MESSAGE QUEUE TEST----------------------------');

  AphMqClient.connect();

  type TestMessage = AphMqMessage<AphMqMessageTypes.TEST, { time: Date }>;
  const testMessage: TestMessage = {
    type: AphMqMessageTypes.TEST,
    payload: {
      time: new Date(),
    },
  };

  console.log('sending message', testMessage);
  AphMqClient.send(testMessage);

  AphMqClient.onReceive<TestMessage>(AphMqMessageTypes.TEST, (receivedMessage) => {
    console.log('received message!', receivedMessage.message);
    console.log('accepting message');
    receivedMessage.accept();
  });*/
})();
