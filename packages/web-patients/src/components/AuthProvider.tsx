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
import { Login, LoginVariables } from 'graphql/types/Login';
import { verifyLoginOtp, verifyLoginOtpVariables } from 'graphql/types/verifyLoginOtp';
import { LOGIN_TYPE } from 'graphql/types/globalTypes';
import { clientRoutes } from 'helpers/clientRoutes';
import {
  CUSTOM_LOGIN,
  CUSTOM_LOGIN_VERIFY_OTP,
  CUSTOM_LOGIN_RESEND_OTP,
} from 'graphql/customlogin';
import { ResendOtp, ResendOtpVariables } from 'graphql/types/ResendOtp';
import { gtmTracking, _urTracking } from '../gtmTracking';
import { webengageUserLoginTracking, webengageUserLogoutTracking } from '../webEngageTracking'
// import { isTest, isFirebaseLoginTest } from 'helpers/testHelpers';
// import { ResendOtp, ResendOtpVariables } from 'graphql/types/ResendOtp';

export interface AuthContextProps {
  currentPatientId: string | null;
  setCurrentPatientId: ((pid: string | null) => void) | null;
  sendOtp: ((phoneNumber: string) => Promise<unknown>) | null;
  resendOtp: ((phoneNumber: string, loginId: string) => Promise<unknown>) | null;
  sendOtpError: boolean;
  isSendingOtp: boolean;
  verifyOtp: ((otp: string, loginId: string) => Promise<unknown>) | null;
  verifyOtpError: boolean;
  setVerifyOtpError: ((verifyOtpError: boolean) => void) | null;
  isVerifyingOtp: boolean;
  signInError: boolean;
  isSigningIn: boolean;
  hasAuthToken: boolean;
  authToken: string;
  signOut: (() => Promise<void>) | null;

  isLoginPopupVisible: boolean;
  setIsLoginPopupVisible: ((isLoginPopupVisible: boolean) => void) | null;

  customLoginId: string;

  // sendOtp: ((phoneNumber: string, captchaPlacement: HTMLElement | null) => Promise<unknown>) | null;
  // verifyOtp: ((otp: string) => void) | null;
}

const isLocal = process.env.NODE_ENV === 'local';
const isDevelopment = process.env.NODE_ENV === 'development';
const projectId = process.env.FIREBASE_PROJECT_ID;
let apolloClient: ApolloClient<any>;

export const AuthContext = React.createContext<AuthContextProps>({
  currentPatientId: null,
  setCurrentPatientId: null,

  sendOtp: null,
  resendOtp: null,
  sendOtpError: false,
  isSendingOtp: false,

  verifyOtp: null,
  verifyOtpError: false,
  setVerifyOtpError: null,
  isVerifyingOtp: false,

  signInError: false,
  isSigningIn: true,
  hasAuthToken: false,
  authToken: '',
  signOut: null,

  isLoginPopupVisible: false,
  setIsLoginPopupVisible: null,
  customLoginId: '',
});

const buildApolloClient = (authToken: string, handleUnauthenticated: () => void) => {
  const errorLink = onError((error) => {
    const { graphQLErrors, operation, forward } = error;
    if (isLocal || isDevelopment) console.error(error);
    // TrackJS.console.error(error);
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
    headers: { ...headers, Authorization: authToken ? authToken : process.env.AUTH_TOKEN },
  }));
  // const httpLink = createHttpLink({ uri: apiRoutes.graphql() });
  const httpLink = createHttpLink({ uri: process.env.API_HOST_NAME });
  const link = errorLink.concat(authLink).concat(httpLink);
  const cache = apolloClient ? apolloClient.cache : new InMemoryCache();
  return new ApolloClient({ link, cache });
};

const app = firebase.initializeApp({
  projectId,
  apiKey: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
  appId: '1:537093214409:web:4eec27a7bc6bc1c8',
  authDomain: `${projectId}.firebaseapp.com`,
  databaseURL: `https://${projectId}.firebaseio.com`,
  messagingSenderId: '537093214409',
  storageBucket: '',
});
// if (isFirebaseLoginTest()) app.auth().settings.appVerificationDisabledForTesting = true;

// let otpVerifier: firebase.auth.ConfirmationResult;

function wait<R, E>(promise: Promise<R>): [R, E] {
  return (promise.then((data: R) => [data, null], (err: E) => [null, err]) as any) as [R, E];
}

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

  const [customLoginId, setCustomLoginId] = useState<AuthContextProps['customLoginId']>('');

  const signOut = () =>
    app
      .auth()
      .signOut()
      .then(() => {
        /**Gtm code start start */
        gtmTracking({ category: 'Profile', action: 'Logout', label: 'Logout' });
        /**Gtm code start end */

        /*webengage code start */
        webengageUserLogoutTracking()
        /*webengage code end */
        localStorage.removeItem('currentUser');
        window.location.reload();
      });

  const sendOtp = async (phoneNumber: string) => {
    await apolloClient
      .mutate<Login, LoginVariables>({
        variables: {
          mobileNumber: phoneNumber,
          loginType: LOGIN_TYPE.PATIENT,
        },
        mutation: CUSTOM_LOGIN,
      })
      .then((loginResult) => {
        setIsSendingOtp(false);
        setCustomLoginId(
          loginResult &&
            loginResult.data &&
            loginResult.data.login &&
            loginResult.data.login.loginId
            ? loginResult.data.login.loginId
            : ''
        );
      })
      .catch(() => {
        setCustomLoginId('');
      });
  };

  const resendOtp = (phoneNumber: string, loginId: string) => {
    return new Promise((resolve) => {
      setVerifyOtpError(false);
      setIsSendingOtp(true);
      resendOtpApiCall(phoneNumber, loginId).then((generatedLoginId: any) => {
        setCustomLoginId(generatedLoginId ? generatedLoginId : '');
        resolve(generatedLoginId);
      });
    }).finally(() => {
      setIsSendingOtp(false);
    });
  };

  const verifyOtp = (otp: string, loginId: string) => {
    return new Promise((resolve, reject) => {
      setIsSigningIn(true);
      setIsVerifyingOtp(true);
      otpCheckApiCall(otp, loginId).then((res) => {
        // console.log('res', res);
        if (!res) {
          setVerifyOtpError(true);
          setIsSigningIn(false);
        } else {
          setVerifyOtpError(false);
          app.auth().signInWithCustomToken(res);
        }
        setIsVerifyingOtp(false);
        resolve(res);
      });
    }).finally(() => {
      setVerifyOtpError(true);
    });
  };

  const otpCheckApiCall = async (otp: string, loginId: string) => {
    const [verifyLoginOtpResult, verifyLoginOtpError] = await wait(
      apolloClient.mutate<verifyLoginOtp, verifyLoginOtpVariables>({
        variables: {
          otpVerificationInput: {
            id: loginId,
            otp: otp,
            loginType: LOGIN_TYPE.PATIENT,
          },
        },
        mutation: CUSTOM_LOGIN_VERIFY_OTP,
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
      // const logObject = {
      //   api: 'verifyLoginOtp',
      //   inputParam: JSON.stringify({
      //     id: loginId,
      //     otp: otp,
      //     loginType: LOGIN_TYPE.DOCTOR,
      //   }),
      //   currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
      //   error: `phone number is blocked for loginId: ${loginId}`,
      // };
      // sessionClient.notify(JSON.stringify(logObject));
      return false;
    } else if (verifyLoginOtpError) {
      // const logObject = {
      //   api: 'verifyLoginOtp',
      //   inputParam: JSON.stringify({
      //     id: loginId,
      //     otp: otp,
      //     loginType: LOGIN_TYPE.DOCTOR,
      //   }),
      //   currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
      //   error: JSON.stringify(verifyLoginOtpError),
      // };
      // sessionClient.notify(JSON.stringify(logObject));
      return false;
    } else {
      // const logObject = {
      //   api: 'verifyLoginOtp',
      //   inputParam: JSON.stringify({
      //     id: loginId,
      //     otp: otp,
      //     loginType: LOGIN_TYPE.DOCTOR,
      //   }),
      //   currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
      //   error: JSON.stringify(verifyLoginOtpResult),
      // };
      // sessionClient.notify(JSON.stringify(logObject));
      return false;
    }
  };

  const resendOtpApiCall = async (mobileNumber: string, loginId: string) => {
    const [resendOtpResult, resendOtpError] = await wait(
      apolloClient.mutate<ResendOtp, ResendOtpVariables>({
        variables: {
          mobileNumber: mobileNumber,
          id: loginId,
          loginType: LOGIN_TYPE.PATIENT,
        },
        mutation: CUSTOM_LOGIN_RESEND_OTP,
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
      // const logObject = {
      //   api: 'ResendOtp',
      //   inputParam: JSON.stringify({
      //     mobileNumber: mobileNumber,
      //     id: loginId,
      //     loginType: LOGIN_TYPE.DOCTOR,
      //   }),
      //   currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
      //   error: JSON.stringify(resendOtpError),
      // };
      // sessionClient.notify(JSON.stringify(logObject));
      setSendOtpError(true);
      return false;
    } else {
      // const logObject = {
      //   api: 'ResendOtp',
      //   inputParam: JSON.stringify({
      //     mobileNumber: mobileNumber,
      //     id: loginId,
      //     loginType: LOGIN_TYPE.DOCTOR,
      //   }),
      //   currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
      //   error: JSON.stringify(resendOtpResult),
      // };
      // sessionClient.notify(JSON.stringify(logObject));
      setSendOtpError(true);
      return false;
    }
  };

  useEffect(() => {
    app.auth().onAuthStateChanged(async (user) => {
      if (user) {
        /**Gtm code start */
        const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
        /**Gtm code start end */

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
          .then((res) => {
            const userId =
              res.data &&
              res.data.getCurrentPatients &&
              res.data.getCurrentPatients.patients &&
              res.data.getCurrentPatients.patients[0].id;
            /**Gtm code start */
            if (isNewUser) {
              gtmTracking({ category: 'Profile', action: 'Register / Login', label: 'Register' });
              _urTracking({ userId: userId, isApolloCustomer: false, profileFetchedCount: 1 });
            } else {
              gtmTracking({ category: 'Profile', action: 'Register / Login', label: 'Login' });
              /* webengage code start */
              webengageUserLoginTracking(user.uid)
              /* webengage code end */
            }
            /**Gtm code start end */
            setSignInError(false);
          })
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
            resendOtp,
            sendOtpError,
            isSendingOtp,

            verifyOtp,
            verifyOtpError,
            setVerifyOtpError,
            isVerifyingOtp,

            hasAuthToken,
            authToken,
            isSigningIn,
            signInError,
            signOut,

            isLoginPopupVisible,
            setIsLoginPopupVisible,

            customLoginId,
          }}
        >
          {props.children}
        </AuthContext.Provider>
      </ApolloHooksProvider>
    </ApolloProvider>
  );
};

// const loginApiCall = async (mobileNumber: string) => {
//   apolloClient
//     .mutate<Login, LoginVariables>({
//       variables: {
//         mobileNumber: mobileNumber,
//         loginType: LOGIN_TYPE.PATIENT,
//       },
//       mutation: CUSTOM_LOGIN,
//     })
//     .then((loginResult) => {
//       setIsSendingOtp(false);
//       // console.log(
//       //   'login id is....',
//       //   loginResult &&
//       //     loginResult.data &&
//       //     loginResult.data.login &&
//       //     loginResult.data.login.loginId
//       // );
//       return loginResult &&
//         loginResult.data &&
//         loginResult.data.login &&
//         loginResult.data.login.loginId
//         ? loginResult.data.login.loginId
//         : false;
//     })
//     .catch();

//   /*
//   if (
//     loginResult &&
//     loginResult.data &&
//     loginResult.data.login &&
//     loginResult.data.login.status &&
//     loginResult.data.login.loginId
//   ) {
//     console.log(loginResult, loginError, 'hello oooooooooooooooo');
//     setSendOtpError(false);
//     return loginResult.data.login.loginId;
//   } else if (loginError) {
//     // const logObject = {
//     //   api: 'Login',
//     //   inputParam: JSON.stringify({
//     //     mobileNumber: mobileNumber,
//     //     loginType: LOGIN_TYPE.PATIENT,
//     //   }),
//     //   currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
//     //   error: JSON.stringify(loginError),
//     // };
//     // sessionClient.notify(JSON.stringify(logObject));
//     setSendOtpError(true);
//     return false;
//   } else {
//     // const logObject = {
//     //   api: 'Login',
//     //   inputParam: JSON.stringify({
//     //     mobileNumber: mobileNumber,
//     //     loginType: LOGIN_TYPE.PATIENT,
//     //   }),
//     //   currentTime: moment(new Date()).format('MMMM DD YYYY h:mm:ss a'),
//     //   error: JSON.stringify(loginResult),
//     // };
//     // sessionClient.notify(JSON.stringify(logObject));
//     setSendOtpError(true);
//     return false;
//   }*/
// };

// const verifyOtp = async (otp: string) => {
//   setVerifyOtpError(false);
//   if (!otpVerifier) {
//     setSendOtpError(true);
//     return;
//   }
//   setIsVerifyingOtp(true);
//   const otpAuthResult = await otpVerifier.confirm(otp).catch((error) => {
//     setVerifyOtpError(true);
//   });
//   if (!otpAuthResult || !otpAuthResult.user) setVerifyOtpError(true);
//   setTimeout(() => {
//     setIsVerifyingOtp(false);
//   }, 700);
// };

// const sendOtp = (phoneNumber: string, captchaPlacement: HTMLElement | null) => {
//   return new Promise((resolve, reject) => {
//     setVerifyOtpError(false);
//     if (!captchaPlacement) {
//       // TrackJS.track(!captchaPlacement);
//       setSendOtpError(true);
//       reject();
//       return;
//     }
//     setIsSendingOtp(true);
//     // Create a new unique captcha every time because (apparently) captcha.clear() is flaky,
//     // and can eventually result in a 'recaptcha already assigned to this element' error.
//     const captchaContainer = document.createElement('div');
//     captchaContainer.style.display = 'none';
//     const captchaId = _uniqueId('captcha-container');
//     captchaContainer.id = captchaId;
//     captchaPlacement.parentNode!.insertBefore(captchaContainer, captchaPlacement.nextSibling);
//     const captcha = new firebase.auth.RecaptchaVerifier(captchaId, {
//       size: 'invisible',
//       callback: async () => {
//         const phoneAuthResult = await app
//           .auth()
//           .signInWithPhoneNumber(phoneNumber, captcha)
//           .catch((error) => {
//             // TrackJS.track(error);
//             setSendOtpError(true);
//             reject();
//             throw error;
//           });
//         setIsSendingOtp(false);
//         // TrackJS.track(phoneAuthResult);
//         otpVerifier = phoneAuthResult;
//         setSendOtpError(false);
//         captcha.clear();
//         resolve();
//       },
//       'expired-callback': () => {
//         setSendOtpError(true);
//         captcha.clear();
//         reject();
//       },
//     });
//     captcha.verify();
//   }).finally(() => {
//     setIsSendingOtp(false);
//   });
// };

// useEffect(() => {
//   if (isTest() && !isFirebaseLoginTest()) {
//     setAuthToken('test');
//   }
// }, []);
