import { useContext, useEffect } from 'react';
import { AuthContext } from '@aph/mobile-patients/src/components/AuthProvider';
import { Relation } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import AsyncStorage from '@react-native-community/async-storage';

const useAuthContext = () => useContext(AuthContext);

export const useAuth = () => {
  const sendOtp = useAuthContext().sendOtp!;
  const sendOtpError = useAuthContext().sendOtpError;
  const isSendingOtp = useAuthContext().isSendingOtp;

  const signInError = useAuthContext().signInError;
  const isSigningIn = useAuthContext().isSigningIn;
  const signOut = useAuthContext().signOut!;

  const allPatients = useAuthContext().allPatients!;
  const setAllPatients = useAuthContext().setAllPatients!;

  const getPatientApiCall = useAuthContext().getPatientApiCall!;
  const getPatientByPrism = useAuthContext().getPatientByPrism!;

  const mobileAPICalled = useAuthContext().mobileAPICalled;
  const setMobileAPICalled = useAuthContext().setMobileAPICalled;

  const getFirebaseToken = useAuthContext().getFirebaseToken;

  const authToken = useAuthContext().authToken;
  const validateAuthToken = useAuthContext().validateAuthToken;
  const validateAndReturnAuthToken = useAuthContext().validateAndReturnAuthToken;
  const buildApolloClient = useAuthContext().buildApolloClient;

  return {
    sendOtp,
    sendOtpError,
    isSendingOtp,

    signInError,
    isSigningIn,
    signOut,

    allPatients,
    setAllPatients,

    getPatientApiCall,
    getPatientByPrism,

    mobileAPICalled,
    setMobileAPICalled,
    getFirebaseToken,
    authToken,
    validateAuthToken,
    validateAndReturnAuthToken,
    buildApolloClient,
  };
};

export const useCurrentPatient = () => useAllCurrentPatients().currentPatient;

export const useAllCurrentPatients = () => {
  const getNewSelectedPatient = async () => {
    try {
      const isNewProfile = await AsyncStorage.getItem('isNewProfile');
      if (isNewProfile === 'yes') {
        const retrievedItem: any = await AsyncStorage.getItem('selectUserId');
        Promise.all([retrievedItem]).then((values) => {
          values[0] && setCurrentPatientId(values[0]);
        });
      }
    } catch (error) {}
  };

  const setCurrentPatientId = useAuthContext().setCurrentPatientId!;
  const currentPatientId = useAuthContext().currentPatientId;
  let currentPatient;
  let profileAllPatients;
  let currentPatientWithHistory;

  const { savePatientDetails, savePatientDetailsWithHistory } = useAppCommonData();

  const allCurrentPatients = savePatientDetails;
  const allCurrentPatientsWithHistory = savePatientDetailsWithHistory;

  if (allCurrentPatients) {
    profileAllPatients = allCurrentPatients.filter((obj: any) => {
      return obj.isLinked === false;
    });

    currentPatient = allCurrentPatients
      ? allCurrentPatients.find((patient: any) => patient.id === currentPatientId) ||
        allCurrentPatients.find((patient: any) => patient.isUhidPrimary === true)
      : null;

    currentPatientWithHistory = allCurrentPatientsWithHistory
      ? allCurrentPatientsWithHistory.find((patient: any) => patient.id === currentPatientId) ||
        allCurrentPatientsWithHistory.find((patient: any) => patient.isUhidPrimary === true)
      : null;
  }

  useEffect(() => {
    getNewSelectedPatient();
    if (!currentPatientId) {
      const defaultCurrentPatient = allCurrentPatients
        ? allCurrentPatients.find((patient: any) => patient.isUhidPrimary === true) ||
          allCurrentPatients.find((patient: any) => patient.relation === Relation.ME) ||
          allCurrentPatients[0]
        : null;
      setCurrentPatientId(defaultCurrentPatient ? defaultCurrentPatient.id : null);
    }
  }, [allCurrentPatients, currentPatientId, setCurrentPatientId]);

  return {
    allCurrentPatients,
    currentPatient,
    setCurrentPatientId,
    currentPatientId,
    profileAllPatients,
    currentPatientWithHistory,
  };
};
