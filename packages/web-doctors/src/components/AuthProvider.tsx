import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient, ApolloError } from 'apollo-client';
import { setContext } from 'apollo-link-context';
import { ErrorResponse, onError } from 'apollo-link-error';
import moment from 'moment';
import { createHttpLink } from 'apollo-link-http';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import {
  GET_DOCTOR_DETAILS,
  LOGGED_IN_USER_DETAILS,
  LOGIN,
  VERIFY_LOGIN_OTP,
  RESEND_OTP,
  UPDATE_DOCTOR_ONLINE_STATUS,
} from 'graphql/profiles';
import {
  UpdateDoctorOnlineStatus,
  UpdateDoctorOnlineStatusVariables,
} from 'graphql/types/UpdateDoctorOnlineStatus';
import { LoggedInUserType, LOGIN_TYPE, DOCTOR_ONLINE_STATUS } from 'graphql/types/globalTypes';
import { Login, LoginVariables } from 'graphql/types/Login';
import { ResendOtp, ResendOtpVariables } from 'graphql/types/ResendOtp';
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
import { ApolloProvider as ApolloHooksProvider, useMutation } from 'react-apollo-hooks';
import _uniqueId from 'lodash/uniqueId';
import bugsnag from '@bugsnag/js';

const bugsnagClient = bugsnag({
  apiKey: `${process.env.BUGSNAG_API_KEY}`,
  releaseStage: `${process.env.NODE_ENV}`,
  autoBreadcrumbs: true,
  autoCaptureSessions: true,
  autoNotify: true,
});

const sessionClient = bugsnagClient.startSession();

function wait<R, E>(promise: Promise<R>): [R, E] {
  return (promise.then((data: R) => [data, null], (err: E) => [null, err]) as any) as [R, E];
}

export interface AuthContextProps<Doctor = GetDoctorDetails_getDoctorDetails> {
  currentUser: Doctor | null;
  //allCurrentPatients: Patient[] | null;
  setCurrentUser: ((p: Doctor) => void) | null;

  sendOtp: ((phoneNumber: string, loginId: string) => Promise<unknown>) | null;
  sendOtpError: boolean;
  isSendingOtp: boolean;

  //verifyOtp: ((otp: string) => void) | null;
  verifyOtp: ((otp: string, loginId: string) => Promise<unknown>) | null;
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
  sessionClient: any;
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
  sessionClient: sessionClient,
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
      Authorization: authToken ? authToken : process.env.AUTH_TOKEN,
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
    if (
      loginResult &&
      loginResult.data &&
      loginResult.data.login &&
      loginResult.data.login.status &&
      loginResult.data.login.loginId
    ) {
      setSendOtpError(false);
      return loginResult.data.login.loginId;
    } else if (loginError) {
      const logObject = {
        api: 'Login',
        inputParam: JSON.stringify({
          mobileNumber: mobileNumber,
          loginType: LOGIN_TYPE.DOCTOR,
        }),
        currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
        error: JSON.stringify(loginError),
      };
      sessionClient.notify(JSON.stringify(logObject));
      setSendOtpError(true);
      return false;
    } else {
      const logObject = {
        api: 'Login',
        inputParam: JSON.stringify({
          mobileNumber: mobileNumber,
          loginType: LOGIN_TYPE.DOCTOR,
        }),
        currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
        error: JSON.stringify(loginResult),
      };
      sessionClient.notify(JSON.stringify(logObject));
      setSendOtpError(true);
      return false;
    }
  };
  const resendOtpApiCall = async (mobileNumber: string, loginId: string) => {
    const [resendOtpResult, resendOtpError] = await wait(
      apolloClient.mutate<ResendOtp, ResendOtpVariables>({
        variables: {
          mobileNumber: mobileNumber,
          id: loginId,
          loginType: LOGIN_TYPE.DOCTOR,
        },
        mutation: RESEND_OTP,
      })
    );
    setIsSendingOtp(false);
    if (
      resendOtpResult &&
      resendOtpResult.data &&
      resendOtpResult.data.resendOtp &&
      resendOtpResult.data.resendOtp.status &&
      resendOtpResult.data.resendOtp.loginId
    ) {
      setSendOtpError(false);
      return resendOtpResult.data.resendOtp.loginId;
    } else if (resendOtpError) {
      const logObject = {
        api: 'ResendOtp',
        inputParam: JSON.stringify({
          mobileNumber: mobileNumber,
          id: loginId,
          loginType: LOGIN_TYPE.DOCTOR,
        }),
        currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
        error: JSON.stringify(resendOtpError),
      };
      sessionClient.notify(JSON.stringify(logObject));
      setSendOtpError(true);
      return false;
    } else {
      const logObject = {
        api: 'ResendOtp',
        inputParam: JSON.stringify({
          mobileNumber: mobileNumber,
          id: loginId,
          loginType: LOGIN_TYPE.DOCTOR,
        }),
        currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
        error: JSON.stringify(resendOtpResult),
      };
      sessionClient.notify(JSON.stringify(logObject));
      setSendOtpError(true);
      return false;
    }
  };
  const sendOtp = (phoneNumber: string, loginId: string) => {
    return new Promise((resolve, reject) => {
      setVerifyOtpError(false);
      localStorage.setItem('loggedInMobileNumber', phoneNumber);
      setIsSendingOtp(true);
      if (loginId && loginId !== '') {
        resendOtpApiCall(phoneNumber, loginId).then((generatedLoginId) => {
          resolve(generatedLoginId);
        });
      } else {
        loginApiCall(phoneNumber).then((generatedLoginId) => {
          resolve(generatedLoginId);
        });
      }
    }).finally(() => {
      setIsSendingOtp(false);
    });
  };
  const otpCheckApiCall = async (otp: string, loginId: string) => {
    const [verifyLoginOtpResult, verifyLoginOtpError] = await wait(
      apolloClient.mutate<verifyLoginOtp, verifyLoginOtpVariables>({
        variables: {
          otpVerificationInput: {
            id: loginId,
            otp: otp,
            loginType: LOGIN_TYPE.DOCTOR,
          },
        },
        mutation: VERIFY_LOGIN_OTP,
      })
    );
    if (
      verifyLoginOtpResult &&
      verifyLoginOtpResult.data &&
      verifyLoginOtpResult.data.verifyLoginOtp &&
      verifyLoginOtpResult.data.verifyLoginOtp.status &&
      verifyLoginOtpResult.data.verifyLoginOtp.authToken &&
      !verifyLoginOtpResult.data.verifyLoginOtp.isBlocked
    ) {
      return verifyLoginOtpResult.data.verifyLoginOtp.authToken;
    } else if (
      verifyLoginOtpResult &&
      verifyLoginOtpResult.data &&
      verifyLoginOtpResult.data.verifyLoginOtp &&
      verifyLoginOtpResult.data.verifyLoginOtp.isBlocked
    ) {
      const logObject = {
        api: 'verifyLoginOtp',
        inputParam: JSON.stringify({
          id: loginId,
          otp: otp,
          loginType: LOGIN_TYPE.DOCTOR,
        }),
        currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
        error: `phone number is blocked for loginId: ${loginId}`,
      };
      sessionClient.notify(JSON.stringify(logObject));
      return false;
    } else if (verifyLoginOtpError) {
      const logObject = {
        api: 'verifyLoginOtp',
        inputParam: JSON.stringify({
          id: loginId,
          otp: otp,
          loginType: LOGIN_TYPE.DOCTOR,
        }),
        currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
        error: JSON.stringify(verifyLoginOtpError),
      };
      sessionClient.notify(JSON.stringify(logObject));
      return false;
    } else {
      const logObject = {
        api: 'verifyLoginOtp',
        inputParam: JSON.stringify({
          id: loginId,
          otp: otp,
          loginType: LOGIN_TYPE.DOCTOR,
        }),
        currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
        error: JSON.stringify(verifyLoginOtpResult),
      };
      sessionClient.notify(JSON.stringify(logObject));
      return false;
    }
  };
  const verifyOtp = (otp: string, loginId: string) => {
    return new Promise((resolve, reject) => {
      setIsSigningIn(true);
      setIsVerifyingOtp(true);
      otpCheckApiCall(otp, loginId).then((res) => {
        if (!res) {
          setVerifyOtpError(true);
          setIsSigningIn(false);
        } else {
          setVerifyOtpError(false);
          app.auth().signInWithCustomToken(res);
        }
        setIsVerifyingOtp(false);
        resolve();
      });
    }).finally(() => {
      setVerifyOtpError(true);
    });
  };

  const signOut = () =>
    app
      .auth()
      .signOut()
      .then(() => window.location.replace('/'));

  useEffect(() => {
    getFirebaseToken();
  }, []);
  const updateDoctorOnlineStatusCall = async (doctorId: string) => {
    const [updateDoctorOnlineStatusResult, updateDoctorOnlineStatusError] = await wait(
      apolloClient.mutate<UpdateDoctorOnlineStatus, UpdateDoctorOnlineStatusVariables>({
        variables: {
          doctorId: doctorId,
          onlineStatus: DOCTOR_ONLINE_STATUS.ONLINE,
        },
        mutation: UPDATE_DOCTOR_ONLINE_STATUS,
      })
    );
    if (updateDoctorOnlineStatusResult) {
      return true;
    } else if (updateDoctorOnlineStatusError) {
      const logObject = {
        api: 'UpdateDoctorOnlineStatus',
        inputParam: JSON.stringify({
          doctorId: doctorId,
          onlineStatus: DOCTOR_ONLINE_STATUS.ONLINE,
        }),
        currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
        error: JSON.stringify(updateDoctorOnlineStatusError),
      };
      sessionClient.notify(JSON.stringify(logObject));
    } else {
      const logObject = {
        api: 'UpdateDoctorOnlineStatus',
        inputParam: JSON.stringify({
          doctorId: doctorId,
          onlineStatus: DOCTOR_ONLINE_STATUS.ONLINE,
        }),
        currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
        error: JSON.stringify(updateDoctorOnlineStatusResult),
      };
      sessionClient.notify(JSON.stringify(logObject));
      return false;
    }
  };
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
          const logObject = {
            api: 'findLoggedinUserDetails',
            currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
            error: JSON.stringify(error ? error : res),
          };
          sessionClient.notify(JSON.stringify(logObject));
          if (error) console.error(error);
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
            const logObject = {
              api: 'GetDoctorDetails',
              currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
              error: JSON.stringify(signInError ? signInError : signInResult),
            };
            sessionClient.notify(JSON.stringify(logObject));
            if (signInError) console.error(signInError);
            setSignInError(true);
            setIsSigningIn(false);
            app.auth().signOut();
            return;
          }
          const doctors = signInResult.data.getDoctorDetails;
          if (
            doctors &&
            doctors.onlineStatus === DOCTOR_ONLINE_STATUS.AWAY &&
            doctors.doctorType !== 'JUNIOR'
          ) {
            updateDoctorOnlineStatusCall(doctors.id).then((res) => {
              if (res) {
                setCurrentUser(doctors);
                setSignInError(false);
                setIsSigningIn(false);
              } else {
                alert('unable to update the status of doctor');
                app.auth().signOut();
                window.location.reload();
              }
            });
          } else {
            setCurrentUser(doctors);
            setSignInError(false);
            setIsSigningIn(false);
          }
        } else if (
          res.data &&
          res.data.findLoggedinUserDetails &&
          res.data.findLoggedinUserDetails.loggedInUserType &&
          (res.data.findLoggedinUserDetails.loggedInUserType === LoggedInUserType.JDADMIN ||
            res.data.findLoggedinUserDetails.loggedInUserType === LoggedInUserType.SECRETARY)
        ) {
          setIsSigningIn(false);
        }
      } else {
        setIsSigningIn(false);
      }
      //setIsSigningIn(false);
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
            sessionClient,
          }}
        >
          {props.children}
        </AuthContext.Provider>
      </ApolloHooksProvider>
    </ApolloProvider>
  );
};
