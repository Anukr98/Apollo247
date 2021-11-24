import 'react-native-gesture-handler';

import { AppRegistry, YellowBox } from 'react-native';
import { name as appName } from './app.json';
import AppContainer from '@aph/mobile-patients/src/components/AppContainer';
import { aphConsole, updateCallKitNotificationReceivedStatus } from '@aph/mobile-patients/src/helpers/helperFunctions';
import messaging from '@react-native-firebase/messaging';


if (__DEV__) {
  import('./ReactotronConfig').then(() => aphConsole.log('Reactotron Configured'));
}

YellowBox.ignoreWarnings([
  'Warning: isMounted(...) is deprecated',
  'Module RCTImageLoader',
  'Module RCTCameraManager',
  'Module RCTCardIOUtilities',
  'Module RNFetchBlob',
]);

messaging().setBackgroundMessageHandler(async (notification) => {
  if (notification.data?.type === "call_start") {
    updateCallKitNotificationReceivedStatus(notification.data?.appointmentId);
  }
});

console.ignoredYellowBox = ['Warning: Each', 'Warning: Failed'];
console.disableYellowBox = true;

AppRegistry.registerComponent(appName, () => AppContainer);
