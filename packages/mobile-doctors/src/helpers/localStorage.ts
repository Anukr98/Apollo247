import { AsyncStorage } from 'react-native';
import { LocalStorage } from 'app/src/helpers/commonTypes';

export const getLocalData = async () => {
  const data = await Promise.all([
    AsyncStorage.getItem('isLoggedIn'),
    AsyncStorage.getItem('isOnboardingDone'),
    AsyncStorage.getItem('isProfileFlowDone'),
  ]);
  return {
    isLoggedIn: !!data[0],
    isOnboardingDone: !!data[1],
    isProfileFlowDone: !!data[2],
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

export const clearUserData = async () => {
  await Promise.all([
    AsyncStorage.setItem('isProfileFlowDone', ''),
    await AsyncStorage.setItem('isLoggedIn', ''),
  ]);
};
