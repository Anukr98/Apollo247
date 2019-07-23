import { useContext, useEffect } from 'react';
import { AuthContext } from '@aph/mobile-patients/src/components/AuthProvider';
import { useQuery } from 'react-apollo-hooks';
import { GetCurrentPatients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import { GET_CURRENT_PATIENTS } from '@aph/mobile-patients/src/graphql/profiles';
import { Relation } from '@aph/mobile-patients/src/graphql/types/globalTypes';

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
  const callAuthProvider = useAuthContext().callAuthProvider!;

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
    callAuthProvider,
  };
};

export const useCurrentPatient = () => useAllCurrentPatients().currentPatient;

export const useAllCurrentPatients = () => {
  const isSigningIn = useAuthContext().isSigningIn;
  const hasAuthToken = useAuthContext().hasAuthToken;
  const { loading, data, error } = useQuery<GetCurrentPatients>(GET_CURRENT_PATIENTS, {
    skip: isSigningIn || !hasAuthToken,
  });
  console.log('hasAuthToken', hasAuthToken);
  // console.log('hasAuthToken error', error);

  const setCurrentPatientId = useAuthContext().setCurrentPatientId!;
  const currentPatientId = useAuthContext().currentPatientId;
  const allCurrentPatients =
    data && data.getCurrentPatients ? data.getCurrentPatients.patients : null;
  const currentPatient = allCurrentPatients
    ? allCurrentPatients.find((patient) => patient.id === currentPatientId) || allCurrentPatients[0]
    : null;

  console.log('currentPatient', currentPatient);
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
  }, [allCurrentPatients, currentPatientId, setCurrentPatientId]);

  return {
    loading,
    error,
    allCurrentPatients,
    currentPatient,
    setCurrentPatientId,
  };
};
