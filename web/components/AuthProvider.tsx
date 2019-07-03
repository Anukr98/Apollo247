import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { setContext } from 'apollo-link-context';
import { ErrorResponse, onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { PATIENT_SIGN_IN } from 'graphql/profiles';
import {
  PatientSignIn,
  PatientSignInVariables,
  PatientSignIn_patientSignIn_patients,
} from 'graphql/types/PatientSignIn';
import { apiRoutes } from 'helpers/apiRoutes';
import React, { useEffect, useState } from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import { Relation } from 'graphql/types/globalTypes';

export interface AuthProviderProps {
  currentPatient: PatientSignIn_patientSignIn_patients | null;
  setCurrentPatient: ((newCurrentPatient: PatientSignIn_patientSignIn_patients) => void) | null;
  loggedInPatients: PatientSignIn_patientSignIn_patients[] | null;
  isAuthenticating: boolean;
  buildCaptchaVerifier:
    | ((recaptchaContainerId: HTMLElement['id']) => firebase.auth.RecaptchaVerifier_Instance) // eslint-disable-line camelcase
    | null;
  verifyPhoneNumber:
    | ((
        mobileNumber: string,
        captchaVerifier: firebase.auth.RecaptchaVerifier_Instance | null // eslint-disable-line camelcase
      ) => ReturnType<firebase.auth.PhoneAuthProvider_Instance['verifyPhoneNumber']>) // eslint-disable-line camelcase
    | null;
  verifyOtp:
    | ((phoneNumberVerificationToken: string, otp: string) => Promise<firebase.auth.AuthCredential>)
    | null;
  signIn: ((otpVerificationToken: firebase.auth.AuthCredential) => Promise<void>) | null;
  signOut: (() => any) | null;
  loginPopupVisible: boolean;
  setLoginPopupVisible: ((loginPopupVisible: boolean) => any) | null;
  authError: boolean;
}

export const AuthContext = React.createContext<AuthProviderProps>({
  currentPatient: null,
  setCurrentPatient: null,
  loggedInPatients: null,
  isAuthenticating: true,
  buildCaptchaVerifier: null,
  verifyPhoneNumber: null,
  verifyOtp: null,
  signIn: null,
  signOut: null,
  loginPopupVisible: false,
  setLoginPopupVisible: null,
  authError: false,
});

const userIsValid = (user: firebase.User | null) => user && user.phoneNumber;

let apolloClient: ApolloClient<any>;
const buildApolloClient = (authToken: string, handleAuthError: () => void) => {
  const errorLink = onError(({ networkError, operation, forward }: ErrorResponse) => {
    // There's a bug in the apollo typedefs and `statusCode` is not recognized, but it's there
    if (networkError && (networkError as any).statusCode === 401) {
      handleAuthError();
    }
    console.log(networkError, operation);
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
  const [authError, setAuthError] = useState<AuthProviderProps['authError']>(false);
  apolloClient = buildApolloClient(authToken, () => setAuthError(true));

  const [loggedInPatients, setLoggedInPatients] = useState<AuthProviderProps['loggedInPatients']>(
    null
  );
  const [currentPatient, setCurrentPatient] = useState<AuthProviderProps['currentPatient']>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<AuthProviderProps['isAuthenticating']>(
    true
  );
  const [buildCaptchaVerifier, setBuildCaptchaVerifier] = useState<
    AuthProviderProps['buildCaptchaVerifier']
  >(null);
  const [verifyPhoneNumber, setVerifyPhoneNumber] = useState<
    AuthProviderProps['verifyPhoneNumber']
  >(null);
  const [verifyOtp, setVerifyOtp] = useState<AuthProviderProps['verifyOtp']>(null);
  const [signIn, setSignIn] = useState<AuthProviderProps['signIn']>(null);
  const [signOut, setSignOut] = useState<AuthProviderProps['signOut']>(null);
  const [loginPopupVisible, setLoginPopupVisible] = useState<
    AuthProviderProps['loginPopupVisible']
  >(false);

  useEffect(() => {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const app = firebase.initializeApp({
      projectId,
      apiKey: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
      appId: '1:537093214409:web:4eec27a7bc6bc1c8',
      authDomain: `${projectId}.firebaseapp.com`,
      databaseURL: `https://${projectId}.firebaseio.com`,
      messagingSenderId: '537093214409',
      storageBucket: '',
    });
    const auth = app.auth();

    const buildCaptchaVerifierFunc = () => (recaptchaContainerId: HTMLElement['id']) => {
      return new firebase.auth.RecaptchaVerifier(recaptchaContainerId);
    };
    setBuildCaptchaVerifier(buildCaptchaVerifierFunc);

    const verifyPhoneNumberFunc = () => (
      mobileNumber: string,
      captchaVerifier: firebase.auth.RecaptchaVerifier_Instance // eslint-disable-line camelcase
    ) => {
      const provider = new firebase.auth.PhoneAuthProvider();
      return provider.verifyPhoneNumber(mobileNumber, captchaVerifier);
    };
    setVerifyPhoneNumber(verifyPhoneNumberFunc);

    const verifyOtpFunc = () => (phoneNumberVerificationToken: string, otp: string) => {
      const otpVerificationToken = firebase.auth.PhoneAuthProvider.credential(
        phoneNumberVerificationToken,
        otp
      );
      return Promise.resolve(otpVerificationToken);
    };
    setVerifyOtp(verifyOtpFunc);

    const signInFunc = () => (otpVerificationToken: firebase.auth.AuthCredential) => {
      setIsAuthenticating(true);
      return firebase
        .auth()
        .signInWithCredential(otpVerificationToken)
        .then(() => {}); // Never expose the raw firebase user object
    };
    setSignIn(signInFunc);

    const signOutFunc = () => () => auth.signOut();
    setSignOut(signOutFunc);

    auth.onAuthStateChanged(async (updatedUser) => {
      // There is no hook to know when firebase is loading, but we know this fires when it has attempted
      // (whether automated from an existing cache or from an actual user-initiated sign in click)
      // Set the default `authenticating` value to true, and clear it out in all cases here
      if (!userIsValid(updatedUser)) {
        setLoggedInPatients(null);
        setIsAuthenticating(false);
        return;
      }

      const updatedToken = await updatedUser!.getIdToken();
      setAuthToken(updatedToken);

      const patientSignInResult = await apolloClient.mutate<PatientSignIn, PatientSignInVariables>({
        mutation: PATIENT_SIGN_IN,
        variables: { jwt: updatedToken },
      });

      // error messages.
      if (patientSignInResult.data && patientSignInResult.data.patientSignIn.errors) {
        console.log(
          'Test',
          patientSignInResult.data && patientSignInResult.data.patientSignIn.errors
        );
        setAuthError(true);
      }
      if (patientSignInResult.data && patientSignInResult.data.patientSignIn.patients) {
        const patients = patientSignInResult.data.patientSignIn.patients;
        const me = patients.find((p) => p.relation === Relation.ME) || patients[0];
        setLoggedInPatients(patients);
        setCurrentPatient(me);
      }

      setIsAuthenticating(false);
    });
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
      <ApolloHooksProvider client={apolloClient}>
        <AuthContext.Provider
          value={{
            currentPatient,
            setCurrentPatient,
            loggedInPatients,
            isAuthenticating,
            buildCaptchaVerifier,
            verifyPhoneNumber,
            verifyOtp,
            signIn,
            signOut,
            loginPopupVisible,
            setLoginPopupVisible,
            authError,
          }}
        >
          {props.children}
        </AuthContext.Provider>
      </ApolloHooksProvider>
    </ApolloProvider>
  );
};
