import firebase, { RNFirebase, AuthCredential } from 'react-native-firebase';
import React, { useState, useEffect } from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ErrorResponse, onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';

import { apiRoutes } from 'app/src/helpers/apiRoutes';
import {
  PatientSignIn,
  PatientSignInVariables,
  PatientSignIn_patientSignIn_patients,
} from 'app/src/graphql/types/PatientSignIn';
import { PATIENT_SIGN_IN } from 'app/src/graphql/profiles';

export type PhoneNumberVerificationCredential = RNFirebase.PhoneAuthSnapshot['verificationId'];
export type OtpVerificationCredential = AuthCredential;

export interface AuthProviderProps {
  analytics: RNFirebase.Analytics | null;
  currentUser: PatientSignIn_patientSignIn_patients | null;
  isAuthenticating: boolean;
  verifyPhoneNumber: ((mobileNumber: string) => Promise<PhoneNumberVerificationCredential>) | null;
  verifyOtp:
    | ((
        token: PhoneNumberVerificationCredential,
        otp: string
      ) => Promise<OtpVerificationCredential>)
    | null;
  signIn: ((token: OtpVerificationCredential) => Promise<void>) | null;
  signOut: (() => any) | null;
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
});

let apolloClient: ApolloClient<any>;
const buildApolloClient = (authToken: string) => {
  const errorLink = onError(({ networkError, operation, forward }: ErrorResponse) => {
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
  apolloClient = buildApolloClient(authToken);

  const [currentUser, setCurrentUser] = useState<AuthProviderProps['currentUser']>(null);
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

    const signOutFunc = () => () => auth.signOut();
    setSignOut(signOutFunc);

    auth.onAuthStateChanged(async (updatedUser) => {
      // There is no hook to know when firebase is loading, but we know this fires when it has attempted
      // (whether automated from an existing cache or from an actual user-initiated sign in click)
      // Set the default `authenticating` value to true, and clear it out in all cases here
      // (but not until all the async requests here are finished )
      if (!userIsValid(updatedUser)) {
        setCurrentUser(null);
        setIsAuthenticating(false);
        return;
      }

      const updatedToken = await updatedUser!.getIdToken();
      setAuthToken(updatedToken);
      setIsAuthenticating(false);

      const patientSignInResult = await apolloClient.mutate<PatientSignIn, PatientSignInVariables>({
        mutation: PATIENT_SIGN_IN,
        variables: { jwt: updatedToken },
      });

      if (patientSignInResult.data && patientSignInResult.data.patientSignIn.patients) {
        const patient = patientSignInResult.data.patientSignIn.patients[0];
        setCurrentUser(patient);
        setIsAuthenticating(false);
      } else {
        setCurrentUser(null);
        setIsAuthenticating(false);
      }
    });
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
      <ApolloHooksProvider client={apolloClient}>
        <AuthContext.Provider
          value={{
            analytics,
            currentUser,
            isAuthenticating,
            verifyPhoneNumber,
            verifyOtp,
            signIn,
            signOut,
          }}
        >
          {props.children}
        </AuthContext.Provider>
      </ApolloHooksProvider>
    </ApolloProvider>
  );
};
