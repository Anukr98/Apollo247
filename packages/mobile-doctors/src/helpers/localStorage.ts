import { AsyncStorage } from 'react-native';
import { LocalStorage } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { GetDoctorDetails_getDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';

export const getLocalData = async () => {
  const data = await Promise.all([
    AsyncStorage.getItem('isLoggedIn'),
    AsyncStorage.getItem('isOnboardingDone'),
    AsyncStorage.getItem('isProfileFlowDone'),
    AsyncStorage.getItem('doctorDetails'),
  ]);
  return {
    isLoggedIn: !!data[0],
    isOnboardingDone: !!data[1],
    isProfileFlowDone: !!data[2],
    doctorDetails: JSON.parse(data[3] || 'null'),
  } as LocalStorage;
};

export const setLoggedIn = async (flag: boolean) => {
  await AsyncStorage.setItem('isLoggedIn', flag.toString());
};

export const setProfileFlowDone = async (flag: boolean) => {
  await AsyncStorage.setItem('isProfileFlowDone', flag.toString());
};

export const setOnboardingDone = async (flag: boolean) => {
  await AsyncStorage.setItem('isOnboardingDone', flag.toString());
};

export const setDoctorDetails = async (doctorDetails: GetDoctorDetails_getDoctorDetails | null) => {
  await AsyncStorage.setItem('doctorDetails', JSON.stringify(doctorDetails));
};

export const clearUserData = async () => {
  await Promise.all([
    AsyncStorage.setItem('isProfileFlowDone', ''),
    AsyncStorage.setItem('isLoggedIn', ''),
    AsyncStorage.setItem('doctorDetails', ''),
  ]);
};
