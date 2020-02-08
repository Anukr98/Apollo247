// import mockAsyncStorage from '@react-native-community/async-storage/jest/async-storage-mock';

// jest.mock('@react-native-community/async-storage', () => mockAsyncStorage);
jest.mock('opentok-react-native', () => {});
jest.mock('react-native-gesture-handler', () => {});

jest.mock('react-navigation', () => {
  return {
    createAppContainer: jest.fn().mockReturnValue(function NavigationContainer(props) {
      return null;
    }),
    createDrawerNavigator: jest.fn(),
    createMaterialTopTabNavigator: jest.fn(),
    createStackNavigator: jest.fn(),
    StackActions: {
      push: jest.fn().mockImplementation((x) => ({ ...x, type: 'Navigation/PUSH' })),
      replace: jest.fn().mockImplementation((x) => ({ ...x, type: 'Navigation/REPLACE' })),
    },
    NavigationActions: {
      navigate: jest.fn().mockImplementation((x) => x),
    },
    createBottomTabNavigator: jest.fn(),
    addListener: jest.fn(),
    replace: jest.fn(),
  };
});

jest.mock('react-native-calendars', () => {
  return {
    Calendar: jest.fn(),
  };
});
// import { NativeEventEmitter } from 'react-native';

// jest.mock('NativeEventEmitter');

// const nativeEmitter = new NativeEventEmitter();
// nativeEmitter.emit('SomeEventYouListenTo');
