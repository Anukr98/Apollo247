import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import { AppContainer } from '@aph/mobile-doctors/src/components/AppContainer';

AppRegistry.registerComponent(appName, () => AppContainer);
