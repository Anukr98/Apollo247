import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { setContext } from 'apollo-link-context';
import { ErrorResponse, onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
import firebase, { RNFirebase, AuthCredential } from 'react-native-firebase';
import { PATIENT_SIGN_IN, UPDATE_PATIENT } from '@aph/mobile-patients/src/graphql/profiles';
import {
  PatientSignIn,
  PatientSignInVariables,
  PatientSignIn_patientSignIn_patients,
} from '@aph/mobile-patients/src/graphql/types/PatientSignIn';
import {
  updatePatient_updatePatient_patient,
  updatePatient,
  updatePatientVariables,
} from '@aph/mobile-patients/src/graphql/types/updatePatient';
import { apiRoutes } from '@aph/mobile-patients/src/helpers/apiRoutes';
import React, { useEffect, useState } from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import { Relation } from '@aph/mobile-patients/src/graphql/types/globalTypes';

function wait<R, E>(promise: Promise<R>): [R, E] {
  return (promise.then((data: R) => [data, null], (err: E) => [null, err]) as any) as [R, E];
}

export interface AuthContextProps<
  Patient = PatientSignIn_patientSignIn_patients | updatePatient_updatePatient_patient
> {
  analytics: RNFirebase.Analytics | null;

  currentPatient: Patient | null;
  allCurrentPatients: Patient[] | null;
  setCurrentPatient: ((p: Patient) => void) | null;

  sendOtp: ((phoneNumber: string | null) => Promise<unknown>) | null;
  sendOtpError: boolean;
  isSendingOtp: boolean;

  verifyOtp: ((otp: string) => Promise<unknown>) | null;
  verifyOtpError: boolean;
  isVerifyingOtp: boolean;

  signInError: boolean;
  isSigningIn: boolean;
  signOut: (() => Promise<void>) | null;

  authError: boolean;
  setAuthError: ((authError: boolean) => void) | null;
  updatePatient: ((patientDetails: updatePatient_updatePatient_patient) => Promise<unknown>) | null;

  authProvider: (() => Promise<unknown>) | null;
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

  analytics: null,

  authError: false,
  setAuthError: null,

  updatePatient: null,
  authProvider: null,
});

let apolloClient: ApolloClient<any>;
const buildApolloClient = (authToken: string, failureFunction: () => void) => {
  const errorLink = onError(({ networkError, operation, forward }: ErrorResponse) => {
    // There's a bug in the apollo typedefs and `statusCode` is not recognized, but it's there
    if (networkError && (networkError as any).statusCode === 401) {
      console.log(networkError, operation);
    }
    failureFunction();
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

let otpVerifier: RNFirebase.ConfirmationResult;

export const AuthProvider: React.FC = (props) => {
  const [authToken, setAuthToken] = useState<string>('');
  const [analytics, setAnalytics] = useState<AuthContextProps['analytics']>(null);

  const failureFunction = () => setAuthError(true);
  apolloClient = buildApolloClient(authToken, failureFunction);

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
  const [authError, setAuthError] = useState<AuthContextProps['authError']>(false);

  const auth = firebase.auth();

  const sendOtp = (phoneNumber: string) => {
    return new Promise(async (resolve, reject) => {
      setIsSendingOtp(true);

      const [phoneAuthResult, phoneAuthError] = await wait(
        auth.signInWithPhoneNumber('+91' + phoneNumber)
      );
      setIsSendingOtp(false);
      if (phoneAuthError) {
        setSendOtpError(true);
        reject(phoneAuthError);
        return;
      }
      otpVerifier = phoneAuthResult;
      setSendOtpError(false);
      resolve(phoneAuthResult);
    });
  };

  const verifyOtp = async (otp: string) => {
    return new Promise(async (resolve, reject) => {
      if (!otpVerifier) {
        setSendOtpError(true);
        reject();
        return;
      }
      setIsVerifyingOtp(true);
      const [otpAuthResult, otpError] = await wait(otpVerifier.confirm(otp));
      setVerifyOtpError(Boolean(otpError || !otpAuthResult));
      if (otpAuthResult) {
        resolve(otpAuthResult);
      } else {
        reject(otpError);
      }
      setIsVerifyingOtp(false);
    });
  };

  const signOut = () => auth.signOut();

  const updatePatient = (patientDetails: updatePatient_updatePatient_patient) => {
    return new Promise(async (resolve, reject) => {
      console.log('patientDetails', patientDetails);
      const [patientUpdateResult, patientUpdateError] = await wait(
        apolloClient.mutate<updatePatient, updatePatientVariables>({
          mutation: UPDATE_PATIENT,
          variables: { patientInput: patientDetails },
        })
      );

      if (
        patientUpdateError ||
        !patientUpdateResult.data ||
        !patientUpdateResult.data.updatePatient.patient
      ) {
        if (patientUpdateError) console.error(patientUpdateError);
        reject(patientUpdateResult);
        return;
      }

      if (patientUpdateResult.data && patientUpdateResult.data.updatePatient.patient) {
        const patient = patientUpdateResult.data.updatePatient.patient;
        resolve(patient);
      } else {
        reject(patientUpdateResult);
      }
    });
  };

  const PatientSignIn = async () => {};
  const authProvider = async () => {
    // return new Promise((resolve, reject) => {
    //   let authFlag = true;
    //   auth.onAuthStateChanged(async (user) => {
    //     if (authFlag) {
    //       console.log('if ---> ');
    //       authFlag = false;
    //       if (user) {
    //         const [jwt, jwtError] = await wait(user.getIdToken());
    //         if (jwtError || !jwt) {
    //           if (jwtError) console.error(jwtError);
    //           setIsSigningIn(false);
    //           setSignInError(true);
    //           signOut();
    //           reject(jwtError);
    //           return;
    //         }
    //         if (authToken.length == 0) {
    //           console.log('authToken ---> ', authToken);
    //         }
    //         setAuthToken(jwt);
    //         console.log('authProvider authProvider me', jwt);
    //         setIsSigningIn(true);
    //         const [signInResult, signInError] = await wait(
    //           apolloClient.mutate<PatientSignIn, PatientSignInVariables>({
    //             mutation: PATIENT_SIGN_IN,
    //             variables: { jwt },
    //           })
    //         );
    //         if (signInError || !signInResult.data || !signInResult.data.patientSignIn.patients) {
    //           if (signInError) console.error(signInError);
    //           setSignInError(true);
    //           setIsSigningIn(false);
    //           reject(signInResult);
    //           return;
    //         }
    //         const patients = signInResult.data.patientSignIn.patients;
    //         const me = patients.find((p) => p.relation === Relation.ME) || patients[0];
    //         setAllCurrentPatients(patients);
    //         setCurrentPatient(me);
    //         setSignInError(false);
    //         resolve(me);
    //         console.log('authProvider authProvider me', me);
    //       } else {
    //         console.log('else ---> ');
    //         setIsSigningIn(false);
    //         reject();
    //       }
    //     } else {
    //       console.log('else if---> ');
    //     }
    //   });
    // });
  };

  useEffect(() => {
    setAnalytics(firebase.analytics());
    let authFlag = true;

    auth.onAuthStateChanged(async (user) => {
      console.log('if ---> user', user);
      // if (authFlag) {
      authFlag = false;
      console.log('authprovider');
      if (user) {
        const [jwt, jwtError] = await wait(user.getIdToken());
        if (jwtError || !jwt) {
          console.log('authprovider jwtError', jwtError);
          if (jwtError) console.error(jwtError);
          setIsSigningIn(false);
          setSignInError(true);
          auth.signOut();
          return;
        }
        setAuthToken(jwt);
        console.log('authprovider jwt', jwt);

        setIsSigningIn(true);
        const [signInResult, signInError] = await wait(
          apolloClient.mutate<PatientSignIn, PatientSignInVariables>({
            mutation: PATIENT_SIGN_IN,
            variables: { jwt },
          })
        );
        if (signInError || !signInResult.data || !signInResult.data.patientSignIn.patients) {
          if (signInError) console.error(signInError);
          setSignInError(true);
          setIsSigningIn(false);
          auth.signOut();
          return;
        }
        const patients = signInResult.data.patientSignIn.patients;
        const me = patients.find((p) => p.relation === Relation.ME) || patients[0];
        setAllCurrentPatients(patients);
        setCurrentPatient(me);
        setSignInError(false);
        console.log('authprovider me', me);
      } else {
        console.log('else ----> me');
        setIsSigningIn(false);
      }
      // } else {
      //   console.log('else if ----> me');
      // }
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

            analytics,

            authError,
            setAuthError,

            updatePatient,

            authProvider,
          }}
        >
          {props.children}
        </AuthContext.Provider>
      </ApolloHooksProvider>
    </ApolloProvider>
  );
};
