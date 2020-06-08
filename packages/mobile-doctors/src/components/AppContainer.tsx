import * as React from 'react';
import { NavigatorContainer } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { AuthProvider } from '@aph/mobile-doctors/src/components/AuthProvider';
import { UIElementsProvider } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { Alert } from 'react-native';
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';
import { getBuildEnvironment } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import RNExitApp from 'react-native-exit-app';
import { NotificationProvider } from '@aph/mobile-doctors/src/components/Notification/NotificationContext';

const reporter = (error: Error, type: 'JS' | 'Native') => {
  // Logic for reporting to devs
  console.log(error, type);
  if (getBuildEnvironment() == 'PROD') {
    // Note: Get firebase credentials and insert or post to some other service if required
    //   Promise.all([
    //     DeviceInfo.getDeviceName(),
    //     DeviceInfo.getApiLevel(),
    //     AsyncStorage.getItem('currentPatient'),
    //     AsyncStorage.getItem('selectUserId'),
    //   ])
    //     .then(([DeviceName, ApiLevel, currentPatients, selectUserId]) => {
    //       postToFirebase(currentPatients, selectUserId, error, type, ApiLevel, DeviceName);
    //     })
    //     .catch((error) => {
    //       console.log({ error });
    //     });
  }
};

const errorHandler = (e: Error, isFatal: boolean) => {
  if (isFatal) {
    reporter(e, 'JS');
    Alert.alert(
      'Uh oh.. :(',
      'Oops! Unexpected error occurred. We have reported this to our team. Please close the app and start again.',
      [
        {
          text: 'OK, GOT IT',
          onPress: () => {
            RNExitApp.exitApp();
          },
        },
      ]
    );
  } else {
    console.log(e); // So that we can see it in the ADB logs in case of Android if needed
  }
};

setJSExceptionHandler(errorHandler, /* showAlertInDevMode: */ false);

setNativeExceptionHandler((exceptionString) => {
  reporter(exceptionString, 'Native');
  // This is your custom global error handler
  // You do stuff like hit google analytics to track crashes.
  // or hit a custom api to inform the dev team.
  //NOTE: alert or showing any UI change via JS
  //WILL NOT WORK in case of NATIVE ERRORS.
});

export const AppContainer: React.FC = () => {
  console.disableYellowBox = true;
  return (
    <AuthProvider>
      <UIElementsProvider>
        <NotificationProvider>
          <NavigatorContainer />
        </NotificationProvider>
      </UIElementsProvider>
    </AuthProvider>
  );
};
