import 'react-native-gesture-handler';

import { AppRegistry, YellowBox } from 'react-native';
import { name as appName } from './app.json';
import AppContainer from '@aph/mobile-patients/src/components/AppContainer';
import { aphConsole, updateCallKitNotificationReceivedStatus } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { callKitRecievedAcknowledgement } from '@aph/mobile-patients/src/components/NotificationListener';
import messaging from '@react-native-firebase/messaging';
import { handleOpenURL } from '@aph/mobile-patients/src/helpers/deeplinkRedirection';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';


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

messaging().setBackgroundMessageHandler((notification) => {
  console.log("notification.data ==============", notification);
  if (notification.data?.type === "call_start") {
    console.log("callKitRecievedAcknowledgement notification==============")
    updateCallKitNotificationReceivedStatus(notification.data?.appointmentId);
    // callKitRecievedAcknowledgement({}, notification.data?.appointmentId);
    // handleOpenURL(`${AppConfig.Configuration.returnUrl}/call_start?appointmentId=${notification.data?.appointmentId}`);
  }
});

console.ignoredYellowBox = ['Warning: Each', 'Warning: Failed'];
console.disableYellowBox = true;

AppRegistry.registerComponent(appName, () => AppContainer);
