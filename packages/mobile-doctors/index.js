import 'react-native-gesture-handler';
import AppContainer from '@aph/mobile-doctors/src/components/AppContainer';
import { Client, Configuration } from 'bugsnag-react-native';
import { AppRegistry, YellowBox } from 'react-native';
import { name as appName } from './app.json';

if (__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'));
}

const configuration = new Configuration();
configuration.autoCaptureSessions = true;
configuration.automaticallyCollectBreadcrumbs = true;
configuration.autoNotify = true;

// const bugsnag = new Client('7839e425f4acbd8e6ff3f907281addca');
const bugsnag = new Client('d41528059b46a59724b9ec07a7225360');
const bugsnagConfigure = new Client(configuration);

bugsnagConfigure.startSession();

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
