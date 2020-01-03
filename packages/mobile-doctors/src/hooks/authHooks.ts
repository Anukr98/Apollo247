import { useContext } from 'react';
import { AuthContext } from '@aph/mobile-doctors/src/components/AuthProvider';

export const useAuth = () => {
  const isLoggedIn = !!firebaseUser;

  const {
    analytics,
    firebaseUser,
    doctorDetails,
    setDoctorDetails,
    sendOtp,
    verifyOtp,
    clearFirebaseUser,
    setIsDelegateLogin,
    isDelegateLogin,
    getDoctorDetailsApi,
    signOut,
  } = useContext(AuthContext);
  return {
    analytics,
    isLoggedIn,
    firebaseUser,
    setDoctorDetails,
    doctorDetails,
    setIsDelegateLogin,
    isDelegateLogin,
    sendOtp,
    verifyOtp,
    clearFirebaseUser,
    getDoctorDetailsApi,
    signOut,
  };
};
