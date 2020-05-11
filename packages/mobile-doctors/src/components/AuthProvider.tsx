import { GET_DOCTOR_DETAILS, GET_ALL_SPECIALTIES } from '@aph/mobile-doctors/src/graphql/profiles';
import {
  GetDoctorDetails,
  GetDoctorDetails_getDoctorDetails,
} from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import { apiRoutes } from '@aph/mobile-doctors/src/helpers/apiRoutes';
import { getNetStatus } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { createHttpLink } from 'apollo-link-http';
import React, { useEffect, useState } from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloProvider as ApolloHooksProvider } from 'react-apollo-hooks';
import firebase, { RNFirebase } from 'react-native-firebase';
import {
  getAllSpecialties,
  getAllSpecialties_getAllSpecialties,
} from '@aph/mobile-doctors/src/graphql/types/getAllSpecialties';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';

/*eslint-disable */
function wait<R, E>(promise: Promise<R>): [R, E] {
  return (promise.then((data: R) => [data, null], (err: E) => [null, err]) as any) as [R, E];
}
/*eslint-enable */

export interface AuthContextProps {
  analytics: RNFirebase.Analytics | null;
  firebaseUser: RNFirebase.User | null;
  sendOtp: ((mobileNumber: string) => Promise<RNFirebase.ConfirmationResult | unknown>) | null;
  verifyOtp: ((otp: string) => Promise<GetDoctorDetails | unknown>) | null;
  clearFirebaseUser: (() => Promise<unknown>) | null;
  doctorDetails: GetDoctorDetails_getDoctorDetails | null;
  setDoctorDetails: ((doctorDetails: GetDoctorDetails_getDoctorDetails | null) => void) | null;
  getDoctorDetailsApi: (() => Promise<boolean>) | null;
  // signOut: (() => void) | null;
  getDoctorDetailsError: boolean;
  setDoctorDetailsError: ((arg0: boolean) => void) | null;
  getSpecialties: () => void;
  specialties: getAllSpecialties_getAllSpecialties[] | null;
}

export const AuthContext = React.createContext<AuthContextProps>({
  analytics: null,
  firebaseUser: null,
  sendOtp: null,
  verifyOtp: null,
  clearFirebaseUser: null,
  doctorDetails: null,
  setDoctorDetails: null,
  getDoctorDetailsApi: null,
  getDoctorDetailsError: false,
  setDoctorDetailsError: null,
  getSpecialties: () => {},
  specialties: null,
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
  const [getDoctorDetailsError, setDoctorDetailsError] = useState<boolean>(false);
  const [specialties, setSpecialties] = useState<getAllSpecialties_getAllSpecialties[] | null>(
    null
  );
  const analytics = firebase.analytics();
  const auth = firebase.auth();

  let apolloClient: ApolloClient<NormalizedCacheObject>;

  const buildApolloClient = (authToken: string, handleUnauthenticated: () => void) => {
    const errorLink = onError((error) => {
      console.log('-------error-------', error);
      const { graphQLErrors, operation, forward } = error;
      if (graphQLErrors) {
        const unauthenticatedError = graphQLErrors.some(
          (gqlError) => gqlError.extensions && gqlError.extensions.code === 'UNAUTHENTICATED'
        );
        if (unauthenticatedError) {
          handleUnauthenticated();
          console.log('-------unauthenticatedError-------', unauthenticatedError);
        }
      }
      return;
      // return forward(operation);
    });
    const authLink = setContext(async (_, { headers }) => ({
      headers: {
        ...headers,
        Authorization: authToken,
      },
    }));
    const httpLink = createHttpLink({
      uri: apiRoutes.graphql(),
    });

    const link = errorLink.concat(authLink).concat(httpLink);
    const cache = apolloClient ? apolloClient.cache : new InMemoryCache();
    return new ApolloClient({
      link,
      cache,
    });
  };

  apolloClient = buildApolloClient(authToken, () => getFirebaseToken());

  const sendOtp = (customToken: string) => {
    return new Promise(async (resolve, reject) => {
      const [phoneAuthResult, phoneAuthError] = await wait(auth.signInWithCustomToken(customToken));
      if (phoneAuthError) {
        reject(phoneAuthError);
        return;
      }
      console.log(phoneAuthResult, 'phoneAuthResult');

      resolve(phoneAuthResult);
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

  useEffect(() => {
    getFirebaseToken();
  }, [auth]);

  const getFirebaseToken = () => {
    let authStateRegistered = false;
    console.log('authprovider');

    auth.onAuthStateChanged(async (user) => {
      console.log('authprovider onAuthStateChanged', authStateRegistered, user);

      if (user && !authStateRegistered) {
        console.log('authprovider login');
        authStateRegistered = true;

        const jwt = await user.getIdToken(true).catch((error) => {
          setAuthToken('');
          authStateRegistered = false;
          console.log('authprovider error', error);
          throw error;
        });

        console.log('authprovider jwt', jwt);
        setAuthToken(jwt);

        apolloClient = buildApolloClient(jwt, () => getFirebaseToken());
        authStateRegistered = false;
        setAuthToken(jwt);
        getNetStatus().then((item) => {
          item && getDoctorDetailsApi();
        });
      }
    });
  };

  const getDoctorDetailsApi = async () => {
    return new Promise<boolean>((resolve, reject) => {
      apolloClient
        .query<GetDoctorDetails>({
          query: GET_DOCTOR_DETAILS,
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          console.log('GetDoctorDetails', data);
          if (data) {
            setDoctorDetails(data.getDoctorDetails);
            setDoctorDetailsError(false);
            resolve(true);
          }
        })
        .catch(async (error) => {
          console.log('GetDoctorDetails error', error);
          setDoctorDetailsError(true);
          // clearFirebaseUser();
          // clearUserData();
          reject(false);
        });
    });
  };

  const getSpecialties = async () => {
    const storedDate = await AsyncStorage.getItem('SpecialistAPICalledDate');
    const specialistData = await AsyncStorage.getItem('SpecialistData');
    if (storedDate) {
      if (storedDate !== moment(new Date()).format('DDMMYYYY')) {
        fetchSpecialities();
      } else {
        if (specialistData) {
          setSpecialties(JSON.parse(specialistData));
        } else {
          fetchSpecialities();
        }
      }
    } else {
      fetchSpecialities();
    }
  };

  const fetchSpecialities = () => {
    apolloClient
      .query<getAllSpecialties>({
        query: GET_ALL_SPECIALTIES,
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        try {
          setSpecialties(data.getAllSpecialties);
          AsyncStorage.setItem('SpecialistData', JSON.stringify(data.getAllSpecialties));
          AsyncStorage.setItem('SpecialistAPICalledDate', moment(new Date()).format('DDMMYYYY'));
        } catch (e) {
          CommonBugFender('DoctorSearch_fetchSpecialities_try', e);
        }
      })
      .catch((e) => {
        CommonBugFender('DoctorSearch_fetchSpecialities', e);
      });
  };
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
            getDoctorDetailsApi,
            // signOut,
            getDoctorDetailsError,
            setDoctorDetailsError,
            specialties,
            getSpecialties,
          }}
        >
          {props.children}
        </AuthContext.Provider>
      </ApolloHooksProvider>
    </ApolloProvider>
  );
};
