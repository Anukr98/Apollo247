import { useContext } from 'react';
import { AuthContext, AuthContextProps } from 'components/AuthProvider';

const useAuthContext = () => useContext(AuthContext);

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
  isLoginPopupVisible: AuthContextProps['loginPopupVisible'];
  setIsLoginPopupVisible: NonNullable<AuthContextProps['setLoginPopupVisible']>;
} => {
  const isLoginPopupVisible = useContext(AuthContext).loginPopupVisible;
  const setIsLoginPopupVisible = useContext(AuthContext).setLoginPopupVisible!;
  return { isLoginPopupVisible, setIsLoginPopupVisible };
};
