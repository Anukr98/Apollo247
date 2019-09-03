import {
  GET_CURRENT_PATIENTS,
  GET_PATIENT_ADDRESS_LIST,
  SAVE_PATIENT_ADDRESS,
} from '@aph/mobile-patients/src/graphql/profiles';
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
import firebase, { RNFirebase } from 'react-native-firebase';
import {
  getPatientAddressList,
  getPatientAddressListVariables,
} from '../graphql/types/getPatientAddressList';
import { GraphQLError } from 'graphql';
import {
  savePatientAddress,
  savePatientAddressVariables,
  savePatientAddress_savePatientAddress_patientAddress,
} from '../graphql/types/savePatientAddress';
import { PatientAddressInput } from '../graphql/types/globalTypes';
import { AsyncStorage } from 'react-native';

function wait<R, E>(promise: Promise<R>): [R, E] {
  return (promise.then((data: R) => [data, null], (err: E) => [null, err]) as any) as [R, E];
}

export interface AuthContextProps {
  analytics: RNFirebase.Analytics | null;

  currentPatientId: string | null;
  setCurrentPatientId: ((pid: string | null) => void) | null;
  allPatients: ApolloQueryResult<GetCurrentPatients> | null;

  sendOtp: ((phoneNumber: string) => Promise<unknown>) | null;
  sendOtpError: boolean;
  isSendingOtp: boolean;

  verifyOtp: ((otp: string) => Promise<unknown>) | null;
  verifyOtpError: boolean;
  isVerifyingOtp: boolean;

  signInError: boolean;
  isSigningIn: boolean;
  signOut: (() => void) | null;

  hasAuthToken: boolean;

  addresses: savePatientAddress_savePatientAddress_patientAddress[];
  addAddress: ((address: PatientAddressInput) => Promise<unknown>) | null;
  selectedAddressId: string;
  setSelectedAddressId: ((id: string) => void) | null;
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

  addAddress: null,
  addresses: [],
  selectedAddressId: '',
  setSelectedAddressId: null,

  allPatients: null,
});

let apolloClient: ApolloClient<NormalizedCacheObject>;
const buildApolloClient = (authToken: string, handleUnauthenticated: () => void) => {
  console.log('buildApolloClient', authToken);
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
  const authLink = setContext((_, { headers }) => ({
    headers: { ...headers, Authorization: authToken },
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

  apolloClient = buildApolloClient(authToken, () => signOut());

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

  const [addresses, setAddresses] = useState<
    savePatientAddress_savePatientAddress_patientAddress[]
  >([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [allPatients, setAllPatients] = useState<AuthContextProps['allPatients']>(null);

  const sendOtp = (phoneNumber: string) => {
    return new Promise(async (resolve, reject) => {
      setIsSendingOtp(true);

      const [phoneAuthResult, phoneAuthError] = await wait(
        auth.signInWithPhoneNumber('+91' + phoneNumber)
      );
      setIsSendingOtp(false);
      if (phoneAuthError) {
        setSendOtpError(true);
        reject(phoneAuthError);
        return;
      }
      otpVerifier = phoneAuthResult;
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
      console.log('authprovider signOut');
    } catch (error) {
      console.log('signOut error', error);
    }
  }, [auth]);

  useEffect(() => {
    setAnalytics(firebase.analytics());
  }, [analytics]);

  useEffect(() => {
    let authStateRegistered = false;
    console.log('authprovider');

    auth.onAuthStateChanged(async (user) => {
      console.log('authprovider', authStateRegistered, user);

      if (user && !authStateRegistered) {
        console.log('authprovider login');
        setIsSigningIn(true);
        authStateRegistered = true;

        const jwt = await user.getIdToken().catch((error) => {
          setIsSigningIn(false);
          setSignInError(true);
          setAuthToken('');
          authStateRegistered = false;
          console.log('authprovider error', error);
          throw error;
        });

        console.log('authprovider jwt', jwt);

        apolloClient = buildApolloClient(jwt, () => signOut());
        authStateRegistered = false;
        setAuthToken(jwt);

        await apolloClient
          .query<GetCurrentPatients>({
            query: GET_CURRENT_PATIENTS,
            fetchPolicy: 'no-cache',
          })
          .then((data) => {
            setSignInError(false);
            console.log('data', data);
            setAllPatients(data);
          })
          .catch((error) => {
            setSignInError(true);
            console.log('error', error);
          });
      }
      setIsSigningIn(false);
    });
  }, [auth, signOut]);

  useEffect(() => {
    setTimeout(() => {
      !isSigningIn &&
        currentPatientId &&
        apolloClient
          .query<getPatientAddressList, getPatientAddressListVariables>({
            query: GET_PATIENT_ADDRESS_LIST,
            variables: { patientId: currentPatientId },
            fetchPolicy: 'no-cache',
          })
          .then(({ data: { getPatientAddressList: { addressList } } }) => {
            setAddresses(addressList!);
          })
          .catch((e: GraphQLError[]) => {
            console.log({ e });
          });
    }, 3000);
  }, [isSigningIn, currentPatientId]);

  const addAddress = (address: PatientAddressInput) => {
    return new Promise((res, rej) => {
      apolloClient
        .mutate<savePatientAddress, savePatientAddressVariables>({
          mutation: SAVE_PATIENT_ADDRESS,
          variables: { PatientAddressInput: address },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          setAddresses([data!.savePatientAddress!.patientAddress!, ...addresses]);
          res(data!.savePatientAddress!.patientAddress);
        })
        .catch((e: GraphQLError[]) => {
          rej(e);
        });
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

            addAddress,
            addresses,
            selectedAddressId,
            setSelectedAddressId,

            allPatients,
          }}
        >
          {props.children}
        </AuthContext.Provider>
      </ApolloHooksProvider>
    </ApolloProvider>
  );
};
