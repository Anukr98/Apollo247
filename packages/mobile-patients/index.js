import 'react-native-gesture-handler';

import { AppRegistry, YellowBox } from 'react-native';
import { name as appName } from './app.json';
import AppContainer from '@aph/mobile-patients/src/components/AppContainer';
import { aphConsole } from '@aph/mobile-patients/src/helpers/helperFunctions';

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

console.ignoredYellowBox = ['Warning: Each', 'Warning: Failed'];
console.disableYellowBox = true;

AppRegistry.registerComponent(appName, () => AppContainer);
