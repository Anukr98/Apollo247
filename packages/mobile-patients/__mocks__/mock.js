import mockAsyncStorage from '@react-native-community/async-storage/jest/async-storage-mock';

jest.mock('@react-native-community/async-storage', () => mockAsyncStorage);

// jest.mock('react-native', () => ({
//   //   NetInfo: {
//   //     addEventListener: jest.fn(),
//   //     fetch: () => {
//   //       return {
//   //         done: jest.fn(),
//   //       };
//   //     },
//   //   },
//   NativeModules: {
//     RNPasscodeStatus: {
//       supported: jest.fn(),
//       status: jest.fn(),
//       get: jest.fn(),
//     },
//   },
//   Dimensions: {
//     get: () => ({
//       width: jest.fn(),
//       height: jest.fn(),
//     }),
//   },
//   StyleSheet: {
//     create: () => ({}),
//   },
//   Platform: { select: () => {} },
// }));

// jest.mock('react-native-permissions', () => {});
jest.mock('opentok-react-native', () => {});
// jest.mock('react-native-calendars', () => {});
// jest.mock('react-native-calendar-strip', () => {});
jest.mock('react-native-gesture-handler', () => {});
// jest.mock('react-native-elements', () => {});
// // jest.mock('react-native-material-menu', () => {});
// jest.mock('react-native-animatable', () => {});
// jest.mock('react-native-modal', () => {});
// jest.mock('react-native-popup-menu', () => {});
// jest.mock('react-native-app-intro-slider', () => {});
// jest.mock('react-native-hyperlink', () => {});
// jest.mock('react-navigation-stack', () => {});
jest.mock('rn-fetch-blob', () => {
  return {
    DocumentDir: () => {},
    fetch: () => {},
    base64: () => {},
    android: () => {},
    ios: () => {},
    config: () => {},
    session: () => {},
    fs: {
      dirs: {
        MainBundleDir: () => {},
        CacheDir: () => {},
        DocumentDir: () => {},
      },
    },
    wrap: () => {},
    polyfill: () => {},
    JSONStream: () => {},
  };
});

jest.mock('bugsnag-react-native', () => ({
  Configuration: jest.fn(),
  Client: jest.fn(() => ({ leaveBreadcrumb: jest.fn() })),
}));

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

jest.mock('@bugfender/rn-bugfender', () => {});

jest.mock('react-native-calendars', () => {
  return {
    Calendar: jest.fn(),
  };
});

jest.mock('react-native-device-info', () => {
  return {
    getBaseOS: jest.fn(),
  };
});
