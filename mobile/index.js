import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import { AppContainer } from 'app/src/__new__/components/AppContainer';

AppRegistry.registerComponent(appName, () => AppContainer);
