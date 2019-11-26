import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import { AppContainer } from '@aph/mobile-patients/src/components/AppContainer';
import { Client, Configuration } from 'bugsnag-react-native';

const configuration = new Configuration();
configuration.autoCaptureSessions = true;
configuration.automaticallyCollectBreadcrumbs = true;
configuration.autoNotify = true;

const bugsnag = new Client('7839e425f4acbd8e6ff3f907281addca');
const bugsnagConfigure = new Client(configuration);

bugsnagConfigure.startSession();

AppRegistry.registerComponent(appName, () => AppContainer);
