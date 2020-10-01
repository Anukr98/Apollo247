import React, { useState } from 'react';
import { NavigatorContainer } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { AuthProvider } from '@aph/mobile-doctors/src/components/AuthProvider';
import { UIElementsProvider } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { Alert, Platform } from 'react-native';
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';
import { getBuildEnvironment } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import RNExitApp from 'react-native-exit-app';
import { NotificationProvider } from '@aph/mobile-doctors/src/components/Notification/NotificationContext';
import { AudioVideoProvider } from '@aph/mobile-doctors/src/components/Chat/AudioVideoCotext';
import codePush, { CodePushOptions, DownloadProgress } from 'react-native-code-push';
import { CodePushInfoUi } from '@aph/mobile-doctors/src/components/CodePushInfoUi';
import { AppConfig } from '@aph/mobile-doctors/src/helpers/AppConfig';

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

export type CodePushInfo = {
  syncStatus?: codePush.SyncStatus;
  downloadProgress?: DownloadProgress;
};

const reporter = (error: Error, type: 'JS' | 'Native') => {
  // Logic for reporting to devs
  console.log(error, type);
  if (getBuildEnvironment() == 'PROD') {
    // Note: Get firebase credentials and insert or post to some other service if required
    //   Promise.all([
    //     DeviceInfo.getDeviceName(),
    //     DeviceInfo.getApiLevel(),
    //     AsyncStorage.getItem('currentPatient'),
    //     AsyncStorage.getItem('selectUserId'),
    //   ])
    //     .then(([DeviceName, ApiLevel, currentPatients, selectUserId]) => {
    //       postToFirebase(currentPatients, selectUserId, error, type, ApiLevel, DeviceName);
    //     })
    //     .catch((error) => {
    //       console.log({ error });
    //     });
  }
};

const errorHandler = (e: Error, isFatal: boolean) => {
  if (isFatal) {
    reporter(e, 'JS');
    Alert.alert(
      'Uh oh.. :(',
      'Oops! Unexpected error occurred. We have reported this to our team. Please close the app and start again.',
      [
        {
          text: 'OK, GOT IT',
          onPress: () => {
            RNExitApp.exitApp();
          },
        },
      ]
    );
  } else {
    console.log(e); // So that we can see it in the ADB logs in case of Android if needed
  }
};

setJSExceptionHandler(errorHandler, /* showAlertInDevMode: */ false);

setNativeExceptionHandler((exceptionString) => {
  reporter(exceptionString, 'Native');
  // This is your custom global error handler
  // You do stuff like hit google analytics to track crashes.
  // or hit a custom api to inform the dev team.
  //NOTE: alert or showing any UI change via JS
  //WILL NOT WORK in case of NATIVE ERRORS.
});

interface AppContainerState {
  codePushInfo: CodePushInfo;
}

const AppContainer: React.FC<AppContainerState> = () => {
  console.disableYellowBox = true;

  const [codePushInfo, setCodePushInfo] = useState({});

  const codePushStatusDidChange = (status: codePush.SyncStatus) => {
    setCodePushInfo({ codePushInfo: { ...codePushInfo, syncStatus: status } });
  };

  const codePushDownloadDidProgress = (progress: DownloadProgress) => {
    setCodePushInfo({ codePushInfo: { ...codePushInfo, downloadProgress: progress } });
  };

  const renderCodePushUi = () => {
    return <CodePushInfoUi codePushInfo={codePushInfo} />;
  };

  return (
    <AuthProvider>
      <UIElementsProvider>
        <NotificationProvider>
          <AudioVideoProvider>
            <NavigatorContainer />
            {renderCodePushUi()}
          </AudioVideoProvider>
        </NotificationProvider>
      </UIElementsProvider>
    </AuthProvider>
  );
};

export default codePush(codePushOptions)(AppContainer);
