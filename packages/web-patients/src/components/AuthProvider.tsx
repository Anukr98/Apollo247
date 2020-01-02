import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { apiRoutes } from '@aph/universal/dist/aphRoutes';
import React, { useEffect, useState } from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import _isEmpty from 'lodash/isEmpty';
import _uniqueId from 'lodash/uniqueId';
import { GetCurrentPatients } from 'graphql/types/GetCurrentPatients';
import { GET_CURRENT_PATIENTS } from 'graphql/profiles';
import { isTest, isFirebaseLoginTest } from 'helpers/testHelpers';
import { TrackJS } from 'trackjs';

export interface AuthContextProps {
  currentPatientId: string | null;
  setCurrentPatientId: ((pid: string | null) => void) | null;
  sendOtp: ((phoneNumber: string, captchaPlacement: HTMLElement | null) => Promise<unknown>) | null;
  sendOtpError: boolean;
  isSendingOtp: boolean;
  verifyOtp: ((otp: string) => void) | null;
  verifyOtpError: boolean;
  isVerifyingOtp: boolean;
  signInError: boolean;
  isSigningIn: boolean;
  hasAuthToken: boolean;
  authToken: string;
  signOut: (() => Promise<void>) | null;

  isLoginPopupVisible: boolean;
  setIsLoginPopupVisible: ((isLoginPopupVisible: boolean) => void) | null;
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

  signInError: false,
  isSigningIn: true,
  hasAuthToken: false,
  authToken: '',
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
    TrackJS.console.error(error);
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
if (isFirebaseLoginTest()) app.auth().settings.appVerificationDisabledForTesting = true;

let otpVerifier: firebase.auth.ConfirmationResult;

export const AuthProvider: React.FC = (props) => {
  const [authToken, setAuthToken] = useState<string>('');
  const hasAuthToken = !_isEmpty(authToken);
  apolloClient = buildApolloClient(authToken, () => signOut());

  const [currentPatientId, setCurrentPatientId] = useState<AuthContextProps['currentPatientId']>(
    null
  );

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
      .then(() => {
        localStorage.removeItem('currentUser');
        window.location.reload()});

  const sendOtp = (phoneNumber: string, captchaPlacement: HTMLElement | null) => {
    return new Promise((resolve, reject) => {
      setVerifyOtpError(false);
      if (!captchaPlacement) {
        TrackJS.track(!captchaPlacement);
        setSendOtpError(true);
        reject();
        return;
      }
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
          const phoneAuthResult = await app
            .auth()
            .signInWithPhoneNumber(phoneNumber, captcha)
            .catch((error) => {
              TrackJS.track(error);
              setSendOtpError(true);
              reject();
              throw error;
            });
          setIsSendingOtp(false);
          TrackJS.track(phoneAuthResult);
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
    setVerifyOtpError(false);
    if (!otpVerifier) {
      setSendOtpError(true);
      return;
    }
    setIsVerifyingOtp(true);
    const otpAuthResult = await otpVerifier.confirm(otp).catch((error) => {
      setVerifyOtpError(true);
    });
    if (!otpAuthResult || !otpAuthResult.user) setVerifyOtpError(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
    }, 700);
  };

  useEffect(() => {
    if (isTest() && !isFirebaseLoginTest()) {
      setAuthToken('test');
    }
  }, []);

  useEffect(() => {
    app.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const jwt = await user.getIdToken().catch((error) => {
          setIsSigningIn(false);
          setSignInError(true);
          setAuthToken('');
          throw error;
        });

        setAuthToken(jwt);
        apolloClient = buildApolloClient(jwt, () => signOut());

        await apolloClient
          .query<GetCurrentPatients>({ query: GET_CURRENT_PATIENTS })
          .then(() => setSignInError(false))
          .catch(() => setSignInError(true));
      }
      setIsSigningIn(false);
    });
  }, []);

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

            hasAuthToken,
            authToken,
            isSigningIn,
            signInError,
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
