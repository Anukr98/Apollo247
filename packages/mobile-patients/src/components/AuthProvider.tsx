import {
  GET_CURRENT_PATIENTS,
  GET_PATIENTS_MOBILE,
  GET_PATIENTS_MOBILE_WITH_HISTORY,
  CHECK_DEPRECATED_APP_VERSION,
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
import { Platform, AppState, AppStateStatus } from 'react-native';
import firebaseAuth from '@react-native-firebase/auth';
import DeviceInfo from 'react-native-device-info';
import {
  getNetStatus,
  postWebEngageEvent,
  g,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { DEVICE_TYPE, Relation } from '../graphql/types/globalTypes';
import { GetCurrentPatientsVariables } from '../graphql/types/GetCurrentPatients';
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
import loggingLink from '@aph/mobile-patients/src/helpers/loggingLink';
import {
  isAppVersionDeprecated,
  isAppVersionDeprecatedVariables,
} from '@aph/mobile-patients/src/graphql/types/isAppVersionDeprecated';
const generateToken = require('jsrsasign');
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { Buffer } from 'buffer';

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
  getFirebaseToken: () => Promise<string>;
  returnAuthToken: (() => Promise<string>) | null;
  authToken: string;
  buildApolloClient: (authToken: string) => ApolloClient<NormalizedCacheObject>;
  checkIsAppDepricated: ((mobileNumber: string) => Promise<unknown>) | null;
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
  returnAuthToken: null,
  authToken: '',
  buildApolloClient: null,

  checkIsAppDepricated: null,
});

let apolloClient: ApolloClient<NormalizedCacheObject>;

const knownErrors = ['NO_HUB_SLOTS', 'INVALID_ZIPCODE'];

const webengage = new WebEngage();

export const AuthProvider: React.FC = (props) => {
  const [authToken, setAuthToken] = useState<any>('');
  const hasAuthToken = !_isEmpty(authToken);
  const auth = firebaseAuth();
  const [currentPatientId, setCurrentPatientId] = useState<AuthContextProps['currentPatientId']>(
    null
  );

  const getEventParams = async () => {
    const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');
    const phoneNumber = await AsyncStorage.getItem('phoneNumber');
    const eventParams = {
      mobileNumber: phoneNumber,
      OS: Platform?.OS,
      AppVersion: DeviceInfo.getVersion(),
      loggedIn: userLoggedIn,
    };
    return eventParams;
  };

  useEffect(() => {
    Platform.OS == 'ios' && validateAuthToken(); // App state call back is not fired when app is freshly opened on IOS
    AppState.addEventListener('change', handleAppStateChange);
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // Triggered when app is freshly started or moved from background to active state
    nextAppState == 'active' && validateAuthToken();
  };

  useEffect(() => {
    // building apolloclient when ever there is a update in authToken
    apolloClient = buildApolloClient(authToken);
  }, [authToken]);

  const validateAuthToken = async () => {
    // Called as soon as the app is opened
    const user = await auth.currentUser;
    if (user) {
      const token = await user?.getIdToken(true).catch((error) => {
        setAuthToken('');
      });
      setAuthToken(token);

      const params = await getEventParams();
      postWebEngageEvent(WebEngageEventName.AUTHTOKEN_UPDATED, params);
    } else {
      const params = await getEventParams();
      postWebEngageEvent(WebEngageEventName.NO_FIREBASE_USER, params);
    }
  };

  const [apollo247APIKey, setApollo247APIKey] = useState<any>(undefined);
  const SECRET_KEY = AppConfig.Configuration.APOLLO247_API_KEY;

  useEffect(() => {
    if (!!SECRET_KEY) {
      generateJWTToken();
    }
  }, [SECRET_KEY]);

  const generateJWTToken = async () => {
    try {
      var secretKey = Buffer.from(SECRET_KEY!).toString('base64');
      var options = { alg: 'HS256', typ: 'JWT' };
      const phoneNumber = await AsyncStorage.getItem('phoneNumber');
      var data = {
        issuer: 'Apollo247',
        origin: `Apollo247App~${Platform.OS}~${DeviceInfo.getVersion()}`,
        mobileNumber: '+91' + phoneNumber,
      };
      var token = generateToken.jws.JWS.sign(
        'HS256',
        JSON.stringify(options),
        JSON.stringify(data),
        secretKey
      );
      setApollo247APIKey(token);
    } catch (error) {}
  };

  useEffect(() => {
    // building apolloclient when ever there is a update in Apollo 247 JWT token
    apollo247APIKey && reBuildApolloClient();
  }, [apollo247APIKey]);

  const reBuildApolloClient = async () => {
    const user = await auth.currentUser;
    const token: any = await user?.getIdToken(true).catch((error) => {});
    apolloClient = buildApolloClient(token);
  };

  const buildApolloClient = (authToken: string) => {
    const errorLink = onError((error) => {
      const { graphQLErrors, operation, forward } = error;
      if (graphQLErrors) {
        const unauthenticatedError = graphQLErrors.some(
          (gqlError) => gqlError.extensions && gqlError.extensions.code === 'UNAUTHENTICATED'
        );
        if (unauthenticatedError) {
          setApollo247APIKey(undefined); // Do not pass new token
          validateAuthToken(); // re validates the firebase auth token
        }
      }
      //This stops multiple trigger of graphql for known errors
      if (graphQLErrors && graphQLErrors.findIndex((i) => knownErrors.includes(i.message)) > -1) {
        return;
      } else {
        return;
      }
    });

    const activateNewToken = AppConfig.Configuration.ACTIVATE_NEW_JWT_TOKEN;
    const authLink = setContext(async (_, { headers }) => ({
      headers: {
        ...headers,
        Authorization: !authToken.length ? 'Bearer 3d1833da7020e0602165529446587434' : authToken,
        'x-app-OS': Platform.OS,
        'x-app-version': DeviceInfo.getVersion(),
        'x-apollo247-api-key': activateNewToken && !!apollo247APIKey ? apollo247APIKey : '',
      },
    }));

    const httpLink = createHttpLink({
      uri: apiRoutes.graphql(),
    });

    const link = errorLink
      //.concat(loggingLink)  //Uncomment this inroder to enable logging
      .concat(authLink)
      .concat(httpLink);
    const cache = apolloClient ? apolloClient.cache : new InMemoryCache();
    return new ApolloClient({
      link,
      cache,
    });
  };
  apolloClient = buildApolloClient(authToken);

  const [isSendingOtp, setIsSendingOtp] = useState<AuthContextProps['isSendingOtp']>(false);
  const [sendOtpError, setSendOtpError] = useState<AuthContextProps['sendOtpError']>(false);

  const [isSigningIn, setIsSigningIn] = useState<AuthContextProps['isSigningIn']>(false);
  const [signInError, setSignInError] = useState<AuthContextProps['signInError']>(false);
  const [mobileAPICalled, setMobileAPICalled] = useState<AuthContextProps['signInError']>(false);

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

  const returnAuthToken = () => {
    return new Promise(async (resolve, reject) => {
      const user = await auth.currentUser;
      const token = await user?.getIdToken(true).catch((error) => {
        reject(null);
      });
      apolloClient = await buildApolloClient(authToken);
      resolve(token);
    });
  };

  const getFirebaseToken = () => {
    // Called on successful verfication of OTP
    // onAuthStateChanged : an event listener that fires a callback whenever there is a change in authstate of a user
    try {
      return new Promise(async (resolve, reject) => {
        // event listener: starts listening to event onAuthStateChanged
        auth.onAuthStateChanged(async (user) => {
          if (user) {
            setIsSigningIn(true);
            const jwt = await user.getIdToken(true).catch((error) => {
              setIsSigningIn(false);
              setSignInError(true);
              setAuthToken('');
              reject(error);
              throw error;
            });
            setAuthToken(jwt);
            resolve(jwt);
            const params = await getEventParams();
            postWebEngageEvent(WebEngageEventName.AUTHTOKEN_UPDATED, params);
          } else {
            const params = await getEventParams();
            postWebEngageEvent(WebEngageEventName.NO_FIREBASE_USER, params);
          }
          setIsSigningIn(false);
        });
      });
    } catch (error) {}
  };

  const checkIsAppDepricated = (mobileNumber: string) => {
    return new Promise((resolve, reject) => {
      apolloClient
        .query<isAppVersionDeprecated, isAppVersionDeprecatedVariables>({
          query: CHECK_DEPRECATED_APP_VERSION,
          variables: {
            isAppVersionDeprecatedInput: {
              os: Platform.OS == 'android' ? DEVICE_TYPE.ANDROID : DEVICE_TYPE.IOS,
              mobileNumber,
              version: DeviceInfo.getVersion(),
            },
          },
        })
        .then((data) => {
          const depricated = !data?.data?.isAppVersionDeprecated?.success;
          depricated ? resolve(data) : reject();
        })
        .catch(reject);
    });
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
            returnAuthToken,
            authToken,
            buildApolloClient,
            checkIsAppDepricated,
          }}
        >
          {props.children}
        </AuthContext.Provider>
      </ApolloHooksProvider>
    </ApolloProvider>
  );
};
