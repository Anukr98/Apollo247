import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { setContext } from 'apollo-link-context';
import { ErrorResponse, onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import {
  GET_DOCTOR_DETAILS,
  LOGGED_IN_USER_DETAILS,
  LOGIN,
  VERIFY_LOGIN_OTP,
} from 'graphql/profiles';
import { LoggedInUserType, LOGIN_TYPE, OtpVerificationInput } from 'graphql/types/globalTypes';
import { Login, LoginVariables } from 'graphql/types/Login';
import { verifyLoginOtp, verifyLoginOtpVariables } from 'graphql/types/verifyLoginOtp';
import {
  GetDoctorDetails,
  GetDoctorDetails_getDoctorDetails,
  GetDoctorDetails_getDoctorDetails_doctorSecretary_secretary,
} from 'graphql/types/GetDoctorDetails';
import {
  findLoggedinUserDetails,
  findLoggedinUserDetails_findLoggedinUserDetails,
} from 'graphql/types/findLoggedinUserDetails';
import { apiRoutes } from '@aph/universal/dist/aphRoutes';
import React, { useEffect, useState } from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import _uniqueId from 'lodash/uniqueId';
import { TrackJS } from 'trackjs';

function wait<R, E>(promise: Promise<R>): [R, E] {
  return (promise.then((data: R) => [data, null], (err: E) => [null, err]) as any) as [R, E];
}

export interface AuthContextProps<Doctor = GetDoctorDetails_getDoctorDetails> {
  currentUser: Doctor | null;
  //allCurrentPatients: Patient[] | null;
  setCurrentUser: ((p: Doctor) => void) | null;

  sendOtp: ((phoneNumber: string, captchaPlacement: HTMLElement | null) => Promise<unknown>) | null;
  sendOtpError: boolean;
  isSendingOtp: boolean;

  //verifyOtp: ((otp: string) => void) | null;
  verifyOtp: ((otp: string) => Promise<unknown>) | null;
  verifyOtpError: boolean;
  isVerifyingOtp: boolean;

  signInError: boolean;
  isSigningIn: boolean;
  signOut: (() => Promise<void>) | null;

  isLoginPopupVisible: boolean;
  setIsLoginPopupVisible: ((isLoginPopupVisible: boolean) => void) | null;

  currentUserType: string | null;
  setCurrentUserType: ((p: string) => void) | null;
  currentUserId: string | null;
  setCurrentUserId: ((p: string) => void) | null;
  doctorSecretary: GetDoctorDetails_getDoctorDetails_doctorSecretary_secretary | null;
  addDoctorSecretary:
    | ((p: GetDoctorDetails_getDoctorDetails_doctorSecretary_secretary | null) => void)
    | null;
}

export const AuthContext = React.createContext<AuthContextProps>({
  currentUser: null,
  setCurrentUser: null,
  currentUserId: null,
  setCurrentUserId: null,
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

  currentUserType: null,
  setCurrentUserType: null,
  doctorSecretary: null,
  addDoctorSecretary: null,
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
      Authorization: authToken ? authToken : `Bearer 3d1833da7020e0602165529446587434`,
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

  const [currentUser, setCurrentUser] = useState<AuthContextProps['currentUser']>(null);

  const [isSendingOtp, setIsSendingOtp] = useState<AuthContextProps['isSendingOtp']>(false);
  const [sendOtpError, setSendOtpError] = useState<AuthContextProps['sendOtpError']>(false);

  const [isVerifyingOtp, setIsVerifyingOtp] = useState<AuthContextProps['isVerifyingOtp']>(false);
  const [verifyOtpError, setVerifyOtpError] = useState<AuthContextProps['verifyOtpError']>(false);

  const [isSigningIn, setIsSigningIn] = useState<AuthContextProps['isSigningIn']>(true);
  const [signInError, setSignInError] = useState<AuthContextProps['signInError']>(false);

  const [isLoginPopupVisible, setIsLoginPopupVisible] = useState<
    AuthContextProps['isLoginPopupVisible']
  >(false);

  const [currentUserType, setCurrentUserType] = useState<AuthContextProps['currentUserType']>(null);
  const [doctorSecretary, addDoctorSecretary] = useState<AuthContextProps['doctorSecretary']>(null);

  const [currentUserId, setCurrentUserId] = useState<AuthContextProps['currentUserId']>(null);
  const loginApiCall = async (mobileNumber: string) => {
    const [loginResult, loginError] = await wait(
      apolloClient.mutate<Login, LoginVariables>({
        variables: {
          mobileNumber: mobileNumber,
          loginType: LOGIN_TYPE.DOCTOR,
        },
        mutation: LOGIN,
      })
    );
    setIsSendingOtp(false);
    console.log(loginResult);
    console.log(loginError);
    if (
      loginResult &&
      loginResult.data &&
      loginResult.data.login &&
      loginResult.data.login.status
    ) {
      setSendOtpError(false);
      return true;
    } else {
      TrackJS.track(`phoneNumber: ${mobileNumber}`);
      TrackJS.track(`phoneAuthError: ${loginError}`);
      console.error(loginError);
      setSendOtpError(true);
      return false;
    }
  };
  const sendOtp = (phoneNumber: string, captchaPlacement: HTMLElement | null) => {
    return new Promise((resolve, reject) => {
      setVerifyOtpError(false);
      localStorage.setItem('loggedInMobileNumber', phoneNumber);
      setIsSendingOtp(true);
      loginApiCall(phoneNumber).then((res) => {
        resolve();
      });
    }).finally(() => {
      setIsSendingOtp(false);
    });
  };
  const otpCheckApiCall = async (otp: string) => {
    const [verifyLoginOtpResult, verifyLoginOtpError] = await wait(
      apolloClient.mutate<verifyLoginOtp, verifyLoginOtpVariables>({
        variables: {
          otpVerificationInput: {
            mobileNumber: '8686949657',
            otp: otp,
            loginType: LOGIN_TYPE.DOCTOR,
          },
        },
        mutation: VERIFY_LOGIN_OTP,
      })
    );
    //setIsSendingOtp(false);
    console.log(verifyLoginOtpResult.data);
    console.log(verifyLoginOtpError);
    if (
      verifyLoginOtpResult &&
      verifyLoginOtpResult.data &&
      verifyLoginOtpResult.data.verifyLoginOtp &&
      verifyLoginOtpResult.data.verifyLoginOtp.status
    ) {
      //setSendOtpError(false);
      return true;
    } else {
      return false;
    }
  };
  const verifyOtp = (otp: string) => {
    return new Promise((resolve, reject) => {
      setIsVerifyingOtp(true);
      otpCheckApiCall(otp).then((res) => {
        if (!res) {
          console.log(111111111);
          TrackJS.track(`otpError`);
          //setSendOtpError(true);
          setVerifyOtpError(true);
        } else {
          console.log(222222222);
          setVerifyOtpError(false);
        }
        setIsVerifyingOtp(false);
        //console.log(res);
        resolve();
      });
    }).finally(() => {
      TrackJS.track(`finally-block-otp-Error`);
      setSendOtpError(true);
      setVerifyOtpError(true);
      //setIsSendingOtp(false);
    });
    // if (!otpVerifier) {
    //   setSendOtpError(true);
    //   return;
    // }
    // setIsVerifyingOtp(true);
    // const [otpAuthResult, otpError] = await wait(otpVerifier.confirm(otp));
    // TrackJS.track(otpError);
    // setVerifyOtpError(Boolean(otpError || !otpAuthResult.user));
    // setIsVerifyingOtp(false);
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

        const [res, error] = await wait(
          apolloClient.mutate<
            findLoggedinUserDetails,
            findLoggedinUserDetails_findLoggedinUserDetails
          >({ mutation: LOGGED_IN_USER_DETAILS })
        );
        if (error || !res.data) {
          if (error) console.error(signInError);
          setSignInError(true);
          setIsSigningIn(false);
          app.auth().signOut();
          return;
        }
        if (
          res.data &&
          res.data.findLoggedinUserDetails &&
          res.data.findLoggedinUserDetails.loggedInUserType
        ) {
          setCurrentUserType(res.data.findLoggedinUserDetails.loggedInUserType);
        }
        if (
          res.data &&
          res.data.findLoggedinUserDetails &&
          res.data.findLoggedinUserDetails.loggedInUserType &&
          res.data.findLoggedinUserDetails.loggedInUserType !== LoggedInUserType.JDADMIN &&
          res.data.findLoggedinUserDetails.loggedInUserType !== LoggedInUserType.SECRETARY
        ) {
          const [signInResult, signInError] = await wait(
            apolloClient.mutate<GetDoctorDetails, GetDoctorDetails>({
              mutation: GET_DOCTOR_DETAILS,
            })
          );
          if (signInError || !signInResult.data || !signInResult.data.getDoctorDetails) {
            if (signInError) console.error(signInError);
            TrackJS.track(signInError);
            setSignInError(true);
            setIsSigningIn(false);
            app.auth().signOut();
            return;
          }
          const doctors = signInResult.data.getDoctorDetails;
          setCurrentUser(doctors);
          setSignInError(false);
        }
      }
      setIsSigningIn(false);
    });
  };
  return (
    <ApolloProvider client={apolloClient}>
      <ApolloHooksProvider client={apolloClient}>
        <AuthContext.Provider
          value={{
            currentUserType,
            setCurrentUserType,
            currentUserId,
            setCurrentUserId,
            currentUser,
            setCurrentUser,
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
            doctorSecretary,
            addDoctorSecretary,
          }}
        >
          {props.children}
        </AuthContext.Provider>
      </ApolloHooksProvider>
    </ApolloProvider>
  );
};
