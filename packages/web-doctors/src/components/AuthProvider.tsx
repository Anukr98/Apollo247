import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { setContext } from 'apollo-link-context';
import { ErrorResponse, onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { GET_DOCTOR_DETAILS } from 'graphql/profiles';
import {
  GetDoctorDetails,
  GetDoctorDetails_getDoctorDetails,
} from 'graphql/types/GetDoctorDetails';
import { apiRoutes } from '@aph/universal/dist/aphRoutes';
import React, { useEffect, useState } from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import _uniqueId from 'lodash/uniqueId';

function wait<R, E>(promise: Promise<R>): [R, E] {
  return (promise.then((data: R) => [data, null], (err: E) => [null, err]) as any) as [R, E];
}

export interface AuthContextProps<Doctor = GetDoctorDetails_getDoctorDetails> {
  currentPatient: Doctor | null;
  //allCurrentPatients: Patient[] | null;
  setCurrentPatient: ((p: Doctor) => void) | null;

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
  //allCurrentPatients: null,

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
  apolloClient = buildApolloClient(authToken, () => getFirebaseToken());

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

  const sendOtp = (phoneNumber: string, captchaPlacement: HTMLElement | null) => {
    return new Promise((resolve, reject) => {
      setVerifyOtpError(false);
      if (!captchaPlacement) {
        setSendOtpError(true);
        reject();
        return;
      }
      localStorage.setItem('loggedInMobileNumber', phoneNumber);
      setIsSendingOtp(true);
      // Create a new unique captcha every time because (apparently) captcha.clear() is flaky,
      // and can eventually result in a 'recaptcha already assigned to this element' error.
      const captchaContainer = document.createElement('div');
      captchaContainer.style.display = 'none';
      const captchaId = _uniqueId('captcha-container');
      captchaContainer.id = captchaId;
      captchaPlacement.parentNode!.insertBefore(captchaContainer, captchaPlacement.nextSibling);
      const captcha = new firebase.auth.RecaptchaVerifier(captchaId, {
        size: 'invisible',
        callback: async () => {
          const [phoneAuthResult, phoneAuthError] = await wait(
            app.auth().signInWithPhoneNumber(phoneNumber, captcha)
          );
          setIsSendingOtp(false);
          if (phoneAuthError) {
            setSendOtpError(true);
            reject();
            return;
          }
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
    const [otpAuthResult, otpError] = await wait(otpVerifier.confirm(otp));
    setVerifyOtpError(Boolean(otpError || !otpAuthResult.user));
    setIsVerifyingOtp(false);
  };

  const signOut = () =>
    app
      .auth()
      .signOut()
      .then(() => window.location.replace('/'));

  useEffect(() => {
    getFirebaseToken();
  }, []);

  const getFirebaseToken = () => {
    app.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const [jwt, jwtError] = await wait(user.getIdToken());
        if (jwtError || !jwt) {
          if (jwtError) console.error(jwtError);
          setIsSigningIn(false);
          setSignInError(true);
          app.auth().signOut();
          return;
        }
        setAuthToken(jwt);

        setIsSigningIn(true);
        const [signInResult, signInError] = await wait(
          apolloClient.mutate<GetDoctorDetails, GetDoctorDetails>({ mutation: GET_DOCTOR_DETAILS })
        );
        if (signInError || !signInResult.data || !signInResult.data.getDoctorDetails) {
          if (signInError) console.error(signInError);
          setSignInError(true);
          setIsSigningIn(false);
          app.auth().signOut();
          return;
        }
        const doctors = signInResult.data.getDoctorDetails;
        setCurrentPatient(doctors);
        setSignInError(false);
      }
      setIsSigningIn(false);
    });
  };
  return (
    <ApolloProvider client={apolloClient}>
      <ApolloHooksProvider client={apolloClient}>
        <AuthContext.Provider
          value={{
            currentPatient,
            setCurrentPatient,
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
