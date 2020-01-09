import { GET_CURRENT_PATIENTS } from '@aph/mobile-patients/src/graphql/profiles';
import { GetCurrentPatients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import { apiRoutes } from '@aph/mobile-patients/src/helpers/apiRoutes';
// import { apiRoutes } from '@aph/universal/dist/aphRoutes';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient, ApolloQueryResult } from 'apollo-client';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
import _isEmpty from 'lodash/isEmpty';
import React, { useCallback, useEffect, useState } from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import { AsyncStorage, Platform } from 'react-native';
import firebase, { RNFirebase } from 'react-native-firebase';
import { getNetStatus } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { DEVICE_TYPE } from '../graphql/types/globalTypes';
import { GetCurrentPatientsVariables } from '../graphql/types/GetCurrentPatients';
import { AppConfig } from '../strings/AppConfig';

function wait<R, E>(promise: Promise<R>): [R, E] {
  return (promise.then(
    (data: R) => [data, null],
    (err: E) => [null, err]
  ) as any) as [R, E];
}

export interface AuthContextProps {
  analytics: RNFirebase.Analytics | null;

  currentPatientId: string | null;
  setCurrentPatientId: ((pid: string | null) => void) | null;
  allPatients: ApolloQueryResult<GetCurrentPatients> | null;

  sendOtp: ((phoneNumber: string, forceResend?: boolean) => Promise<unknown>) | null;
  sendOtpError: boolean;
  isSendingOtp: boolean;

  verifyOtp: ((otp: string) => Promise<unknown>) | null;
  verifyOtpError: boolean;
  isVerifyingOtp: boolean;

  signInError: boolean;
  isSigningIn: boolean;
  signOut: (() => void) | null;

  hasAuthToken: boolean;
  getPatientApiCall: (() => void) | null;
}

export const AuthContext = React.createContext<AuthContextProps>({
  currentPatientId: null,
  setCurrentPatientId: null,

  sendOtp: null,
  sendOtpError: false,
  isSendingOtp: false,

  verifyOtp: null,
  verifyOtpError: false,
  isVerifyingOtp: false,
  hasAuthToken: false,
  signInError: false,
  isSigningIn: true,
  signOut: null,

  analytics: null,

  getPatientApiCall: null,
  allPatients: null,
});

let apolloClient: ApolloClient<NormalizedCacheObject>;
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
      Authorization: authToken ? authToken : 'Bearer 3d1833da7020e0602165529446587434',
    },
    // headers: { ...headers, Authorization: 'Bearer 3d1833da7020e0602165529446587434' },
  }));
  const httpLink = createHttpLink({ uri: apiRoutes.graphql() });
  const link = errorLink.concat(authLink).concat(httpLink);
  const cache = apolloClient ? apolloClient.cache : new InMemoryCache();
  return new ApolloClient({ link, cache });
};

let otpVerifier: RNFirebase.ConfirmationResult;

export const AuthProvider: React.FC = (props) => {
  const [authToken, setAuthToken] = useState<string>('');
  const hasAuthToken = !_isEmpty(authToken);

  const [analytics, setAnalytics] = useState<AuthContextProps['analytics']>(null);

  apolloClient = buildApolloClient(authToken, () => getFirebaseToken());

  const [currentPatientId, setCurrentPatientId] = useState<AuthContextProps['currentPatientId']>(
    null
  );

  const [isSendingOtp, setIsSendingOtp] = useState<AuthContextProps['isSendingOtp']>(false);
  const [sendOtpError, setSendOtpError] = useState<AuthContextProps['sendOtpError']>(false);

  const [isVerifyingOtp, setIsVerifyingOtp] = useState<AuthContextProps['isVerifyingOtp']>(false);
  const [verifyOtpError, setVerifyOtpError] = useState<AuthContextProps['verifyOtpError']>(false);

  const [isSigningIn, setIsSigningIn] = useState<AuthContextProps['isSigningIn']>(false);
  const [signInError, setSignInError] = useState<AuthContextProps['signInError']>(false);

  const auth = firebase.auth();

  const [allPatients, setAllPatients] = useState<AuthContextProps['allPatients']>(null);

  // const sendOtp = (phoneNumber: string, forceResend: boolean = false) => {
  //   return new Promise(async (resolve, reject) => {
  //     setIsSendingOtp(true);

  //     const [phoneAuthResult, phoneAuthError] = await wait(
  //       auth.signInWithPhoneNumber('+91' + phoneNumber, forceResend)
  //     );
  //     setIsSendingOtp(false);
  //     if (phoneAuthError) {
  //       setSendOtpError(true);
  //       reject(phoneAuthError);
  //       return;
  //     }
  //     otpVerifier = phoneAuthResult;
  //     setSendOtpError(false);
  //     resolve(phoneAuthResult);
  //   });
  // };

  const sendOtp = (phoneNumber: string, forceResend: boolean = false) => {
    return new Promise(async (resolve, reject) => {
      setIsSendingOtp(true);

      const [phoneAuthResult, phoneAuthError] = await wait(
        // auth.signInWithPhoneNumber('+91' + phoneNumber, forceResend)
        auth.signInWithCustomToken(
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTU3ODU3NDg3NywiZXhwIjoxNTc4NTc4NDc3LCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay1pdGJiaEBhcG9sbG8tcGF0aWVudC1pbnRlcmZhY2UuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCJzdWIiOiJmaXJlYmFzZS1hZG1pbnNkay1pdGJiaEBhcG9sbG8tcGF0aWVudC1pbnRlcmZhY2UuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCJ1aWQiOiIrOTE5MDUyOTU5NTI3IiwiY2xhaW1zIjp7InBob25lTnVtYmVyIjoiKzkxOTA1Mjk1OTUyNyJ9fQ.lZHC21UDLN8VBcmQgUQQrMzllUjfsRw4ttzkciCsMnQK6kSp3qO3rYfl8S0zG4CQptAEpZ3SJ4kfr3cw5YrBo86odYbAzp1xHUEUTCFff97ppS2l-PccJEZpxRBaFi8riu1Tko_uAgq6949xEW6fzPQ2eFf__qFtFogyHS3KM87sckGpI5_G2kwYjHRO5Ecwp58qAoiB9AfEKMfUVYKoEUAaf8aVgR9Al2rCuwxTSJ_MCSrzGi6DQ5vT2MS85NzyVa6w7mQh1DnEx4WobRlUEjy4i79NFiTPz5TqWe2qurCDZN3-cGGzrXM5viDAnR2tXhv10S9JF7Kr77kmdVSKLw'
        )
      );
      setIsSendingOtp(false);
      if (phoneAuthError) {
        setSendOtpError(true);
        reject(phoneAuthError);
        return;
      }
      // otpVerifier = phoneAuthResult;
      setSendOtpError(false);
      resolve(phoneAuthResult);
    });
  };

  const verifyOtp = async (otp: string) => {
    return new Promise(async (resolve, reject) => {
      if (!otpVerifier) {
        setSendOtpError(true);
        reject();
        return;
      }
      setIsVerifyingOtp(true);
      const [otpAuthResult, otpError] = await wait(otpVerifier.confirm(otp));
      setVerifyOtpError(Boolean(otpError || !otpAuthResult));
      if (otpAuthResult) {
        // console.log('otpAuthResult', otpAuthResult);
        resolve(otpAuthResult);
      } else {
        reject(otpError);
      }
      setIsVerifyingOtp(false);
    });
  };

  const signOut = useCallback(() => {
    try {
      auth.signOut();
      setAuthToken('');
      setCurrentPatientId(null);
      setAllPatients(null);
      AsyncStorage.setItem('userLoggedIn', 'false');
      AsyncStorage.removeItem('currentPatient');
      AsyncStorage.removeItem('deviceToken');
      AsyncStorage.removeItem('selectUserId');
      console.log('authprovider signOut');
    } catch (error) {
      console.log('signOut error', error);
    }
  }, [auth]);

  useEffect(() => {
    setAnalytics(firebase.analytics());
  }, [analytics]);

  useEffect(() => {
    getFirebaseToken();
  }, [auth]);

  const getFirebaseToken = () => {
    let authStateRegistered = false;
    console.log('authprovider');

    auth.onAuthStateChanged(async (user) => {
      console.log('authprovider', authStateRegistered, user);

      if (user && !authStateRegistered) {
        console.log('authprovider login');
        setIsSigningIn(true);
        authStateRegistered = true;

        const jwt = await user.getIdToken(true).catch((error) => {
          setIsSigningIn(false);
          setSignInError(true);
          setAuthToken('');
          authStateRegistered = false;
          console.log('authprovider error', error);
          throw error;
        });

        console.log('authprovider jwt', jwt);
        setAuthToken(jwt);

        apolloClient = buildApolloClient(jwt, () => getFirebaseToken());
        authStateRegistered = false;
        setAuthToken(jwt);
        getNetStatus().then((item) => {
          item && getPatientApiCall();
        });
      }
      setIsSigningIn(false);
    });
  };

  const getPatientApiCall = async () => {
    const versionInput = {
      appVersion:
        Platform.OS === 'ios'
          ? AppConfig.Configuration.iOS_Version
          : AppConfig.Configuration.Android_Version,
      deviceType: Platform.OS === 'ios' ? DEVICE_TYPE.IOS : DEVICE_TYPE.ANDROID,
    };
    await apolloClient
      .query<GetCurrentPatients, GetCurrentPatientsVariables>({
        query: GET_CURRENT_PATIENTS,
        variables: versionInput,
        fetchPolicy: 'no-cache',
      })
      .then((data) => {
        setSignInError(false);
        console.log('getPatientApiCall', data);
        AsyncStorage.setItem('currentPatient', JSON.stringify(data));
        setAllPatients(data);
      })
      .catch(async (error) => {
        const retrievedItem: any = await AsyncStorage.getItem('currentPatient');
        const item = JSON.parse(retrievedItem);
        setAllPatients(item);
        setSignInError(false);
        console.log('getPatientApiCallerror', error);
      });
  };

  return (
    <ApolloProvider client={apolloClient}>
      <ApolloHooksProvider client={apolloClient}>
        <AuthContext.Provider
          value={{
            currentPatientId,
            setCurrentPatientId,

            sendOtp,
            sendOtpError,
            isSendingOtp,

            verifyOtp,
            verifyOtpError,
            isVerifyingOtp,

            signInError,
            isSigningIn,
            signOut,

            analytics,
            hasAuthToken,

            allPatients,
            getPatientApiCall,
          }}
        >
          {props.children}
        </AuthContext.Provider>
      </ApolloHooksProvider>
    </ApolloProvider>
  );
};
