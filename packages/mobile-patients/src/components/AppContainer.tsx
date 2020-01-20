import { AuthProvider } from '@aph/mobile-patients/src/components/AuthProvider';
import { NavigatorContainer } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { ShoppingCartProvider } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { UIElementsProvider } from '@aph/mobile-patients/src/components/UIElementsProvider';
import React from 'react';
import { Text, TextInput, Alert, BackAndroid } from 'react-native';
import { DiagnosticsCartProvider } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppCommonDataProvider } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';

const reporter = (error: string, type?: 'JS' | 'Native') => {
  // Logic for reporting to devs
  // Example : Log issues to github issues using github apis.
  console.log(error, type);
};

const errorHandler = (e: any, isFatal: boolean) => {
  if (isFatal) {
    reporter(e, 'JS');
    Alert.alert(
      'Uh oh.. :(',
      'Oops! Unexpected error occurred. We have reported this to our team. Please close the app and start again.',
      [
        {
          text: 'OK, GOT IT',
          onPress: () => {
            BackAndroid.exitApp();
          },
        },
      ]
    );
  } else {
    console.log(e); // So that we can see it in the ADB logs in case of Android if needed
  }
};

setJSExceptionHandler(errorHandler);

setNativeExceptionHandler((exceptionString) => {
  reporter(exceptionString, 'Native');
  // This is your custom global error handler
  // You do stuff likehit google analytics to track crashes.
  // or hit a custom api to inform the dev team.
  //NOTE: alert or showing any UI change via JS
  //WILL NOT WORK in case of NATIVE ERRORS.
});

interface AppContainerTypes {}

export class AppContainer extends React.Component<AppContainerTypes> {
  constructor(props: AppContainerTypes) {
    super(props);
    (Text as any).defaultProps = (Text as any).defaultProps || {};
    (Text as any).defaultProps.allowFontScaling = false;
    (TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
    (TextInput as any).defaultProps.allowFontScaling = false;
  }

  render() {
    return (
      <AuthProvider>
        <UIElementsProvider>
          <AppCommonDataProvider>
            <ShoppingCartProvider>
              <DiagnosticsCartProvider>
                <NavigatorContainer />
              </DiagnosticsCartProvider>
            </ShoppingCartProvider>
          </AppCommonDataProvider>
        </UIElementsProvider>
      </AuthProvider>
    );
  }
}
