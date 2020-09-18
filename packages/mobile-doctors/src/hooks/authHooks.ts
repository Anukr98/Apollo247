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
    getDoctorDetailsApi,
    getDoctorDetailsError,
    setDoctorDetailsError,
    getSpecialties,
    specialties,
    getHelplineNumbers,
    helpLineNumbers,
  } = useContext(AuthContext);
  return {
    analytics,
    isLoggedIn,
    firebaseUser,
    setDoctorDetails,
    doctorDetails,
    sendOtp,
    verifyOtp,
    clearFirebaseUser,
    getDoctorDetailsApi,
    getDoctorDetailsError,
    setDoctorDetailsError,
    getSpecialties,
    specialties,
    getHelplineNumbers,
    helpLineNumbers,
  };
};
