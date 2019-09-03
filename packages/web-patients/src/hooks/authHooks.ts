import { useContext, useEffect } from 'react';
import { AuthContext, AuthContextProps } from 'components/AuthProvider';
import { GetCurrentPatients } from 'graphql/types/GetCurrentPatients';
import { GET_CURRENT_PATIENTS } from 'graphql/profiles';
import { Relation } from 'graphql/types/globalTypes';
import { useQueryWithSkip } from 'hooks/apolloHooks';

const useAuthContext = () => useContext<AuthContextProps>(AuthContext);

export const useAuth = () => {
  const verifyOtp = useAuthContext().verifyOtp!;
  const verifyOtpError = useAuthContext().verifyOtpError!;
  const isVerifyingOtp = useAuthContext().isVerifyingOtp!;

  const sendOtp = useAuthContext().sendOtp!;
  const sendOtpError = useAuthContext().sendOtpError;
  const isSendingOtp = useAuthContext().isSendingOtp;

  const hasAuthToken = useAuthContext().hasAuthToken;
  const authToken = useAuthContext().authToken;
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
    authToken,
    isSigningIn,
    signInError,
    isSignedIn,
    signOut,
  };
};

export const useCurrentPatient = () => useAllCurrentPatients().currentPatient;

export const useAllCurrentPatients = () => {
  const { loading, data, error } = useQueryWithSkip<GetCurrentPatients>(GET_CURRENT_PATIENTS);
  const setCurrentPatientId = useAuthContext().setCurrentPatientId!;
  const currentPatientId = useAuthContext().currentPatientId;
  const allCurrentPatients =
    data && data.getCurrentPatients ? data.getCurrentPatients.patients : null;
  const currentPatient = allCurrentPatients
    ? allCurrentPatients.find((patient) => patient.id === currentPatientId)
    : null;

  useEffect(() => {
    const getDefaultCurrentPatient = () => {
      if (!allCurrentPatients) return null;
      if (allCurrentPatients.length === 1) return allCurrentPatients[0];
      return allCurrentPatients.find((p) => p.relation === Relation.ME) || null;
    };
    const defaultCurrentPatient = getDefaultCurrentPatient();

    setCurrentPatientId(defaultCurrentPatient ? defaultCurrentPatient.id : null);
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
