import { useContext } from 'react';
import { AuthContext, AuthContextProps } from 'components/AuthProvider';
import { GET_DOCTOR_DETAILS } from 'graphql/profiles';
import { useQuery } from 'react-apollo-hooks';
import { GetDoctorDetails } from 'graphql/types/GetDoctorDetails';
import { isTest } from 'helpers/testHelpers';

const useAuthContext = () => useContext(AuthContext);

export const useCurrentPatient = () => {
  const doctorFromAuthCache = useAuthContext().currentPatient;
  const isSigningIn = useAuthContext().isSigningIn;
  const { data } = useQuery<GetDoctorDetails>(GET_DOCTOR_DETAILS, {
    skip: !!doctorFromAuthCache || (!isTest() && isSigningIn),
  });
  const doctorFromQuery = data && data.getDoctorDetails ? data.getDoctorDetails : null;
  return doctorFromAuthCache || doctorFromQuery;
};
// export const useAllCurrentPatients = () => useAuthContext().allCurrentPatients;
// export const useIsSignedIn = () => useAllCurrentPatients() != null;

export const useAuth = () => {
  const currentPatient = useCurrentPatient();
  const setCurrentPatient = useAuthContext().setCurrentPatient!;
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
