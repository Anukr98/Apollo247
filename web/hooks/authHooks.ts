import { useContext } from 'react';
import { AuthContext, AuthProviderProps } from 'components/AuthProvider';
import { Relation } from 'graphql/types/globalTypes';

export const useCurrentPatient = () => useContext(AuthContext).currentPatient;
export const useIsLoggedIn = () => useLoggedInPatients() != null;
export const useIsAuthenticating = () => useContext(AuthContext).isAuthenticating;
export const useLoggedInPatients = () => useContext(AuthContext).loggedInPatients;
export const useAuthError = () => useContext(AuthContext).authError;
export const useAuth = () => {
  const currentPatient = useCurrentPatient();
  const setCurrentPatient = useContext(AuthContext).setCurrentPatient!;
  const isLoggedIn = useIsLoggedIn();
  const isAuthenticating = useIsAuthenticating();
  const loggedInPatients = useContext(AuthContext).loggedInPatients;
  const buildCaptchaVerifier = useContext(AuthContext).buildCaptchaVerifier!;
  const verifyPhoneNumber = useContext(AuthContext).verifyPhoneNumber!;
  const verifyOtp = useContext(AuthContext).verifyOtp!;
  const signIn = useContext(AuthContext).signIn!;
  const signOut = useContext(AuthContext).signOut!;
  return {
    currentPatient,
    setCurrentPatient,
    isAuthenticating,
    isLoggedIn,
    loggedInPatients,
    buildCaptchaVerifier,
    verifyPhoneNumber,
    verifyOtp,
    signIn,
    signOut,
  };
};

export const useLoginPopupState = (): {
  loginPopupVisible: AuthProviderProps['loginPopupVisible'];
  setLoginPopupVisible: NonNullable<AuthProviderProps['setLoginPopupVisible']>;
} => {
  const loginPopupVisible = useContext(AuthContext).loginPopupVisible;
  const setLoginPopupVisible = useContext(AuthContext).setLoginPopupVisible!;
  return { loginPopupVisible, setLoginPopupVisible };
};
