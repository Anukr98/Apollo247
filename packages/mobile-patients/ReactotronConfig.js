import Reactotron, { networking } from 'reactotron-react-native';
import { AsyncStorage } from 'react-native';

Reactotron.setAsyncStorageHandler(AsyncStorage) // AsyncStorage would either come from `react-native` or `@react-native-community/async-storage` depending on where you get it from
  .configure() // controls connection & communication settings
  .useReactNative() // add all built-in react native plugins
  .use(networking())
  .connect(); // let's connect!
