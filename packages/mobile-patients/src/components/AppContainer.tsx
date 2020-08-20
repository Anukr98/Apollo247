import { AppCommonDataProvider } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { AuthProvider } from '@aph/mobile-patients/src/components/AuthProvider';
import { DiagnosticsCartProvider } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { NavigatorContainer } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { ShoppingCartProvider } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { UIElementsProvider } from '@aph/mobile-patients/src/components/UIElementsProvider';
import React from 'react';
import { Text, TextInput, Platform } from 'react-native';
import Axios from 'axios';
import codePush, { CodePushOptions, DownloadProgress } from 'react-native-code-push';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { CodePushInfoUi } from '@aph/mobile-patients/src/components/CodePushInfoUi';

const codePushOptions: CodePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.ON_NEXT_RESTART,
  mandatoryInstallMode: codePush.InstallMode.ON_NEXT_RESTART,
  deploymentKey:
    Platform.OS == 'android'
      ? AppConfig.Configuration.CODE_PUSH_DEPLOYMENT_KEY_ANDROID
      : AppConfig.Configuration.CODE_PUSH_DEPLOYMENT_KEY_IOS,
  updateDialog: {},
};

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

export type CodePushInfo = {
  syncStatus?: codePush.SyncStatus;
  downloadProgress?: DownloadProgress;
};

interface AppContainerProps {}
interface AppContainerState {
  codePushInfo: CodePushInfo;
}

class AppContainer extends React.Component<AppContainerProps, AppContainerState> {
  constructor(props: AppContainerProps) {
    super(props);
    this.state = { codePushInfo: {} };
    (Text as any).defaultProps = (Text as any).defaultProps || {};
    (Text as any).defaultProps.allowFontScaling = false;
    (TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
    (TextInput as any).defaultProps.allowFontScaling = false;
  }

  codePushStatusDidChange(status: codePush.SyncStatus) {
    this.setState({ codePushInfo: { ...this.state.codePushInfo, syncStatus: status } });
  }

  codePushDownloadDidProgress(progress: DownloadProgress) {
    this.setState({ codePushInfo: { ...this.state.codePushInfo, downloadProgress: progress } });
  }

  renderCodePushUi = () => {
    return <CodePushInfoUi codePushInfo={this.state.codePushInfo} />;
  };

  render() {
    return (
      <>
        <AppCommonDataProvider>
          <AuthProvider>
            <UIElementsProvider>
              <ShoppingCartProvider>
                <DiagnosticsCartProvider>
                  <NavigatorContainer />
                  {this.renderCodePushUi()}
                </DiagnosticsCartProvider>
              </ShoppingCartProvider>
            </UIElementsProvider>
          </AuthProvider>
        </AppCommonDataProvider>
      </>
    );
  }
}

export default codePush(codePushOptions)(AppContainer);
