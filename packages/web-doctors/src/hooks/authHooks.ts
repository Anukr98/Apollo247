import { useContext } from 'react';
import { AuthContext, AuthContextProps } from 'components/AuthProvider';

const useAuthContext = () => useContext(AuthContext);

export const useCurrentPatient = () => {
  const doctorFromAuthCache = useAuthContext().currentUser;
  return doctorFromAuthCache;
};
// export const useAllCurrentPatients = () => useAuthContext().allCurrentPatients;
// export const useIsSignedIn = () => useAllCurrentPatients() != null;

export const useAuth = () => {
  const currentUserType = useAuthContext().currentUserType;
  const setCurrentUserType = useAuthContext().setCurrentUserType;

  const currentPatient = useCurrentPatient();
  const setCurrentPatient = useAuthContext().setCurrentUser!;
  // const allCurrentPatients = useAllCurrentPatients();

  const verifyOtp = useAuthContext().verifyOtp!;
  const verifyOtpError = useAuthContext().verifyOtpError!;
  const isVerifyingOtp = useAuthContext().isVerifyingOtp!;

  const sendOtp = useAuthContext().sendOtp!;
  const sendOtpError = useAuthContext().sendOtpError;
  const isSendingOtp = useAuthContext().isSendingOtp;

  const isSignedIn = useCurrentPatient();
  const signInError = useAuthContext().signInError;
  const isSigningIn = useAuthContext().isSigningIn;
  const signOut = useAuthContext().signOut!;

  const sessionClient = useAuthContext().sessionClient;

  return {
    currentPatient,
    setCurrentPatient,
    //allCurrentPatients,

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

    currentUserType,
    setCurrentUserType,

    sessionClient,
  };
};

export const useLoginPopupState = (): {
  isLoginPopupVisible: AuthContextProps['isLoginPopupVisible'];
  setIsLoginPopupVisible: NonNullable<AuthContextProps['setIsLoginPopupVisible']>;
} => {
  const isLoginPopupVisible = useContext(AuthContext).isLoginPopupVisible;
  const setIsLoginPopupVisible = useContext(AuthContext).setIsLoginPopupVisible!;
  return { isLoginPopupVisible, setIsLoginPopupVisible };
};
