import { AsyncStorage } from 'react-native';
import { LocalStorage } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { GetDoctorDetails_getDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';

export const getLocalData = async () => {
  const data = await Promise.all([
    AsyncStorage.getItem('isOnboardingDone'),
    AsyncStorage.getItem('isProfileFlowDone'),
    AsyncStorage.getItem('doctorDetails'),
    AsyncStorage.getItem('isLoggedIn'),
  ]);
  return {
    isOnboardingDone: !!data[0],
    isProfileFlowDone: !!data[1],
    doctorDetails: JSON.parse(data[2] || 'null'),
    isLoggedIn: !!data[3],
  } as LocalStorage;
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

export const setLoggedIn = async (flag: boolean) => {
  await AsyncStorage.setItem('isLoggedIn', flag.toString());
};

export const clearUserData = async () => {
  await Promise.all([
    AsyncStorage.setItem('isProfileFlowDone', ''),
    AsyncStorage.setItem('doctorDetails', ''),
    AsyncStorage.setItem('isLoggedIn', ''),
  ]);
};
