import { useContext } from 'react';
import { AuthContext } from 'app/src/components/AuthProvider';

export const useAnalytics = () => useContext(AuthContext).analytics!;
export const useIsLoggedIn = () => useCurrentUser() != null;
export const useIsAuthenticating = () => useContext(AuthContext).isAuthenticating;
export const useCurrentUser = () => useContext(AuthContext).currentUser!;
export const useAuth = () => {
  const analytics = useAnalytics();
  const isLoggedIn = useIsLoggedIn();
  const isAuthenticating = useIsAuthenticating();
  const currentUser = useContext(AuthContext).currentUser!;
  const verifyPhoneNumber = useContext(AuthContext).verifyPhoneNumber!;
  const verifyOtp = useContext(AuthContext).verifyOtp!;
  const signIn = useContext(AuthContext).signIn!;
  const signOut = useContext(AuthContext).signOut!;
  return {
    analytics,
    isAuthenticating,
    isLoggedIn,
    currentUser,
    verifyPhoneNumber,
    verifyOtp,
    signIn,
    signOut,
  };
};
