import { ApolloServer, AuthenticationError } from 'apollo-server';
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway';
import { GraphQLExecutor } from 'apollo-server-core';
import * as firebaseAdmin from 'firebase-admin';
import { auth } from 'firebase-admin';

interface GatewayContext {
  firebaseUid: string;
  mobileNumber: string;
}

interface GatewayError {
  message: string;
}

function wait<R, E>(promise: Promise<R>): [R, E] {
  return (promise.then((data: R) => [data, null], (err: E) => [null, err]) as any) as [R, E];
}

(async () => {
  const firebase = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.applicationDefault(),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  });
  await Promise.all([firebase]);

  async function validateToken(jwt: any): Promise<GatewayContext> {
    const [firebaseIdToken, firebaseIdTokenError] = await wait<
      auth.DecodedIdToken,
      firebaseAdmin.FirebaseError
    >(firebase.auth().verifyIdToken(jwt));
    if (firebaseIdTokenError) {
      throw new AuthenticationError(`${firebaseIdTokenError.code}`);
    } else {
      const [firebaseUser, firebaseUserError] = await wait(
        firebase.auth().getUser(firebaseIdToken.uid)
      );
      if (firebaseUserError) {
        throw new AuthenticationError(firebaseUserError);
      }
      return {
        firebaseUid: firebaseIdToken.uid,
        mobileNumber: firebaseUser.phoneNumber!,
      };
    }
  }

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

  const env = process.env.NODE_ENV as 'local' | 'development';
  const port = process.env.WEB_CLIENT_PORT === '80' ? '' : `:${process.env.WEB_CLIENT_PORT}`;
  const envToCorsOrigin = {
    local: `http://localhost${port}`,
    development: '*', // 'http://patients-web.aph.popcornapps.com'
    // staging: '',
    // production: ''
  };

  const config = await gateway.load();
  const schema = config.schema;
  const executor = config.executor as GraphQLExecutor;
  const server = new ApolloServer({
    cors: { origin: envToCorsOrigin[env] },
    schema,
    executor,
    context: async ({ req }) => {
      const token = req.headers.authorization || '';
      const [firebaseData, error] = await wait<GatewayContext, GatewayError>(validateToken(token));
      if (error) {
        throw error;
      }
      return firebaseData;
    },
  });
  server.listen(process.env.API_GATEWAY_PORT).then(({ url }) => {
    console.log(`🚀 api gateway ready at ${url}`);
  });
})();
