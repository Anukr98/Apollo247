import { AppCommonDataProvider } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { AuthProvider } from '@aph/mobile-patients/src/components/AuthProvider';
import { DiagnosticsCartProvider } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { NavigatorContainer } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { ShoppingCartProvider } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { UIElementsProvider } from '@aph/mobile-patients/src/components/UIElementsProvider';
import React from 'react';
import { Text, TextInput } from 'react-native';
import Axios from 'axios';

if (__DEV__) {
  Axios.interceptors.request.use((request) => {
    // console.log(
    //   '\n\nStarting Axios Request',
    //   '\n\nURL\n',
    //   JSON.stringify(request.url),
    //   '\n\nInput\n',
    //   JSON.stringify(request.data),
    //   '\n\nHeaders\n',
    //   JSON.stringify(request.headers),
    //   '\n\n'
    // );
    return request;
  });
}

if (__DEV__) {
  Axios.interceptors.response.use((response) => {
    // console.log(`Axios Response :\n`, response.data, '\n\n');
    return response;
  });
}
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
      <AppCommonDataProvider>
        <AuthProvider>
          <UIElementsProvider>
            <ShoppingCartProvider>
              <DiagnosticsCartProvider>
                <NavigatorContainer />
              </DiagnosticsCartProvider>
            </ShoppingCartProvider>
          </UIElementsProvider>
        </AuthProvider>
      </AppCommonDataProvider>
    );
  }
}
