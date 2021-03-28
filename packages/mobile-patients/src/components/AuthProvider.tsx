import {
  GET_CURRENT_PATIENTS,
  GET_PATIENTS_MOBILE,
  GET_PATIENTS_MOBILE_WITH_HISTORY,
} from '@aph/mobile-patients/src/graphql/profiles';
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
import { Platform, Alert } from 'react-native';
import firebaseAuth from '@react-native-firebase/auth';
import {
  getNetStatus,
  postWebEngageEvent,
  g,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { DEVICE_TYPE, Relation } from '../graphql/types/globalTypes';
import { GetCurrentPatientsVariables } from '../graphql/types/GetCurrentPatients';
import { AppConfig } from '../strings/AppConfig';
import {
  CommonBugFender,
  setBugFenderLog,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  getPatientByMobileNumber,
  getPatientByMobileNumberVariables,
} from '../graphql/types/getPatientByMobileNumber';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import WebEngage from 'react-native-webengage';
import AsyncStorage from '@react-native-community/async-storage';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';

function wait<R, E>(promise: Promise<R>): [R, E] {
  return (promise.then(
    (data: R) => [data, null],
    (err: E) => [null, err]
  ) as any) as [R, E];
}

export interface AuthContextProps {
  currentPatientId: string | null;
  setCurrentPatientId: ((pid: string | null) => void) | null;
  allPatients: any | null;
  setAllPatients: any | null;

  sendOtp: ((phoneNumber: string, forceResend?: boolean) => Promise<unknown>) | null;
  sendOtpError: boolean;
  isSendingOtp: boolean;

  signInError: boolean;
  isSigningIn: boolean;
  signOut: (() => void) | null;

  hasAuthToken: boolean;
  getPatientApiCall: ((containsHistory?: boolean) => Promise<unknown>) | null;
  getPatientByPrism: (() => Promise<unknown>) | null;

  mobileAPICalled: boolean;
  setMobileAPICalled: ((par: boolean) => void) | null;
  getFirebaseToken: (() => Promise<unknown>) | null;
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

  getPatientApiCall: null,
  allPatients: null,
  setAllPatients: null,

  getPatientByPrism: null,

  mobileAPICalled: false,
  setMobileAPICalled: null,

  getFirebaseToken: null,
});

let apolloClient: ApolloClient<NormalizedCacheObject>;

const knownErrors = ['NO_HUB_SLOTS', 'INVALID_ZIPCODE'];

const webengage = new WebEngage();

export const AuthProvider: React.FC = (props) => {
  const [authToken, setAuthToken] = useState<string>('');
  const hasAuthToken = !_isEmpty(authToken);

  const setNewToken = async () => {
    const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');
    if (userLoggedIn == 'true') {
      // no need to refresh jwt token on login
      try {
        firebaseAuth().onAuthStateChanged(async (user) => {
          if (user) {
            const jwt = await user.getIdToken(true).catch((error) => {
              setIsSigningIn(false);
              setSignInError(true);
              setAuthToken('');
              throw error;
            });
            setAuthToken(jwt);
          }
        });
      } catch (e) {}
    }
  };
  const validateAndUpdate = (authToken: any) => {
    if (authToken) {
      const jwtDecode = require('jwt-decode');
      const millDate = jwtDecode(authToken).exp;
      const currentTime = new Date().valueOf() / 1000;
      if (millDate < currentTime) {
        getFirebaseToken();
      } else {
        setAuthToken(authToken);
      }
    } else {
      getFirebaseToken();
    }
  };
  const buildApolloClient = (authToken: string, handleUnauthenticated: any) => {
    if (authToken) {
      const jwtDecode = require('jwt-decode');
      const millDate = jwtDecode(authToken).exp;
      const currentTime = new Date().valueOf() / 1000;
      if (millDate < currentTime) {
        setNewToken();
      }
    } else {
      setNewToken();
    }
    const errorLink = onError((error) => {
      const { graphQLErrors, operation, forward } = error;
      if (graphQLErrors) {
        const unauthenticatedError = graphQLErrors.some(
          (gqlError) => gqlError.extensions && gqlError.extensions.code === 'UNAUTHENTICATED'
        );
        if (unauthenticatedError) {
          setNewToken();
        }
      }
      //This stops multiple trigger of graphql for known errors
      if (graphQLErrors && graphQLErrors.findIndex((i) => knownErrors.includes(i.message)) > -1) {
        return;
      } else {
        return;
      }
    });
    const authLink = setContext(async (_, { headers }) => ({
      headers: {
        ...headers,
        Authorization: !authToken.length ? 'Bearer 3d1833da7020e0602165529446587434' : authToken,
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
  apolloClient = buildApolloClient(authToken, () => getFirebaseToken());

  const [currentPatientId, setCurrentPatientId] = useState<AuthContextProps['currentPatientId']>(
    null
  );

  const [isSendingOtp, setIsSendingOtp] = useState<AuthContextProps['isSendingOtp']>(false);
  const [sendOtpError, setSendOtpError] = useState<AuthContextProps['sendOtpError']>(false);

  const [isSigningIn, setIsSigningIn] = useState<AuthContextProps['isSigningIn']>(false);
  const [signInError, setSignInError] = useState<AuthContextProps['signInError']>(false);
  const [mobileAPICalled, setMobileAPICalled] = useState<AuthContextProps['signInError']>(false);

  const auth = firebaseAuth();

  const [allPatients, setAllPatients] = useState<AuthContextProps['allPatients']>(null);

  const { setSavePatientDetails, setSavePatientDetailsWithHistory } = useAppCommonData();

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
      if (auth.currentUser) {
        auth.signOut();
      }
      setAuthToken('');
      setCurrentPatientId(null);
      setAllPatients(null);
      AsyncStorage.setItem('userLoggedIn', 'false');
      AsyncStorage.removeItem('currentPatient');
      AsyncStorage.removeItem('deviceToken');
      AsyncStorage.removeItem('selectUserId');
      AsyncStorage.removeItem('callByPrism');
    } catch (error) {
      CommonBugFender('AuthProvider_signOut_try', error);
    }
  }, [auth]);

  useEffect(() => {
    async function fetchData() {
      let jwtToken: any = await AsyncStorage.getItem('jwt');
      jwtToken = JSON.parse(jwtToken || 'null');
      validateAndUpdate(jwtToken);
    }
    fetchData();
  }, [auth]);

  const getFirebaseToken = () => {
    try {
      return new Promise(async (resolve, reject) => {
        let authStateRegistered = false;
        auth.onAuthStateChanged(async (user) => {
          if (user && !authStateRegistered) {
            setIsSigningIn(true);
            authStateRegistered = true;

            const jwt = await user.getIdToken(true).catch((error) => {
              setIsSigningIn(false);
              setSignInError(true);
              setAuthToken('');
              authStateRegistered = false;
              reject(error);
              throw error;
            });

            setAuthToken(jwt);
            AsyncStorage.setItem('jwt', JSON.stringify(jwt));

            apolloClient = buildApolloClient(jwt, () => getFirebaseToken());
            authStateRegistered = false;
            resolve(jwt);
          }
          setIsSigningIn(false);
        });
      });
    } catch (error) {}
  };

  const getPatientApiCall = async (containsHistory: boolean) => {
    return new Promise(async (resolve, reject) => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
        const input = {
          mobileNumber: '+91' + storedPhoneNumber,
        };
        storedPhoneNumber &&
          apolloClient
            .query<getPatientByMobileNumber, getPatientByMobileNumberVariables>({
              query: containsHistory ? GET_PATIENTS_MOBILE_WITH_HISTORY : GET_PATIENTS_MOBILE,
              variables: input,
              fetchPolicy: 'no-cache',
            })
            .then((data) => {
              try {
                const patients = g(data, 'data', 'getPatientByMobileNumber', 'patients') || [];
                const patient = patients.find((item) => item!.relation == Relation.ME);
                const mobileNumber = g(patient, 'mobileNumber');
                mobileNumber && webengage.user.login(mobileNumber);
              } catch (error) {}

              const allPatients = g(data, 'data', 'getPatientByMobileNumber', 'patients');
              if (!containsHistory) {
                AsyncStorage.setItem('currentPatient', JSON.stringify(data));
                setSavePatientDetails && setSavePatientDetails(allPatients);
                setSignInError(false);
                AsyncStorage.setItem('callByPrism', 'false');
                setAllPatients(data);
                setMobileAPICalled(false);
              } else {
                setSavePatientDetailsWithHistory && setSavePatientDetailsWithHistory(allPatients);
              }
              resolve(data);
            })
            .catch(async (error) => {
              CommonBugFender('AuthProvider_getPatientApiCall', error);
              const retrievedItem: any = await AsyncStorage.getItem('currentPatient');
              const item = JSON.parse(retrievedItem || 'null');
              setAllPatients(item);
              setSignInError(false);
              reject(error);
            });
      } catch (error) {}
    });
  };

  const getPatientByPrism = async () => {
    try {
      return new Promise(async (resolve, reject) => {
        const deviceToken = (await AsyncStorage.getItem('deviceToken')) || '';
        const deviceToken2 = deviceToken ? JSON.parse(deviceToken) : '';
        const versionInput = {
          appVersion:
            Platform.OS === 'ios'
              ? AppConfig.Configuration.iOS_Version
              : AppConfig.Configuration.Android_Version,
          deviceType: Platform.OS === 'ios' ? DEVICE_TYPE.IOS : DEVICE_TYPE.ANDROID,
          deviceToken: deviceToken2,
          deviceOS: '',
        };

        await apolloClient
          .query<GetCurrentPatients, GetCurrentPatientsVariables>({
            query: GET_CURRENT_PATIENTS,
            variables: versionInput,
            fetchPolicy: 'no-cache',
          })
          .then((data) => {
            const eventAttributes: WebEngageEvents[WebEngageEventName.NUMBER_OF_PROFILES_FETCHED] = {
              count: g(data, 'data', 'getCurrentPatients', 'patients', 'length') || 0,
            };
            postWebEngageEvent(WebEngageEventName.NUMBER_OF_PROFILES_FETCHED, eventAttributes);

            const allPatients = g(data, 'data', 'getCurrentPatients', 'patients');
            setSavePatientDetails && setSavePatientDetails(allPatients);

            AsyncStorage.setItem('callByPrism', 'true');
            AsyncStorage.setItem('currentPatient', JSON.stringify(data));
            setMobileAPICalled(true);
            setSignInError(false);
            setAllPatients(data);
            resolve(data);
          })
          .catch(async (error) => {
            CommonBugFender('AuthProvider_getPatientByPrism', error);
            reject(error);
          });
      });
    } catch (error) {}
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

            hasAuthToken,

            allPatients,
            setAllPatients,
            getPatientApiCall,

            getPatientByPrism,
            mobileAPICalled,
            setMobileAPICalled,

            getFirebaseToken,
          }}
        >
          {props.children}
        </AuthContext.Provider>
      </ApolloHooksProvider>
    </ApolloProvider>
  );
};
