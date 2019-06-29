import { useContext } from 'react';
import { AuthContext, AuthProviderProps } from 'components/AuthProvider';

export const useCurrentUser = () => useContext(AuthContext).currentUser!;

export const useIsLoggedIn = () => useCurrentUser() != null;

export const useAuth = () => {
  const currentUser = useContext(AuthContext).currentUser!;
  const authenticating = useContext(AuthContext).authenticating;
  const buildCaptchaVerifier = useContext(AuthContext).buildCaptchaVerifier!;
  const verifyPhoneNumber = useContext(AuthContext).verifyPhoneNumber!;
  const verifyOtp = useContext(AuthContext).verifyOtp!;
  const signIn = useContext(AuthContext).signIn!;
  const signOut = useContext(AuthContext).signOut!;
  return {
    currentUser,
    authenticating,
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
