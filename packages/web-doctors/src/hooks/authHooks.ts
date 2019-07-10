import { useContext } from 'react';
import { AuthContext, AuthContextProps } from 'components/AuthProvider';

const useAuthContext = () => useContext<AuthContextProps>(AuthContext);

export const useCurrentPatient = () => useAuthContext().currentPatient;
export const useAllCurrentPatients = () => useAuthContext().allCurrentPatients;
export const useIsSignedIn = () => useAllCurrentPatients() != null;

export const useAuth = () => {
  const currentPatient = useCurrentPatient();
  const setCurrentPatient = useAuthContext().setCurrentPatient!;
  const allCurrentPatients = useAllCurrentPatients();

  const verifyOtp = useAuthContext().verifyOtp!;
  const verifyOtpError = useAuthContext().verifyOtpError!;
  const isVerifyingOtp = useAuthContext().isVerifyingOtp!;

  const sendOtp = useAuthContext().sendOtp!;
  const sendOtpError = useAuthContext().sendOtpError;
  const isSendingOtp = useAuthContext().isSendingOtp;

  const isSignedIn = useIsSignedIn();
  const signInError = useAuthContext().signInError;
  const isSigningIn = useAuthContext().isSigningIn;
  const signOut = useAuthContext().signOut!;

  return {
    currentPatient,
    setCurrentPatient,
    allCurrentPatients,

    verifyOtp,
    verifyOtpError,
    isVerifyingOtp,

    sendOtp,
    sendOtpError,
    isSendingOtp,

    isSignedIn,
    signInError,
    isSigningIn,
    signOut,
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
