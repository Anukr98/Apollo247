//
// Copyright © 2017-Present, Punchh, Inc.
// All rights reserved.
//
'use strict';

import { Dimensions, Platform, AsyncStorage } from 'react-native';
import firebase from 'react-native-firebase';
import { aphConsole } from '../helpers/helperFunctions';

export const DeviceHelper = () => {
  const isIphoneX = () => {
    const { height, width } = Dimensions.get('window');
    return Platform.OS === 'ios' && !Platform.isPad && (height >= 812 || width >= 812);
  };

  return {
    isIphoneX,
  };
};

export const CommonLogEvent = (stringName: string, parameterName: string) => {
  try {
    firebase.analytics().logEvent(stringName, {
      Button_Action: parameterName,
    });
  } catch (error) {
    aphConsole.log('CommonLogEvent error', error);
  }
};

export const CommonScreenLog = (stringName: string, parameterName: string) => {
  AsyncStorage.setItem('setCurrentName', stringName);

  try {
    firebase.analytics().setCurrentScreen(stringName, parameterName);
  } catch (error) {
    aphConsole.log('CommonScreenLog error', error);
  }
};
