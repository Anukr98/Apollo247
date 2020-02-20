'use strict';

import { DOCTOR_DEVICE_TYPE } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import { AppConfig } from '@aph/mobile-doctors/src/helpers/AppConfig';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import { Client } from 'bugsnag-react-native';
import { Dimensions, Platform } from 'react-native';

const bugsnag = new Client();
const isEnvironment = AppConfig.Configuration.LOG_ENVIRONMENT;

export const DeviceHelper = () => {
  const isIphoneX = () => {
    const { height, width } = Dimensions.get('window');
    return Platform.OS === 'ios' && !Platform.isPad && (height >= 812 || width >= 812);
  };

  return {
    isIphoneX,
  };
};

export const CommonBugFender = async (stringName: string, errorValue: Error) => {
  const { doctorDetails } = useAuth();
  try {
    const storedPhoneNumber = doctorDetails && doctorDetails.mobileNumber;
    bugsnag.notify(errorValue, (report) => {
      report.metadata = {
        stringName: {
          viewSource:
            Platform.OS === 'ios'
              ? DOCTOR_DEVICE_TYPE.IOS + ' ' + isEnvironment + ' ' + stringName
              : DOCTOR_DEVICE_TYPE.ANDROID + ' ' + isEnvironment + ' ' + stringName,
          errorValue: errorValue as any,
          phoneNumber: storedPhoneNumber as string,
        },
      };
    });
  } catch (error) {
    console.log('CommonBugFender error', error);
  }
};
