import * as firebase from 'firebase/app';
import 'firebase/auth';
import React, { useState, useEffect } from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import jsCookie from 'js-cookie';

import { apiRoutes } from 'helpers/apiRoutes';

export interface AuthProviderProps {
  currentUser: any | null;
  signIn: (() => Promise<void>) | null;
  signOut: (() => any) | null;
  authenticating: boolean;
  sendOtp:
    | ((mobileNumber: string, recaptchaContainerId: HTMLElement['id']) => Promise<void>)
    | null;
  verifyOtp: ((otp: string) => void) | null;
}

export const AuthContext = React.createContext<AuthProviderProps>({
  currentUser: null,
  signIn: null,
  signOut: null,
  authenticating: true,
  sendOtp: null,
  verifyOtp: null,
});

const userIsValid = (user: firebase.User | null) => user && user.phoneNumber;

let apolloClient: ApolloClient<any>;
const buildApolloClient = (authToken: string) => {
  const authLink = setContext((_, { headers }) => ({
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: authToken,
    },
  }));
  const httpLink = createHttpLink({ uri: apiRoutes.graphql() });
  const link = authLink.concat(httpLink);
  const cache = apolloClient ? apolloClient.cache : new InMemoryCache();
  return new ApolloClient({ link, cache });
};

let verificationId;

export const AuthProvider: React.FC = (props) => {
  const [currentUser, setCurrentUser] = useState<AuthProviderProps['currentUser']>(null);
  const [signIn, setSignIn] = useState<AuthProviderProps['signIn']>(null);
  const [signOut, setSignOut] = useState<AuthProviderProps['signOut']>(null);
  const [sendOtp, setSendOtp] = useState<AuthProviderProps['sendOtp']>(null);
  const [verifyOtp, setVerifyOtp] = useState<AuthProviderProps['verifyOtp']>(null);
  const [authenticating, setAuthenticating] = useState<AuthProviderProps['authenticating']>(true);

  const [authToken, setAuthToken] = useState<string>('');
  apolloClient = buildApolloClient(authToken);

  // var applicationVerifier = new firebase.auth.RecaptchaVerifier(
  //     'recaptcha-container');
  // var provider = new firebase.auth.PhoneAuthProvider();
  // provider.verifyPhoneNumber('+16505550101', applicationVerifier)
  //     .then(function(verificationId) {
  //       var verificationCode = window.prompt('Please enter the verification code that was sent to your mobile device.');
  //       return firebase.auth.PhoneAuthProvider.credential(verificationId, verificationCode)
  //     })
  //     .then(function(phoneCredential) {
  //       return firebase.auth().signInWithCredential(phoneCredential);
  //     });

  useEffect(() => {
    const app = firebase.initializeApp({
      apiKey: 'AIzaSyCu4uyf9ln--tU-8V32nnFyfk8GN4koLI0',
      authDomain: 'apollo-patient-interface.firebaseapp.com',
      databaseURL: 'https://apollo-patient-interface.firebaseio.com',
      projectId: 'apollo-patient-interface',
      storageBucket: '',
      messagingSenderId: '537093214409',
      appId: '1:537093214409:web:4eec27a7bc6bc1c8',
    });
    const auth = app.auth();
    // const firebaseProvider = new firebase.auth.PhoneAuthProvider();

    const sendOtpFunc = () => (mobileNumber: string, recaptchaContainerId: HTMLElement['id']) => {
      const applicationVerifier = new firebase.auth.RecaptchaVerifier(recaptchaContainerId);
      return applicationVerifier.verify().then((x) => {
        const provider = new firebase.auth.PhoneAuthProvider();
        return provider
          .verifyPhoneNumber('+17155290756', applicationVerifier)
          .then((res) => (verificationId = res))
          .then(() => {});
      });
    };
    setSendOtp(sendOtpFunc);

    const verifyOtpFunc = () => (otp: string) => {
      console.log('verifying', verificationId, otp);
      const phoneCredential = firebase.auth.PhoneAuthProvider.credential(verificationId, otp);
      console.log('verify result', phoneCredential);
      return firebase.auth().signInWithCredential(phoneCredential);
    };
    setVerifyOtp(verifyOtpFunc);

    // const signInFunc = () => (phoneCredential) => {
    //   return firebase.auth().signInWithCredential(phoneCredential);
    // };
    // setSignIn(signInFunc);

    const signOutFunc = () => () => auth.signOut();
    setSignOut(signOutFunc);

    auth.onAuthStateChanged((updatedUser) => {
      // There is no hook to know when firebase is loading, but we know this fires when it has attempted
      // (whether automated from an existing cache or from an actual user-initiated sign in click)
      // Set the default `authenticating` value to true, and clear it out in all cases here
      // (but not until all the async requests here are finished )
      if (!userIsValid(updatedUser)) {
        setCurrentUser(null);
        setAuthenticating(false);
        return;
      }
      return updatedUser!.getIdToken().then((updatedToken) => {
        setAuthToken(updatedToken);
        console.log('auth token is', updatedToken);
        // return apolloClient.mutate<UserSignIn, UserSignInVariables>({
        //   mutation: USER_SIGN_IN,
        //   variables: { token: updatedToken },
        // });
      });
      // .then((userSignInResult) => {
      //   if (
      //     userSignInResult &&
      //     userSignInResult.data &&
      //     userSignInResult.data.userSignIn &&
      //     userSignInResult.data.userSignIn.user
      //   ) {
      //     const user = userSignInResult.data.userSignIn.user;
      //     setCurrentUser(user);
      //     setAuthenticating(false);
      //   } else {
      //     setCurrentUser(null);
      //     setAuthenticating(false);
      //   }
      // });
    });
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
      <ApolloHooksProvider client={apolloClient}>
        <AuthContext.Provider
          value={{ authenticating, sendOtp, verifyOtp, signIn, signOut, currentUser }}
        >
          {props.children}
        </AuthContext.Provider>
      </ApolloHooksProvider>
    </ApolloProvider>
  );
};
