import { apiRoutes } from '@aph/mobile-patients/src/helpers/apiRoutes';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';

import { LoginVariables, Login } from '../graphql/types/Login';
import { verifyLoginOtpVariables, verifyLoginOtp } from '../graphql/types/verifyLoginOtp';

import { LOGIN_TYPE } from '../graphql/types/globalTypes';
import { VERIFY_LOGIN_OTP, LOGIN } from '../graphql/profiles';

const buildApolloClient = (authToken: string, handleUnauthenticated: () => void) => {
  const errorLink = onError((error) => {
    console.log('-------error-------', error);
    const { graphQLErrors, operation, forward } = error;
    if (graphQLErrors) {
      const unauthenticatedError = graphQLErrors.some(
        (gqlError) => gqlError.extensions && gqlError.extensions.code === 'UNAUTHENTICATED'
      );
      if (unauthenticatedError) {
        handleUnauthenticated();
        console.log('-------unauthenticatedError-------', unauthenticatedError);
      }
    }
    return forward(operation);
  });
  const authLink = setContext(async (_, { headers }) => ({
    headers: {
      ...headers,
      Authorization: 'Bearer 3d1833da7020e0602165529446587434',
    },
  }));
  const httpLink = createHttpLink({
    uri: apiRoutes.graphql(),
  });
  console.log(
    '-------loginauthToken-------',
    authToken ? authToken : 'Bearer 3d1833da7020e0602165529446587434'
  );

  const link = errorLink.concat(authLink).concat(httpLink);
  const cache = apolloClient ? apolloClient.cache : new InMemoryCache();
  return new ApolloClient({
    link,
    cache,
  });
};

const apolloClient: ApolloClient<NormalizedCacheObject> = buildApolloClient(
  'Bearer 3d1833da7020e0602165529446587434',
  () => tokenFailed()
);

const tokenFailed = () => {
  console.log('Failed');
};

export const loginAPI = (client: ApolloClient<object>, mobileNumber: string) => {
  return new Promise((res, rej) => {
    const inputData = {
      mobileNumber: mobileNumber,
      loginType: LOGIN_TYPE.PATIENT,
    };
    apolloClient
      .query<Login, LoginVariables>({
        query: LOGIN,
        fetchPolicy: 'no-cache',
        variables: inputData,
      })
      .then((data) => {
        console.log('logindata', data);
        res(data.data.login);
      })
      .catch((e) => {
        rej(e);
      });
  });
};

export const verifyOTP = (client: ApolloClient<object>, mobileNumber: string, otp: string) => {
  return new Promise((res, rej) => {
    const inputData = {
      id: mobileNumber,
      loginType: LOGIN_TYPE.PATIENT,
      otp: otp,
    };
    apolloClient
      .query<verifyLoginOtp, verifyLoginOtpVariables>({
        query: VERIFY_LOGIN_OTP,
        fetchPolicy: 'no-cache',
        variables: { otpVerificationInput: inputData },
      })
      .then((data) => {
        console.log('verifyOTPdata', data);
        res(data.data.verifyLoginOtp);
      })
      .catch((e) => {
        rej(e);
      });
  });
};
