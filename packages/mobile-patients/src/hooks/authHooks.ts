import { useContext } from 'react';
import { AuthContext, AuthContextProps } from '@aph/mobile-patients/src/components/AuthProvider';

const useAuthContext = () => useContext(AuthContext);

export const useCurrentPatient = () => useAuthContext().currentPatient;
export const useAllCurrentPatients = () => useAuthContext().allCurrentPatients;
export const useIsSignedIn = () => useAllCurrentPatients() != null;
export const useAnalytics = () => useContext(AuthContext).analytics!;

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

  const signInWithPhoneNumber = useAuthContext().signInWithPhoneNumber!;

  const analytics = useAnalytics();
  const confirmResult = useAuthContext().confirmResult!;
  const authProvider = useAuthContext().authProvider!;
  const authError = useAuthContext().authError!;
  const setAuthError = useAuthContext().setAuthError!;
  const updatePatient = useAuthContext().updatePatient!;

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

    signInWithPhoneNumber,

    analytics,
    confirmResult,

    authProvider,
    authError,
    setAuthError,
    updatePatient,
  };
};
