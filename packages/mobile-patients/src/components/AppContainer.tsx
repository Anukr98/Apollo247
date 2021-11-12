import { AppCommonDataProvider } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { AuthProvider } from '@aph/mobile-patients/src/components/AuthProvider';
import { CodePushInfoUi } from '@aph/mobile-patients/src/components/CodePushInfoUi';
import { DiagnosticsCartProvider } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { NavigatorContainer } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { ShoppingCartProvider } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { UIElementsProvider } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { AppConfig, AppEnv } from '@aph/mobile-patients/src/strings/AppConfig';
import React from 'react';
import { Platform, Text, TextInput, TouchableOpacity } from 'react-native';
import codePush, { CodePushOptions, DownloadProgress } from 'react-native-code-push';
import { ReferralProgramProvider } from '@aph/mobile-patients/src/components/ReferralProgramProvider';

let codePushOptions: CodePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.ON_NEXT_RESTART,
  mandatoryInstallMode: codePush.InstallMode.ON_NEXT_RESTART,
  deploymentKey:
    Platform.OS == 'android'
      ? AppConfig.Configuration.CODE_PUSH_DEPLOYMENT_KEY_ANDROID
      : AppConfig.Configuration.CODE_PUSH_DEPLOYMENT_KEY_IOS,
};

if (AppConfig.APP_ENV !== AppEnv.PROD) {
  codePushOptions['updateDialog'] = {};
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
    (TouchableOpacity as any).defaultProps.activeOpacity = 1;
  }

  codePushStatusDidChange(status: codePush.SyncStatus) {
    //Enable silent code push updates
    if (AppConfig.APP_ENV !== AppEnv.PROD) {
      this.setState({ codePushInfo: { ...this.state.codePushInfo, syncStatus: status } });
    }
  }

  codePushDownloadDidProgress(progress: DownloadProgress) {
    //Enable silent code push updates
    if (AppConfig.APP_ENV !== AppEnv.PROD) {
      this.setState({ codePushInfo: { ...this.state.codePushInfo, downloadProgress: progress } });
    }
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
                  <ReferralProgramProvider>
                    <NavigatorContainer />
                    {this.renderCodePushUi()}
                  </ReferralProgramProvider>
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
