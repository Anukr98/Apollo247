// GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import { AppContainer } from '@aph/mobile-patients/src/components/AppContainer';

AppRegistry.registerComponent(appName, () => AppContainer);
