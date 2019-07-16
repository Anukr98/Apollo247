import { useContext, useEffect } from 'react';
import { AuthContext, AuthContextProps } from 'components/AuthProvider';
import { useQuery } from 'react-apollo-hooks';
import { GetCurrentPatients } from 'graphql/types/GetCurrentPatients';
import { GET_CURRENT_PATIENTS } from 'graphql/profiles';
import { Relation } from 'graphql/types/globalTypes';

const useAuthContext = () => useContext<AuthContextProps>(AuthContext);

export const useCurrentPatient = () => useAllCurrentPatients().currentPatient;

export const useAuth = () => {
  const verifyOtp = useAuthContext().verifyOtp!;
  const verifyOtpError = useAuthContext().verifyOtpError!;
  const isVerifyingOtp = useAuthContext().isVerifyingOtp!;

  const sendOtp = useAuthContext().sendOtp!;
  const sendOtpError = useAuthContext().sendOtpError;
  const isSendingOtp = useAuthContext().isSendingOtp;

  const isSignedIn = useAuthContext().isSignedIn;
  const signInError = useAuthContext().signInError;
  const isSigningIn = useAuthContext().isSigningIn;
  const signOut = useAuthContext().signOut!;

  return {
    verifyOtp,
    verifyOtpError,
    isVerifyingOtp,

    sendOtp,
    sendOtpError,
    isSendingOtp,

    signInError,
    isSigningIn,
    isSignedIn,
    signOut,
  };
};

export const useAllCurrentPatients = () => {
  const { isSigningIn, isSignedIn } = useAuth();
  const { loading, data, error } = useQuery<GetCurrentPatients>(GET_CURRENT_PATIENTS, {
    skip: isSigningIn || !isSignedIn,
  });
  const setCurrentPatient = useAuthContext().setCurrentPatient!;
  const currentPatient = useAuthContext().currentPatient;
  const allCurrentPatients =
    data && data.getCurrentPatients ? data.getCurrentPatients.patients : null;

  useEffect(() => {
    if (!currentPatient) {
      const defaultCurrentPatient = allCurrentPatients
        ? allCurrentPatients.find((patient) => patient.relation === Relation.ME) || null
        : null;
      setCurrentPatient(defaultCurrentPatient);
    }
  }, [allCurrentPatients, currentPatient, setCurrentPatient]);

  return {
    loading,
    error,
    allCurrentPatients,
    currentPatient,
    setCurrentPatient,
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
