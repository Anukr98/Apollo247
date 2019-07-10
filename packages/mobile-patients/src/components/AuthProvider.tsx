import firebase, { RNFirebase, AuthCredential } from 'react-native-firebase';
import React, { useState, useEffect } from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ErrorResponse, onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';

import { apiRoutes } from '@aph/mobile-patients/src/helpers/apiRoutes';
import {
  PatientSignIn,
  PatientSignInVariables,
  PatientSignIn_patientSignIn_patients,
} from '@aph/mobile-patients/src/graphql/types/PatientSignIn';
import { PATIENT_SIGN_IN, UPDATE_PATIENT } from '@aph/mobile-patients/src/graphql/profiles';
import {
  updatePatient_updatePatient_patient,
  updatePatient,
  updatePatientVariables,
} from '@aph/mobile-patients/src/graphql/types/updatePatient';
import { AsyncStorage } from 'react-native';

export type PhoneNumberVerificationCredential = RNFirebase.PhoneAuthSnapshot['verificationId'];
export type OtpVerificationCredential = AuthCredential;

export interface AuthProviderProps {
  analytics: RNFirebase.Analytics | null;
  currentUser: PatientSignIn_patientSignIn_patients | updatePatient_updatePatient_patient | null;
  currentProfiles: object | null;
  isAuthenticating: boolean;
  callApiWithToken: ((updatedToken: string) => Promise<any>) | null;
  verifyPhoneNumber: ((mobileNumber: string) => Promise<PhoneNumberVerificationCredential>) | null;
  verifyOtp:
    | ((
        token: PhoneNumberVerificationCredential,
        otp: string
      ) => Promise<OtpVerificationCredential>)
    | null;
  signIn: ((token: OtpVerificationCredential) => Promise<void>) | null;
  signOut: (() => any) | null;
  clearCurrentUser: (() => any) | null;
  callUpdatePatient: ((patientDetails: updatePatient_updatePatient_patient) => Promise<any>) | null;
  authError: boolean;
}

const userIsValid = (user: RNFirebase.User | null) => user && user.phoneNumber;

export const AuthContext = React.createContext<AuthProviderProps>({
  currentUser: null,
  isAuthenticating: true,
  verifyPhoneNumber: null,
  verifyOtp: null,
  signIn: null,
  signOut: null,
  analytics: null,
  currentProfiles: null,
  clearCurrentUser: null,
  callApiWithToken: null,
  callUpdatePatient: null,
  authError: false,
});

let apolloClient: ApolloClient<any>;
const buildApolloClient = (authToken: string, failureFunction: () => void) => {
  const errorLink = onError(({ networkError, operation, forward }: ErrorResponse) => {
    console.log(networkError, operation);
    failureFunction();
    return forward(operation);
  });
  const authLink = setContext((_, { headers }) => ({
    headers: {
      ...headers,
      Authorization: authToken,
    },
  }));
  const httpLink = createHttpLink({ uri: apiRoutes.graphql() });
  const link = errorLink.concat(authLink).concat(httpLink);
  const cache = apolloClient ? apolloClient.cache : new InMemoryCache();
  return new ApolloClient({ link, cache });
};

export const AuthProvider: React.FC = (props) => {
  const [authToken, setAuthToken] = useState<string>('');
  const [authError, setAuthError] = useState(false);
  const [authCalled, setAuthCalled] = useState<boolean>(false);
  const failureFunction = () => setAuthError(true);
  apolloClient = buildApolloClient(authToken, failureFunction);

  const [currentUser, setCurrentUser] = useState<AuthProviderProps['currentUser']>(null);
  const [currentProfiles, setcurrentProfiles] = useState<AuthProviderProps['currentProfiles']>(
    null
  );
  const [isAuthenticating, setIsAuthenticating] = useState<AuthProviderProps['isAuthenticating']>(
    true
  );
  const [verifyPhoneNumber, setVerifyPhoneNumber] = useState<
    AuthProviderProps['verifyPhoneNumber']
  >(null);
  const [verifyOtp, setVerifyOtp] = useState<AuthProviderProps['verifyOtp']>(null);
  const [signIn, setSignIn] = useState<AuthProviderProps['signIn']>(null);
  const [signOut, setSignOut] = useState<AuthProviderProps['signOut']>(null);
  const [analytics, setAnalytics] = useState<AuthProviderProps['analytics']>(null);
  const [clearCurrentUser, setClearCurrentUser] = useState<AuthProviderProps['clearCurrentUser']>(
    null
  );
  const [callApiWithToken, setCallApiWithToken] = useState<AuthProviderProps['callApiWithToken']>(
    null
  );
  const [callUpdatePatient, setCallUpdatePatient] = useState<
    AuthProviderProps['callUpdatePatient']
  >(null);
  useEffect(() => {
    setAnalytics(firebase.analytics());

    const auth = firebase.auth();

    const verifyPhoneNumberFunc = () => async (mobileNumber: string) => {
      const phoneAuthSnapshot = await auth.verifyPhoneNumber(mobileNumber);
      const phoneCredential = phoneAuthSnapshot.verificationId;
      return phoneCredential;
    };
    setVerifyPhoneNumber(verifyPhoneNumberFunc);

    const verifyOtpFunc = () => async (
      phoneCredential: PhoneNumberVerificationCredential,
      otp: string
    ) => {
      const otpCredenntial = await firebase.auth.PhoneAuthProvider.credential(phoneCredential, otp);
      return otpCredenntial;
    };
    setVerifyOtp(verifyOtpFunc);

    const signInFunc = () => (otpCredenntial: OtpVerificationCredential) => {
      setIsAuthenticating(true);
      return auth.signInWithCredential(otpCredenntial).then(() => {});
    };
    setSignIn(signInFunc);

    const signOutFunc = () => () => {
      auth.signOut();
    };
    setSignOut(signOutFunc);

    const clearCurrentUserFunc = () => () => {
      setAuthError(false);
    };
    setClearCurrentUser(clearCurrentUserFunc);

    const callAPIFunc = () => async (updatedToken: string) => {
      const patientSignInResult = await apolloClient.mutate<PatientSignIn, PatientSignInVariables>({
        mutation: PATIENT_SIGN_IN,
        variables: { jwt: updatedToken },
      });

      console.log('updatedToken', updatedToken);

      if (patientSignInResult.data && patientSignInResult.data.patientSignIn.errors) {
        const errMsg = patientSignInResult.data.patientSignIn.errors.messages[0];
        console.log(errMsg);
      }

      if (patientSignInResult.data && patientSignInResult.data.patientSignIn.patients) {
        const patient = patientSignInResult.data.patientSignIn.patients[0];
        const patientProfiles = patientSignInResult.data.patientSignIn.patients;

        setCurrentUser(patient);
        setcurrentProfiles(patientProfiles);
        setIsAuthenticating(false);
      } else {
        setCurrentUser(null);
        setcurrentProfiles(null);
        setIsAuthenticating(false);
      }

      return patientSignInResult;
    };
    setCallApiWithToken(callAPIFunc);

    const callUpdatePatientFunc = () => async (
      patientDetails: updatePatient_updatePatient_patient
    ) => {
      console.log('patientDetails', patientDetails);
      const patientUpdateResult = await apolloClient.mutate<updatePatient, updatePatientVariables>({
        mutation: UPDATE_PATIENT,
        variables: { patientInput: patientDetails },
      });

      console.log('patientUpdateResult', patientUpdateResult);

      if (patientUpdateResult.data && patientUpdateResult.data.updatePatient.patient) {
        const patient = patientUpdateResult.data.updatePatient.patient;

        setCurrentUser(patient);
        setcurrentProfiles([patient]);
      } else {
        setCurrentUser(null);
        setcurrentProfiles(null);
      }

      return patientUpdateResult;
    };
    setCallUpdatePatient(callUpdatePatientFunc);

    auth.onAuthStateChanged(async (updatedUser) => {
      // There is no hook to know when firebase is loading, but we know this fires when it has attempted
      // (whether automated from an existing cache or from an actual user-initiated sign in click)
      // Set the default `authenticating` value to true, and clear it out in all cases here
      // (but not until all the async requests here are finished )
      if (!userIsValid(updatedUser)) {
        setCurrentUser(null);
        setcurrentProfiles(null);
        setIsAuthenticating(false);
        return;
      }

      const updatedToken = await updatedUser!.getIdToken();
      setAuthToken(updatedToken);
      setIsAuthenticating(false);

      const authStateChanged = await AsyncStorage.getItem('onAuthStateChanged');
      if (authStateChanged == 'true') {
        setAuthCalled(true);
        console.log('patientUpdateResult authStateChanged');
      } else {
        if (!authCalled) {
          setAuthCalled(true);
          console.log('patientUpdateResult onAuthStateChanged', updatedToken);

          const patientSignInResult = await apolloClient.mutate<
            PatientSignIn,
            PatientSignInVariables
          >({
            mutation: PATIENT_SIGN_IN,
            variables: { jwt: updatedToken },
          });

          if (patientSignInResult.data && patientSignInResult.data.patientSignIn.patients) {
            const patient = patientSignInResult.data.patientSignIn.patients[0];
            const patientProfiles = patientSignInResult.data.patientSignIn.patients;
            setCurrentUser(patient);
            setcurrentProfiles(patientProfiles);
            setIsAuthenticating(false);
          } else {
            setCurrentUser(null);
            setcurrentProfiles(null);
            setIsAuthenticating(false);
          }
        }
      }
    });
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
      <ApolloHooksProvider client={apolloClient}>
        <AuthContext.Provider
          value={{
            authError,
            analytics,
            currentUser,
            isAuthenticating,
            verifyPhoneNumber,
            verifyOtp,
            signIn,
            signOut,
            currentProfiles,
            clearCurrentUser,
            callApiWithToken,
            callUpdatePatient,
          }}
        >
          {props.children}
        </AuthContext.Provider>
      </ApolloHooksProvider>
    </ApolloProvider>
  );
};
