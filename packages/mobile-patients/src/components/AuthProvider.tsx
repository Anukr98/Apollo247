import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { setContext } from 'apollo-link-context';
import { ErrorResponse, onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
import firebase, { RNFirebase, AuthCredential } from 'react-native-firebase';
import { PATIENT_SIGN_IN } from '@aph/mobile-patients/src/graphql/profiles';
import {
  PatientSignIn,
  PatientSignInVariables,
  PatientSignIn_patientSignIn_patients,
} from '@aph/mobile-patients/src/graphql/types/PatientSignIn';
import { apiRoutes } from '@aph/mobile-patients/src/helpers/apiRoutes';
import React, { useEffect, useState } from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import { Relation } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { Alert } from 'react-native';

export type PhoneNumberVerificationCredential = RNFirebase.PhoneAuthSnapshot['verificationId'];
export type OtpVerificationCredential = AuthCredential;

function wait<R, E>(promise: Promise<R>): [R, E] {
  return (promise.then((data: R) => [data, null], (err: E) => [null, err]) as any) as [R, E];
}

export interface AuthContextProps<Patient = PatientSignIn_patientSignIn_patients> {
  analytics: RNFirebase.Analytics | null;
  currentPatient: Patient | null;
  allCurrentPatients: Patient[] | null;
  setCurrentPatient: ((p: Patient) => void) | null;

  signInWithPhoneNumber: ((phoneNumber: string | null) => Promise<unknown>) | null;
  sendOtpError: boolean;
  isSendingOtp: boolean;

  verifyOtp: ((otp: string) => Promise<unknown>) | null;
  verifyOtpError: boolean;
  isVerifyingOtp: boolean;

  signInError: boolean;
  isSigningIn: boolean;
  signOut: (() => Promise<void>) | null;

  authError: boolean;
  setAuthError: ((authError: boolean) => void) | null;

  confirmResult: RNFirebase.ConfirmationResult | null;
  authProvider: (() => Promise<unknown>) | null;
}

export const AuthContext = React.createContext<AuthContextProps>({
  currentPatient: null,
  setCurrentPatient: null,
  allCurrentPatients: null,

  signInWithPhoneNumber: null,
  sendOtpError: false,
  isSendingOtp: false,

  verifyOtp: null,
  verifyOtpError: false,
  isVerifyingOtp: false,

  signInError: false,
  isSigningIn: true,
  signOut: null,

  authError: false,
  setAuthError: null,

  analytics: null,
  confirmResult: null,
  authProvider: null,
});

let apolloClient: ApolloClient<any>;
const buildApolloClient = (authToken: string, failureFunction: () => void) => {
  const errorLink = onError(({ networkError, operation, forward }: ErrorResponse) => {
    // There's a bug in the apollo typedefs and `statusCode` is not recognized, but it's there
    if (networkError && (networkError as any).statusCode === 401) {
      console.log(networkError, operation);
    }
    failureFunction();
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

export const AuthProvider: React.FC = (props) => {
  const [authToken, setAuthToken] = useState<string>('');
  const [analytics, setAnalytics] = useState<AuthContextProps['analytics']>(null);
  const [confirmResult, setConfirmResult] = useState<AuthContextProps['confirmResult']>(null);

  const failureFunction = () => setAuthError(true);
  apolloClient = buildApolloClient(authToken, failureFunction);

  const [allCurrentPatients, setAllCurrentPatients] = useState<
    AuthContextProps['allCurrentPatients']
  >(null);
  const [currentPatient, setCurrentPatient] = useState<AuthContextProps['currentPatient']>(null);

  const [isSendingOtp, setIsSendingOtp] = useState<AuthContextProps['isSendingOtp']>(false);
  const [sendOtpError, setSendOtpError] = useState<AuthContextProps['sendOtpError']>(false);

  const [isVerifyingOtp, setIsVerifyingOtp] = useState<AuthContextProps['isVerifyingOtp']>(false);
  const [verifyOtpError, setVerifyOtpError] = useState<AuthContextProps['verifyOtpError']>(false);

  const [isSigningIn, setIsSigningIn] = useState<AuthContextProps['isSigningIn']>(true);
  const [signInError, setSignInError] = useState<AuthContextProps['signInError']>(false);

  const [authError, setAuthError] = useState<AuthContextProps['authError']>(false);

  const auth = firebase.auth();

  const signInWithPhoneNumber = (phoneNumber: string | null) => {
    return new Promise((resolve, reject) => {
      console.log('phoneNumber', phoneNumber);

      auth
        .signInWithPhoneNumber('+91' + phoneNumber)
        .then((confirmResult) => {
          console.log(confirmResult, 'confirmResult Authprovider');
          setConfirmResult(confirmResult);
          setSendOtpError(false);
          resolve(confirmResult);
        })
        .catch((error) => {
          console.log(error, 'error Authprovider');
          setSendOtpError(true);
          reject();
          Alert.alert('Error', 'The interaction was cancelled by the user.');
        });
    });
  };

  const verifyOtp = async (otp: string) => {
    return new Promise((resolve, reject) => {
      const credential = firebase.auth.PhoneAuthProvider.credential(
        confirmResult.verificationId,
        otp
      );
      console.log('credential', credential);

      auth
        .signInWithCredential(credential)
        .then((otpCredenntial) => {
          console.log('otpCredenntial verifyOtp', otpCredenntial);
          resolve(otpCredenntial);
        })
        .catch((error) => {
          console.log('error verifyOtp', error);
          reject(error);
        });
    });
  };

  const signOut = () => auth.signOut().then(() => {});

  const authProvider = async () => {
    return new Promise((resolve, reject) => {
      console.log('authProvider me');

      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const [jwt, jwtError] = await wait(user.getIdToken());
          if (jwtError || !jwt) {
            if (jwtError) console.error(jwtError);
            setIsSigningIn(false);
            setSignInError(true);
            signOut();
            return;
          }
          setAuthToken(jwt);

          setIsSigningIn(true);
          const [signInResult, signInError] = await wait(
            apolloClient.mutate<PatientSignIn, PatientSignInVariables>({
              mutation: PATIENT_SIGN_IN,
              variables: { jwt },
            })
          );
          if (signInError || !signInResult.data || !signInResult.data.patientSignIn.patients) {
            if (signInError) console.error(signInError);
            setSignInError(true);
            setIsSigningIn(false);
            signOut();
            return;
          }
          const patients = signInResult.data.patientSignIn.patients;
          const me = patients.find((p) => p.relation === Relation.ME) || patients[0];
          setAllCurrentPatients(patients);
          setCurrentPatient(me);
          setSignInError(false);
          resolve(patients);
          console.log('authProvider me', me);
        }
        setIsSigningIn(false);
        reject();
      });
    });
  };

  useEffect(() => {
    setAnalytics(firebase.analytics());
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
      <ApolloHooksProvider client={apolloClient}>
        <AuthContext.Provider
          value={{
            currentPatient,
            setCurrentPatient,
            allCurrentPatients,

            signInWithPhoneNumber,
            sendOtpError,
            isSendingOtp,

            verifyOtp,
            verifyOtpError,
            isVerifyingOtp,

            signInError,
            isSigningIn,
            signOut,

            authError,
            setAuthError,

            analytics,
            confirmResult,

            authProvider,
          }}
        >
          {props.children}
        </AuthContext.Provider>
      </ApolloHooksProvider>
    </ApolloProvider>
  );
};
