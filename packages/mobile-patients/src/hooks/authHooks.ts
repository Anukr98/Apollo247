import { useContext, useEffect } from 'react';
import { AuthContext } from '@aph/mobile-patients/src/components/AuthProvider';
import { useApolloClient } from 'react-apollo-hooks';
// import { useQuery } from 'react-apollo-hooks';
// import { GetCurrentPatients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
// import { GET_CURRENT_PATIENTS } from '@aph/mobile-patients/src/graphql/profiles';
import { Relation } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { AsyncStorage } from 'react-native';
import {
  getPatientAddressList,
  getPatientAddressListVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import { GET_PATIENT_ADDRESS_LIST } from '@aph/mobile-patients/src/graphql/profiles';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';

const useAuthContext = () => useContext(AuthContext);

export const useAnalytics = () => useContext(AuthContext).analytics!;

export const useAuth = () => {
  const verifyOtp = useAuthContext().verifyOtp!;
  const verifyOtpError = useAuthContext().verifyOtpError!;
  const isVerifyingOtp = useAuthContext().isVerifyingOtp!;

  const sendOtp = useAuthContext().sendOtp!;
  const sendOtpError = useAuthContext().sendOtpError;
  const isSendingOtp = useAuthContext().isSendingOtp;

  const signInError = useAuthContext().signInError;
  const isSigningIn = useAuthContext().isSigningIn;
  const signOut = useAuthContext().signOut!;

  const analytics = useAnalytics();
  const allPatients = useAuthContext().allPatients!;

  const getPatientApiCall = useAuthContext().getPatientApiCall!;

  return {
    verifyOtp,
    verifyOtpError,
    isVerifyingOtp,

    sendOtp,
    sendOtpError,
    isSendingOtp,

    signInError,
    isSigningIn,
    signOut,

    analytics,
    allPatients,

    getPatientApiCall,
  };
};

export const useCurrentPatient = () => useAllCurrentPatients().currentPatient;

export const useAllCurrentPatients = () => {
  // const isSigningIn = useAuthContext().isSigningIn;
  // const hasAuthToken = useAuthContext().hasAuthToken;
  const patientsArray = useAuthContext().allPatients;
  // console.log('patientsArray', patientsArray);

  // const { loading, data, error } = useQuery<GetCurrentPatients>(GET_CURRENT_PATIENTS, {
  //   skip: isSigningIn || !hasAuthToken,
  //   fetchPolicy: 'no-cache',
  // });
  // console.log('hasAuthToken', hasAuthToken);
  // console.log('hasAuthToken error', error);
  // console.log('data', data);
  const client = useApolloClient();
  const shopCart = useShoppingCart();
  const diagCart = useDiagnosticsCart();

  const setCurrentPatientId = useAuthContext().setCurrentPatientId!;
  const currentPatientId = useAuthContext().currentPatientId;
  const allCurrentPatients =
    patientsArray && patientsArray.data && patientsArray.data.getCurrentPatients
      ? patientsArray.data.getCurrentPatients.patients
      : null;

  const currentPatient = allCurrentPatients
    ? allCurrentPatients.find((patient) => patient.id === currentPatientId) ||
      allCurrentPatients.find((patient) => patient.relation === Relation.ME)
    : null;

  // console.log('currentPatient', currentPatient);
  // console.log('allCurrentPatients', allCurrentPatients);
  useEffect(() => {
    if (!currentPatientId) {
      const defaultCurrentPatient = allCurrentPatients
        ? allCurrentPatients.find((patient) => patient.relation === Relation.ME) ||
          allCurrentPatients[0]
        : null;
      setCurrentPatientId(defaultCurrentPatient ? defaultCurrentPatient.id : null);
      // console.log('currentPatientId', currentPatientId);
      // console.log('defaultCurrentPatient', defaultCurrentPatient);
    }
    // } else {
    //   client
    //     .query<getPatientAddressList, getPatientAddressListVariables>({
    //       query: GET_PATIENT_ADDRESS_LIST,
    //       variables: { patientId: currentPatientId },
    //       fetchPolicy: 'no-cache',
    //     })
    //     .then(({ data: { getPatientAddressList: { addressList } } }) => {
    //       shopCart.setDeliveryAddressId && shopCart.setDeliveryAddressId('');
    //       diagCart.setDeliveryAddressId && diagCart.setDeliveryAddressId('');
    //       shopCart.setAddresses && shopCart.setAddresses(addressList!);
    //       diagCart.setAddresses && diagCart.setAddresses(addressList!);
    //     })
    //     .catch((e) => {});
    // }
  }, [allCurrentPatients, currentPatientId, setCurrentPatientId]);

  return {
    // loading,
    // error,
    allCurrentPatients,
    currentPatient,
    setCurrentPatientId,
  };
};
