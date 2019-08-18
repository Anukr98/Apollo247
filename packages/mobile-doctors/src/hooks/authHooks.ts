import { useContext } from 'react';
import { AuthContext } from '@aph/mobile-doctors/src/components/AuthProvider';

export const useAuth = () => {
  const analytics = useContext(AuthContext).analytics;
  const firebaseUser = useContext(AuthContext).firebaseUser;
  const setDoctorDetails = useContext(AuthContext).setDoctorDetails;
  const doctorDetails = useContext(AuthContext).doctorDetails;
  const isLoggedIn = !!firebaseUser;
  const sendOtp = useContext(AuthContext).sendOtp;
  const verifyOtp = useContext(AuthContext).verifyOtp;
  const clearFirebaseUser = useContext(AuthContext).clearFirebaseUser;
  return {
    analytics,
    isLoggedIn,
    firebaseUser,
    setDoctorDetails,
    doctorDetails,
    sendOtp,
    verifyOtp,
    clearFirebaseUser,
  };
};
