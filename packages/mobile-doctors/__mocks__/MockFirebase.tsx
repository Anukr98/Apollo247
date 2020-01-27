// jest.mock('react-native-firebase', () => {
//   return {
//     messaging: jest.fn(() => {
//       return {
//         hasPermission: jest.fn(() => Promise.resolve(true)),
//         subscribeToTopic: jest.fn(),
//         unsubscribeFromTopic: jest.fn(),
//         requestPermission: jest.fn(() => Promise.resolve(true)),
//         getToken: jest.fn(() => Promise.resolve('myMockToken')),
//       };
//     }),
//     notifications: jest.fn(() => {
//       return {
//         onNotification: jest.fn(),
//         onNotificationDisplayed: jest.fn(),
//       };
//     }),
//   };
// });

jest.mock('react-native-firebase', () => {
  return {
    messaging: jest.fn(() => {
      return {
        hasPermission: jest.fn(() => Promise.resolve(true)),
        subscribeToTopic: jest.fn(),
        unsubscribeFromTopic: jest.fn(),
        requestPermission: jest.fn(() => Promise.resolve(true)),
        getToken: jest.fn(() => Promise.resolve('myMockToken')),
      };
    }),
    analytics: jest.fn(() => ({
      logEvent: jest.fn(),
      setAnalyticsCollectionEnabled: jest.fn(),
      setCurrentScreen: jest.fn(),
    })),
    notifications: jest.fn(() => {
      return {
        onNotification: jest.fn(),
        onNotificationDisplayed: jest.fn(),
      };
    }),
    auth: jest.fn(() => {
      return {
        onAuthStateChanged: jest.fn(),
        signInWithPhoneNumber: jest.fn(() => {
          return Promise.resolve('result of signInWithEmailAndPassword');
        }),
      };
    }),
    collection: jest.fn((collectionPath) => {
      doc: jest.fn((documentPath) => {
        //keep mocking here what you use with your collection variable
      });
    }),
  };
});
