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

function wait<R, E>(promise: Promise<R>): [R, E] {
  return (promise.then((data: R) => [data, null], (err: E) => [null, err]) as any) as [R, E];
}

export interface AuthProviderProps<Patient> {
  currentPatient: Patient;
  allCurrentPatients: PatientSignIn_patientSignIn_patients[] | null;
  setCurrentPatient: (p: Patient) => void;

  sendOtp: (phoneNumber: string) => void;
  sendOtpError: boolean;
  isSendingOtp: boolean;

  verifyOtp: (otp: string) => void;
  verifyOtpError: boolean;
  isVerifyingOtp: boolean;

  signIn: () => void;
  signInError: boolean;
  isSigningIn: boolean;
  signOut: () => void;

  loginPopupVisible: boolean;
  setLoginPopupVisible: (loginPopupVisible: boolean) => void;
}

export const AuthContext = React.createContext<AuthProviderProps>({
  currentPatient: null,
  setCurrentPatient: null,
  allCurrentPatients: null,
  sendOtp: null,
  sendOtpError: false,
  isSendingOtp: false,
  verifyOtp: null,
  verifyOtpError: false,
  isVerifyingOtp: false,
  signIn: null,
  signInError: false,
  isSigningIn: false,
  signOut: null,
  loginPopupVisible: false,
  setLoginPopupVisible: null,
});

const userIsValid = (user: firebase.User | null) => user && user.phoneNumber;

let apolloClient: ApolloClient<any>;
const buildApolloClient = (authToken: string) => {
  const errorLink = onError(({ networkError, operation, forward }: ErrorResponse) => {
    // There's a bug in the apollo typedefs and `statusCode` is not recognized, but it's there
    if (networkError && (networkError as any).statusCode === 401) {
      console.log(networkError, operation);
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

export const AuthProvider: React.FC = (props) => {
  const [authToken, setAuthToken] = useState<string>('');
  apolloClient = buildApolloClient(authToken);

  const [loggedInPatients, setLoggedInPatients] = useState<AuthProviderProps['loggedInPatients']>(
    null
  );
  const [currentPatient, setCurrentPatient] = useState<AuthProviderProps['currentPatient']>(null);
  const [isSigningIn, setIsSigningIn] = useState<AuthProviderProps['isSigningIn']>(true);
  const [sendOtp, setSendOtp] = useState<AuthProviderProps['sendOtp']>(null);
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

    // const sendOtpFunc = () => (phoneNumber: string, signInButtonId: HTMLElement['id']) =>
    //   new Promise((resolve) => {
    //     const captcha = new firebase.auth.RecaptchaVerifier(signInButtonId, {
    //       size: 'invisible',
    //       callback: async () => {
    //         const phoneAuthResult = await app.auth().signInWithPhoneNumber(phoneNumber, captcha);
    //         const otpVerifier = (otp: string) =>
    //           new Promise(async (resolve) => {
    //             const otpAuthResult = await phoneAuthResult.confirm(otp);
    //             const user = otpAuthResult.user;
    //             if (!user) throw new Error('No user');
    //             const jwt = await user.getIdToken();
    //             return resolve(jwt);
    //           });
    //         return resolve(otpVerifier);
    //       },
    //       'expired-callback': (error) => {
    //         throw new Error(error);
    //       },
    //     });
    //   });

    let otpVerifier: (otp: string) => Promise<firebase.auth.UserCredential>;

    const sendOtpFunc = () => (phoneNumber: string, signInButtonId: HTMLElement['id']) => {
      setIsSendingOtp(true);
      const captcha = new firebase.auth.RecaptchaVerifier(signInButtonId, {
        callback: async () => {
          const [phoneAuthResult, phoneAuthError] = await wait(
            app.auth().signInWithPhoneNumber(phoneNumber, captcha)
          );
          setIsSendingOtp(false);
          if (phoneAuthError) {
            setSendOtpError(true);
            return;
          }
          otpVerifier = phoneAuthResult.confirm;
        },
        'expired-callback': () => {
          setSendOtpError(true);
          setIsSendignOtp(false);
        },
      });
    };

    const verifyOtp = () => async (otp: string) => {
      if (!otpVerifier) return setSendOtpError(true);
      setIsVerifyingOtp(true);
      const [otpAuthResult, otpError] = await wait(otpVerifier(otp));
      if (otpError) return setVerifyOtpError(true);
      if (!otpAuthResult.user) return setVerifyOtpError(true);
      setIsVerifyingOtp(false);

      setIsSigningIn(true);
      const user = otpAuthResult.user;
      const [jwt, jwtError] = await wait(user.getIdToken());
      if (jwtError) {
        setIsSigningIn(false);
        setSignInError(true);
        return;
      }

      const [signInResult, signInError] = await wait(
        apolloClient.mutate<PatientSignIn, PatientSignInVariables>({
          mutation: PATIENT_SIGN_IN,
          variables: { jwt },
        })
      );
      const patients = signInResult.data.patientSignIn.patients;
      if (signInError || !patients) {
        setSignInError(true);
        setIsSigningIn(false);
        return;
      }
      const me = patients.find((p) => p.relation === Relation.ME) || patients[0];
      setLoggedInPatients(patients);
      setCurrentPatient(me);
      setIsSigningIn(false);
    };

    // const sendOtpFunc = () => (phoneNumber: string, signInButtonId: HTMLElement['id']) =>
    //   new Promise((resolve) => {
    //     const captcha = new firebase.auth.RecaptchaVerifier(signInButtonId, {
    //       callback: async () => {
    //         const [phoneAuthResult, phoneAuthError] = await wait(
    //           app.auth().signInWithPhoneNumber(phoneNumber, captcha)
    //         );
    //         if (phoneAuthError) return reject(phoneAuthError);

    //         const otpVerifier = async (otp: string) =>
    //           new Promise(async (resolve) => {
    //             const [otpAuthResult, otpError] = await wait(phoneAuthResult.confirm(otp));
    //             if (otpError) return reject(otpError);
    //             if (!otpAuthResult.user) return reject();
    //             const user = otpAuthResult.user;
    //             const [jwt, jwtError] = await wait(user.getIdToken());
    //             if (jwtError) return reject(jwtError);
    //             return resolve(jwt);
    //           });

    //         return resolve(otpVerifier);
    //       },
    //       'expired-callback': (error) => reject(error),
    //     });
    //   });

    setSendOtp(sendOtpFunc);

    const signInToApp = () => async () => {
      setIsSigningIn(true);
      const patientSignInResult = await apolloClient.mutate<PatientSignIn, PatientSignInVariables>({
        mutation: PATIENT_SIGN_IN,
        variables: { jwt: updatedToken },
      });
      setIsSigningIn(false);
    };

    //   const buildCaptchaVerifierFunc = () => (recaptchaContainerId: HTMLElement['id']) => {
    //     return new firebase.auth.RecaptchaVerifier(recaptchaContainerId);
    //   };
    //   setBuildCaptchaVerifier(buildCaptchaVerifierFunc);

    //   const verifyPhoneNumberFunc = () => (
    //     mobileNumber: string,
    //     captchaVerifier: firebase.auth.RecaptchaVerifier_Instance // eslint-disable-line camelcase
    //   ) => {
    //     const provider = new firebase.auth.PhoneAuthProvider();
    //     return provider.verifyPhoneNumber(mobileNumber, captchaVerifier);
    //   };
    //   setVerifyPhoneNumber(verifyPhoneNumberFunc);

    //   const verifyOtpFunc = () => (phoneNumberVerificationToken: string, otp: string) => {
    //     setIsAuthenticating(true);
    //     const phoneCredential = firebase.auth.PhoneAuthProvider.credential(
    //       phoneNumberVerificationToken,
    //       otp
    //     );
    //     return auth.signInWithPhoneNumber(phoneCredential).then(() => {});
    //   };
    //   setVerifyOtp(verifyOtpFunc);

    //   const signInFunc = () => async (otpVerificationToken: firebase.auth.AuthCredential) => {
    //     const [userCredential, signInError] = await wait<
    //       firebase.auth.AuthCredential,
    //       firebase.FirebaseError
    //     >(auth.signInWithCredential(otpVerificationToken));

    //     return firebase
    //       .auth()
    //       .signInWithCredential(otpVerificationToken)
    //       .then(() => {}); // Never expose the raw firebase user object
    //   };
    //   setSignIn(signInFunc);

    //   const signOutFunc = () => () => auth.signOut();
    //   setSignOut(signOutFunc);

    //   auth.onIdTokenChanged;
    //   auth.onAuthStateChanged(async (updatedUser) => {
    //     if (!userIsValid(updatedUser)) {
    //       setLoggedInPatients(null);
    //       setIsAuthenticating(false);
    //       return;
    //     }

    //     const updatedToken = await updatedUser!.getIdToken();
    //     setAuthToken(updatedToken);

    //     const patientSignInResult = await apolloClient.mutate<PatientSignIn, PatientSignInVariables>({
    //       mutation: PATIENT_SIGN_IN,
    //       variables: { jwt: updatedToken },
    //     });

    //     // error messages.
    //     if (patientSignInResult.data && patientSignInResult.data.patientSignIn.errors) {
    //       console.log(
    //         'Test',
    //         patientSignInResult.data && patientSignInResult.data.patientSignIn.errors
    //       );
    //       setAuthError(true);
    //     }
    //     if (patientSignInResult.data && patientSignInResult.data.patientSignIn.patients) {
    //       const patients = patientSignInResult.data.patientSignIn.patients;
    //       const me = patients.find((p) => p.relation === Relation.ME) || patients[0];
    //       setLoggedInPatients(patients);
    //       setCurrentPatient(me);
    //     }

    //     setIsAuthenticating(false);
    //   });
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
            verifyOtp,
            signInToApp,
            signOut,
            isSigningIn,
            loginPopupVisible,
            setLoginPopupVisible,
          }}
        >
          {props.children}
        </AuthContext.Provider>
      </ApolloHooksProvider>
    </ApolloProvider>
  );
};
