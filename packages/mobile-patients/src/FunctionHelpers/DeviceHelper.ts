import AsyncStorage from '@react-native-community/async-storage';
import crashlytics from '@react-native-firebase/crashlytics';
import { Dimensions, Platform } from 'react-native';

let phoneNumber = '';
const { height, width } = Dimensions.get('window');

export const isIphone5s = () => height === 568;

export const DeviceHelper = () => {
  const isIphoneX = () => {
    return Platform.OS === 'ios' && !Platform.isPad && (height >= 812 || width >= 812);
  };

  return {
    isIphoneX,
  };
};

export const isIos = () => Platform.OS === 'ios';

export const CommonLogEvent = async (title: string, data?: any) => {
  try {
    phoneNumber = phoneNumber || (await AsyncStorage.getItem('phoneNumber')) || '';
    crashlytics().setUserId(phoneNumber);
    crashlytics().log(`${title} - ${JSON.stringify(data)}`);
  } catch (error) {}
};

export const CommonBugFender = async (stringName: string, errorValue: Error | any) => {
  try {
    phoneNumber = phoneNumber || (await AsyncStorage.getItem('phoneNumber')) || '';
    await crashlytics().setUserId(phoneNumber);
    await crashlytics().setAttribute('issueId', stringName);
    await crashlytics().log(stringName);
    await crashlytics().recordError(errorValue);
    await crashlytics().setAttribute('issueId', '');
  } catch (error) {}
};

export const setBugFenderLog = CommonLogEvent;
