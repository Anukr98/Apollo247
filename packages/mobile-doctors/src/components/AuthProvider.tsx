import {
  GetDoctorDetails,
  GetDoctorDetails_getDoctorDetails,
} from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import { apiRoutes } from '@aph/mobile-doctors/src/helpers/apiRoutes';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import React, { useEffect, useState } from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import firebase, { RNFirebase } from 'react-native-firebase';
import fetch from 'node-fetch';

export interface AuthContextProps {
  analytics: RNFirebase.Analytics | null;
  firebaseUser: RNFirebase.User | null;
  sendOtp: ((mobileNumber: string) => Promise<RNFirebase.ConfirmationResult | unknown>) | null;
  verifyOtp: ((otp: string) => Promise<GetDoctorDetails | unknown>) | null;
  clearFirebaseUser: (() => Promise<unknown>) | null;
  doctorDetails: GetDoctorDetails_getDoctorDetails | null;
  setIsDelegateLogin: ((status: boolean) => void) | null;
  isDelegateLogin: boolean;
  setDoctorDetails: ((doctorDetails: GetDoctorDetails_getDoctorDetails | null) => void) | null;
}

export const AuthContext = React.createContext<AuthContextProps>({
  analytics: null,
  firebaseUser: null,
  sendOtp: null,
  verifyOtp: null,
  clearFirebaseUser: null,
  doctorDetails: null,
  isDelegateLogin: false,
  setIsDelegateLogin: null,
  setDoctorDetails: null,
});

export const AuthProvider: React.FC = (props) => {
  const [authToken, setAuthToken] = useState<string>('');
  const [otpConfirmResult, setOtpConfirmResult] = useState<RNFirebase.ConfirmationResult | null>(
    null
  );
  const [firebaseUser, setFirebaseUser] = useState<RNFirebase.User | null>(null);
  const [doctorDetails, setDoctorDetails] = useState<GetDoctorDetails_getDoctorDetails | null>(
    null
  );
  const [isDelegateLogin, setIsDelegateLogin] = useState<boolean>(false);

  const analytics = firebase.analytics();

  const buildApolloClient = (authToken: string) => {
    console.log('authToken in buildApolloClient', authToken);
    const httpLink = createHttpLink({ uri: apiRoutes.graphql(), fetch: fetch });
    const authLink = new ApolloLink((operation, forward) => {
      // Get the authentication token from context if it exists
      // Use the setContext method to set the HTTP headers.
      operation.setContext({
        headers: {
          Authorization: authToken,
        },
      });
      // Call the next link in the middleware chain.
      return forward!(operation);
    });
    return new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
      defaultOptions: {
        query: {
          fetchPolicy: 'no-cache',
        },
        mutate: {
          fetchPolicy: 'no-cache',
        },
        watchQuery: {
          fetchPolicy: 'no-cache',
        },
      },
    });
  };

  const apolloClient = buildApolloClient(authToken);

  const sendOtp = (mobileNumber: string) => {
    console.log('sendOtp triggered');
    return new Promise(async (resolve, reject) => {
      firebase
        .auth()
        .signInWithPhoneNumber(`+91${mobileNumber}`)
        .then((confirmResult) => {
          console.log('sendOtp then', confirmResult);
          setOtpConfirmResult(confirmResult);
          resolve(confirmResult);
        })
        .catch((e) => {
          console.log('sendOtp catch', e);
          reject(e);
        });
    });
  };

  const verifyOtp = (otp: string) => {
    console.log('verifyOtp entered');
    return new Promise((resolve, reject) => {
      (otpConfirmResult &&
        otpConfirmResult
          .confirm(otp)
          .then(async (firebaseUser) => {
            console.log('verifyOtp then', firebaseUser);
            setFirebaseUser(firebaseUser);
            const token = await firebaseUser!.getIdToken();
            setAuthToken(token);
            console.log('verifyOtp before resolveDoctorDetails');
            resolve(firebaseUser);
          })
          .catch((e) => {
            // For android to work [issue otp expired]
            // firebaseUser will trigger update from auth listener
            setTimeout(() => {
              firebaseUser ? resolve(firebaseUser) : reject(e);
            }, 1000);
          })) ||
        reject('Please try sending otp again');
    });
  };

  const clearFirebaseUser = () => {
    return new Promise(async (resolve, reject) => {
      firebase
        .auth()
        .signOut()
        .then((_) => {
          setFirebaseUser(null);
          setDoctorDetails(null);
          setIsDelegateLogin(false);
          setAuthToken('');
          resolve();
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  // listen to firebase auth
  useEffect(() => {
    const authStateListener = firebase.auth().onAuthStateChanged((firebaseUser) => {
      // firebaseUser is verified and logged in
      if (firebaseUser) {
        console.log('onAuthStateChanged triggered', firebaseUser);
        firebaseUser!
          .getIdToken()
          .then((token) => {
            setAuthToken(token);
            setFirebaseUser(firebaseUser);
          })
          .catch((_) => {});
      }
      return () => {
        authStateListener && authStateListener();
      };
    });
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
      <ApolloHooksProvider client={apolloClient}>
        <AuthContext.Provider
          value={{
            analytics,
            firebaseUser,
            sendOtp,
            verifyOtp,
            clearFirebaseUser,
            setDoctorDetails,
            doctorDetails,
            setIsDelegateLogin,
            isDelegateLogin,
          }}
        >
          {props.children}
        </AuthContext.Provider>
      </ApolloHooksProvider>
    </ApolloProvider>
  );
};
