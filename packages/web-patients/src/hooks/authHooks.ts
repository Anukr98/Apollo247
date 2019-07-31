import { useContext, useEffect } from 'react';
import { AuthContext, AuthContextProps } from 'components/AuthProvider';
import { useQuery } from 'react-apollo-hooks';
import { GetCurrentPatients } from 'graphql/types/GetCurrentPatients';
import { GET_CURRENT_PATIENTS } from 'graphql/profiles';
import { Relation } from 'graphql/types/globalTypes';

const useAuthContext = () => useContext<AuthContextProps>(AuthContext);

export const useAuth = () => {
  const verifyOtp = useAuthContext().verifyOtp!;
  const verifyOtpError = useAuthContext().verifyOtpError!;
  const isVerifyingOtp = useAuthContext().isVerifyingOtp!;

  const sendOtp = useAuthContext().sendOtp!;
  const sendOtpError = useAuthContext().sendOtpError;
  const isSendingOtp = useAuthContext().isSendingOtp;

  const hasAuthToken = useAuthContext().hasAuthToken;
  const isSigningIn = useAuthContext().isSigningIn;
  const signInError = useAuthContext().signInError;
  const isSignedIn = useAllCurrentPatients().allCurrentPatients != null;
  const signOut = useAuthContext().signOut!;

  return {
    verifyOtp,
    verifyOtpError,
    isVerifyingOtp,

    sendOtp,
    sendOtpError,
    isSendingOtp,

    hasAuthToken,
    isSigningIn,
    signInError,
    isSignedIn,
    signOut,
  };
};

export const useCurrentPatient = () => useAllCurrentPatients().currentPatient;

export const useAllCurrentPatients = () => {
  const isSigningIn = useAuthContext().isSigningIn;
  const hasAuthToken = useAuthContext().hasAuthToken;
  const { loading, data, error } = useQuery<GetCurrentPatients>(GET_CURRENT_PATIENTS, {
    skip: isSigningIn || !hasAuthToken,
  });
  const setCurrentPatientId = useAuthContext().setCurrentPatientId!;
  const currentPatientId = useAuthContext().currentPatientId;
  const allCurrentPatients =
    data && data.getCurrentPatients ? data.getCurrentPatients.patients : null;
  const currentPatient = allCurrentPatients
    ? allCurrentPatients.find((patient) => patient.id === currentPatientId)
    : null;

  useEffect(() => {
    if (!currentPatientId) {
      // if (allCurrentPatients!.length && allCurrentPatients!.length === 1) {
      //   allCurrentPatients![0].relation = Relation.ME;
      // }
      console.log('ALL CURRENT PATIENTS IS: ', allCurrentPatients);
      const defaultCurrentPatient = allCurrentPatients
        ? allCurrentPatients.find((patient) => patient.relation === Relation.ME) || null
        : null;
      setCurrentPatientId(defaultCurrentPatient ? defaultCurrentPatient.id : null);
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

export const useLoginPopupState = (): {
  isLoginPopupVisible: AuthContextProps['isLoginPopupVisible'];
  setIsLoginPopupVisible: NonNullable<AuthContextProps['setIsLoginPopupVisible']>;
} => {
  const isLoginPopupVisible = useAuthContext().isLoginPopupVisible;
  const setIsLoginPopupVisible = useAuthContext().setIsLoginPopupVisible!;
  return { isLoginPopupVisible, setIsLoginPopupVisible };
};
