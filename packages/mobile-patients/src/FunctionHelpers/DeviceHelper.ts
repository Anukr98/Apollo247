//
// Copyright © 2017-Present, Punchh, Inc.
// All rights reserved.
//
'use strict';

import { Dimensions, Platform } from 'react-native';
import firebase from 'react-native-firebase';
import { aphConsole } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { AppConfig, AppEnv } from '@aph/mobile-patients/src/strings/AppConfig';
import { Client } from 'bugsnag-react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Bugfender from '@bugfender/rn-bugfender';

const { height, width } = Dimensions.get('window');
const bugsnag = new Client();
const isReleaseOn = AppConfig.APP_ENV == AppEnv.PROD;

Bugfender.init('brmAJ2pHunypOwF6EpcWyOf5mffsl2Ea');

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

export const CommonLogEvent = async (stringName: string, parameterName: string) => {
  if (isReleaseOn) {
    try {
      const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
      firebase.analytics().logEvent(stringName, {
        Button_Action: parameterName,
        phoneNumber: storedPhoneNumber as string,
      });
    } catch (error) {
      CommonBugFender('DeviceHelper_CommonLogEvent_try', error);
      aphConsole.log('CommonLogEvent error', error);
    }
  }
};

export const CommonScreenLog = (stringName: string, parameterName: string) => {
  if (isReleaseOn) {
    try {
      AsyncStorage.setItem('setCurrentName', stringName);

      firebase.analytics().setCurrentScreen(stringName, parameterName);
    } catch (error) {
      CommonBugFender('DeviceHelper_CommonScreenLog_try', error);
      aphConsole.log('CommonScreenLog error', error);
    }
  }
};

export const CommonBugFender = async (stringName: string, errorValue: Error) => {
  try {
    // const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
    // bugsnag.notify(errorValue, function(report) {
    //   report.metadata = {
    //     stringName: {
    //       viewSource:
    //         Platform.OS === 'ios'
    //           ? DEVICE_TYPE.IOS + ' ' + isEnvironment + ' ' + stringName
    //           : DEVICE_TYPE.ANDROID + ' ' + isEnvironment + ' ' + stringName,
    //       errorValue: errorValue as any,
    //       phoneNumber: storedPhoneNumber as string,
    //     },
    //   };
    // });
    const phoneNumber = await AsyncStorage.getItem('phoneNumber');
    const devicePlatform = Platform.OS === 'ios' ? 'iOS' : 'android';
    const error = JSON.stringify(errorValue);
    console.log('setBugFenderLog', error);
    Bugfender.d(`${stringName} ${phoneNumber}`, `${devicePlatform} ${error}`);
  } catch (error) {
    aphConsole.log('CommonBugFender error', error);
  }
};

export const CommonSetUserBugsnag = (phoneNumber: string) => {
  try {
    bugsnag.setUser(phoneNumber, phoneNumber);
  } catch (error) {
    aphConsole.log('CommonSetUserBugsnag error', error);
  }
};

export const setBugFenderLog = async (stringName: string, errorValue?: any) => {
  try {
    const phoneNumber = await AsyncStorage.getItem('phoneNumber');
    const devicePlatform = Platform.OS === 'ios' ? 'iOS' : 'android';
    const error = JSON.stringify(errorValue);
    console.log('setBugFenderLog', error);
    Bugfender.d(`${stringName} ${phoneNumber}`, `${devicePlatform} ${error}`);
  } catch (error) {
    aphConsole.log('setBugFenderLog error', error);
  }
};

export const setBugfenderPhoneNumber = async () => {
  const phoneNumber = await AsyncStorage.getItem('phoneNumber');
  Bugfender.setDeviceString('PHONE_NUMBER', phoneNumber);
};
