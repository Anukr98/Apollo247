import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import { AppContainer } from '@aph/mobile-doctors/src/components/AppContainer';
if (__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'));
}

AppRegistry.registerComponent(appName, () => AppContainer);
