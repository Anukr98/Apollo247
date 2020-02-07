import { GET_CURRENT_PATIENTS } from '@aph/mobile-patients/src/graphql/profiles';
import { GetCurrentPatients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import { apiRoutes } from '@aph/mobile-patients/src/helpers/apiRoutes';
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
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

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
      Authorization: authToken,
    },
  }));
  const httpLink = createHttpLink({
    uri: apiRoutes.graphql(),
  });

  const link = errorLink.concat(authLink).concat(httpLink);
  const cache = apolloClient ? apolloClient.cache : new InMemoryCache();
  return new ApolloClient({
    link,
    cache,
  });
};

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

  const [isSigningIn, setIsSigningIn] = useState<AuthContextProps['isSigningIn']>(false);
  const [signInError, setSignInError] = useState<AuthContextProps['signInError']>(false);

  const auth = firebase.auth();

  const [allPatients, setAllPatients] = useState<AuthContextProps['allPatients']>(null);

  const sendOtp = (customToken: string) => {
    return new Promise(async (resolve, reject) => {
      setIsSendingOtp(true);

      const [phoneAuthResult, phoneAuthError] = await wait(auth.signInWithCustomToken(customToken));
      setIsSendingOtp(false);
      if (phoneAuthError) {
        setSendOtpError(true);
        reject(phoneAuthError);
        return;
      }
      setSendOtpError(false);
      resolve(phoneAuthResult);
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
      CommonBugFender('AuthProvider_signOut_try', error);
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
    let authCalled = false;

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
        getNetStatus()
          .then((item) => {
            // setTimeout(() => {
            if (!authCalled) {
              authCalled = true;
              console.log('authCalled', authCalled);
              item && getPatientApiCall();
            }
            // }, 500);
          })
          .catch((e) => {
            CommonBugFender('AuthProvider_getNetStatus', e);
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
    console.log('getPatientApiCall', versionInput);

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
        CommonBugFender('AuthProvider_getPatientApiCall', error);
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
