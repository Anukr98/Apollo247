import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { PATIENT_SIGN_IN } from 'graphql/profiles';
import { PatientSignIn, PatientSignIn_patientSignIn_patients } from 'graphql/types/PatientSignIn';
import { apiRoutes } from 'helpers/apiRoutes';
import React, { useEffect, useState } from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import { Relation } from 'graphql/types/globalTypes';
import _uniqueId from 'lodash/uniqueId';

export interface AuthContextProps<Patient = PatientSignIn_patientSignIn_patients> {
  currentPatient: Patient | null;
  allCurrentPatients: Patient[] | null;
  setCurrentPatient: ((p: Patient) => void) | null;

  sendOtp: ((phoneNumber: string, captchaPlacement: HTMLElement | null) => Promise<unknown>) | null;
  sendOtpError: boolean;
  isSendingOtp: boolean;

  verifyOtp: ((otp: string) => void) | null;
  verifyOtpError: boolean;
  isVerifyingOtp: boolean;

  signInError: boolean;
  isSigningIn: boolean;
  signOut: (() => Promise<void>) | null;

  isLoginPopupVisible: boolean;
  setIsLoginPopupVisible: ((isLoginPopupVisible: boolean) => void) | null;
}

export const AuthContext = React.createContext<AuthContextProps>({
  currentPatient: null,
  setCurrentPatient: null,
  allCurrentPatients: null,

  sendOtp: null,
  sendOtpError: false,
  isSendingOtp: false,

  verifyOtp: null,
  verifyOtpError: false,
  isVerifyingOtp: false,

  signInError: false,
  isSigningIn: true,
  signOut: null,

  isLoginPopupVisible: false,
  setIsLoginPopupVisible: null,
});

const isLocal = process.env.NODE_ENV === 'local';
const isDevelopment = process.env.NODE_ENV === 'development';

let apolloClient: ApolloClient<any>;
const buildApolloClient = (authToken: string, handleUnauthenticated: () => void) => {
  const errorLink = onError((error) => {
    const { graphQLErrors, operation, forward } = error;
    if (isLocal || isDevelopment) console.error(error);
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

let otpVerifier: firebase.auth.ConfirmationResult;

export const AuthProvider: React.FC = (props) => {
  const [authToken, setAuthToken] = useState<string>('');
  apolloClient = buildApolloClient(authToken, () => signOut());

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

  const [isLoginPopupVisible, setIsLoginPopupVisible] = useState<
    AuthContextProps['isLoginPopupVisible']
  >(false);

  const signOut = () =>
    app
      .auth()
      .signOut()
      .then(() => window.location.reload());

  const sendOtp = (phoneNumber: string, captchaPlacement: HTMLElement | null) => {
    return new Promise((resolve, reject) => {
      setVerifyOtpError(false);
      if (!captchaPlacement) {
        setSendOtpError(true);
        reject();
        return;
      }
      setIsSendingOtp(true);
      // Create a new unique captcha every time because (apparently) captcha.clear() is flaky,
      // and can eventually result in a 'recaptcha already assigned to this element' error.
      const captchaContainer = document.createElement('div');
      const captchaId = _uniqueId('captcha-container');
      captchaContainer.id = captchaId;
      captchaPlacement.parentNode!.insertBefore(captchaContainer, captchaPlacement.nextSibling);
      const captcha = new firebase.auth.RecaptchaVerifier(captchaId, {
        size: 'invisible',
        callback: async () => {
          const phoneAuthResult = await app
            .auth()
            .signInWithPhoneNumber(phoneNumber, captcha)
            .catch((error) => {
              setSendOtpError(true);
              reject();
              throw error;
            });
          setIsSendingOtp(false);
          otpVerifier = phoneAuthResult;
          setSendOtpError(false);
          captcha.clear();
          resolve();
        },
        'expired-callback': () => {
          setSendOtpError(true);
          captcha.clear();
          reject();
        },
      });
      captcha.verify();
    }).finally(() => {
      setIsSendingOtp(false);
    });
  };

  const verifyOtp = async (otp: string) => {
    if (!otpVerifier) {
      setSendOtpError(true);
      return;
    }
    setIsVerifyingOtp(true);
    const otpAuthResult = await otpVerifier.confirm(otp).catch((error) => {
      setVerifyOtpError(true);
    });
    if (!otpAuthResult) setVerifyOtpError(true);
    setIsVerifyingOtp(false);
  };

  useEffect(() => {
    app.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const jwt = await user.getIdToken().catch((error) => {
          setIsSigningIn(false);
          setSignInError(true);
          throw error;
        });
        setAuthToken(jwt);

        setIsSigningIn(true);
        const signInResult = await apolloClient
          .mutate<PatientSignIn>({ mutation: PATIENT_SIGN_IN })
          .catch((error) => {
            setSignInError(true);
            setIsSigningIn(false);
            console.error(error);
            throw error;
          });
        if (!signInResult.data || !signInResult.data.patientSignIn.patients) {
          setSignInError(true);
          setIsSigningIn(false);
          throw new Error('no data returned from sign in call');
        }
        const patients = signInResult.data.patientSignIn.patients;
        const me = patients.find((p) => p.relation === Relation.ME) || patients[0];
        setAllCurrentPatients(patients);
        setCurrentPatient(me);
        setSignInError(false);
      }
      setIsSigningIn(false);
    });
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
      <ApolloHooksProvider client={apolloClient}>
        <AuthContext.Provider
          value={{
            currentPatient,
            setCurrentPatient,
            allCurrentPatients,

            sendOtp,
            sendOtpError,
            isSendingOtp,

            verifyOtp,
            verifyOtpError,
            isVerifyingOtp,

            signInError,
            isSigningIn,
            signOut,

            isLoginPopupVisible,
            setIsLoginPopupVisible,
          }}
        >
          {props.children}
        </AuthContext.Provider>
      </ApolloHooksProvider>
    </ApolloProvider>
  );
};
