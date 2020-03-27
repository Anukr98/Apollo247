import { useContext, useEffect } from 'react';
import { AuthContext } from '@aph/mobile-patients/src/components/AuthProvider';
import { Relation } from '@aph/mobile-patients/src/graphql/types/globalTypes';

const useAuthContext = () => useContext(AuthContext);

export const useAnalytics = () => useContext(AuthContext).analytics!;

export const useAuth = () => {
  const sendOtp = useAuthContext().sendOtp!;
  const sendOtpError = useAuthContext().sendOtpError;
  const isSendingOtp = useAuthContext().isSendingOtp;

  const signInError = useAuthContext().signInError;
  const isSigningIn = useAuthContext().isSigningIn;
  const signOut = useAuthContext().signOut!;

  const analytics = useAnalytics();
  const allPatients = useAuthContext().allPatients!;
  const setAllPatients = useAuthContext().setAllPatients!;

  const getPatientApiCall = useAuthContext().getPatientApiCall!;
  const getPatientByPrism = useAuthContext().getPatientByPrism!;

  const mobileAPICalled = useAuthContext().mobileAPICalled;
  const setMobileAPICalled = useAuthContext().setMobileAPICalled;

  const getFirebaseToken = useAuthContext().getFirebaseToken;

  return {
    sendOtp,
    sendOtpError,
    isSendingOtp,

    signInError,
    isSigningIn,
    signOut,

    analytics,
    allPatients,
    setAllPatients,

    getPatientApiCall,
    getPatientByPrism,

    mobileAPICalled,
    setMobileAPICalled,
    getFirebaseToken,
  };
};

export const useCurrentPatient = () => useAllCurrentPatients().currentPatient;

export const useAllCurrentPatients = () => {
  const patientsArray = useAuthContext().allPatients;
  const mobileAPICalled = useAuthContext().mobileAPICalled;

  // console.log('patientsArray', patientsArray);

  const setCurrentPatientId = useAuthContext().setCurrentPatientId!;
  const currentPatientId = useAuthContext().currentPatientId;
  let allCurrentPatients: any;

  if (mobileAPICalled) {
    allCurrentPatients =
      patientsArray && patientsArray.data && patientsArray.data.getCurrentPatients
        ? patientsArray.data.getCurrentPatients.patients
        : null;
  } else {
    allCurrentPatients =
      patientsArray && patientsArray.data && patientsArray.data.getPatientByMobileNumber
        ? patientsArray.data.getPatientByMobileNumber.patients
        : null;
  }

  const currentPatient = allCurrentPatients
    ? allCurrentPatients.find((patient: any) => patient.id === currentPatientId) ||
      allCurrentPatients.find((patient: any) => patient.relation === Relation.ME)
    : null;

  // console.log('currentPatient', currentPatient);
  // console.log('allCurrentPatients', allCurrentPatients);
  useEffect(() => {
    if (!currentPatientId) {
      const defaultCurrentPatient = allCurrentPatients
        ? allCurrentPatients.find((patient: any) => patient.relation === Relation.ME) ||
          allCurrentPatients[0]
        : null;
      setCurrentPatientId(defaultCurrentPatient ? defaultCurrentPatient.id : null);
      // console.log('currentPatientId', currentPatientId);
      // console.log('defaultCurrentPatient', defaultCurrentPatient);
    }
  }, [allCurrentPatients, currentPatientId, setCurrentPatientId]);

  return {
    allCurrentPatients,
    currentPatient,
    setCurrentPatientId,
  };
};
