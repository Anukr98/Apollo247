import { apiRoutes } from '@aph/mobile-patients/src/helpers/apiRoutes';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
import { LoginVariables, Login } from '@aph/mobile-patients/src/graphql/types/Login';
import {
  verifyLoginOtpVariables,
  verifyLoginOtp,
} from '@aph/mobile-patients/src/graphql/types/verifyLoginOtp';
import { LOGIN_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  VERIFY_LOGIN_OTP,
  LOGIN,
  RESEND_OTP,
  GET_OTP_ON_CALL,
} from '@aph/mobile-patients/src/graphql/profiles';
import { resendOtp, resendOtpVariables } from '@aph/mobile-patients/src/graphql/types/resendOtp';
import {
  getOTPOnCall,
  getOTPOnCallVariables,
} from '@aph/mobile-patients/src/graphql/types/getOTPOnCall';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import loggingLink from '@aph/mobile-patients/src/helpers/loggingLink';

const buildApolloClient = (authToken: string, handleUnauthenticated: () => void) => {
  const errorLink = onError((error) => {
    const { graphQLErrors, operation, forward } = error;
    if (graphQLErrors) {
      const unauthenticatedError = graphQLErrors.some(
        (gqlError) => gqlError.extensions && gqlError.extensions.code === 'UNAUTHENTICATED'
      );
      if (unauthenticatedError) {
        handleUnauthenticated();
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

  const link = errorLink
    //.concat(loggingLink) //Uncomment this to enable logging , sequence does matter 
    .concat(authLink)
    .concat(httpLink);

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

const tokenFailed = () => {};

export const loginAPI = (mobileNumber: string, appSign?: string) => {
  return new Promise((res, rej) => {
    const inputData = {
      mobileNumber: mobileNumber,
      loginType: LOGIN_TYPE.PATIENT,
      hashCode: appSign,
    };
    apolloClient
      .query<Login, LoginVariables>({
        query: LOGIN,
        fetchPolicy: 'no-cache',
        variables: inputData,
      })
      .then((data) => {
        res(data.data.login);
      })
      .catch((e) => {
        CommonBugFender('loginCalls_loginAPI', e);
        rej(e);
      });
  });
};

export const verifyOTP = (mobileNumber: string, otp: string) => {
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
        context: {
          headers: {
            'x-app-OS': Platform.OS,
            'x-app-version': DeviceInfo.getVersion(),
          },
        },
        variables: { otpVerificationInput: inputData },
      })
      .then((data) => {
        res(data.data.verifyLoginOtp);
      })
      .catch((e) => {
        CommonBugFender('loginCalls_verifyOTP', e);
        rej(e);
      });
  });
};

export const resendOTP = (mobileNumber: string, id: string) => {
  return new Promise((res, rej) => {
    const inputData = {
      mobileNumber: mobileNumber,
      loginType: LOGIN_TYPE.PATIENT,
      id: id,
    };
    apolloClient
      .query<resendOtp, resendOtpVariables>({
        query: RESEND_OTP,
        fetchPolicy: 'no-cache',
        variables: inputData,
      })
      .then((data) => {
        res(data.data.resendOtp);
      })
      .catch((e) => {
        CommonBugFender('loginCalls_resendOTP', e);
        rej(e);
      });
  });
};

export const getOtpOnCall = (mobileNumber: string, id: string) => {
  return new Promise((res, rej) => {
    const inputData = {
      mobileNumber: mobileNumber,
      loginType: LOGIN_TYPE.PATIENT,
      id: id,
    };
    apolloClient
      .query<getOTPOnCall, getOTPOnCallVariables>({
        query: GET_OTP_ON_CALL,
        fetchPolicy: 'no-cache',
        variables: inputData,
      })
      .then((data) => {
        res(data.data.getOTPOnCall);
      })
      .catch((e) => {
        CommonBugFender('getOtpOnCall_resendOTP', e);
        rej(e);
      });
  });
};
