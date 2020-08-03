import { CodePushInfo } from '@aph/mobile-patients/src/components/AppContainer';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import codePush, { DownloadProgress } from 'react-native-code-push';
import { ListItem } from 'react-native-elements';

export interface CodePushInfoUiProps {
  codePushInfo: CodePushInfo;
}

export const CodePushInfoUi: React.FC<CodePushInfoUiProps> = ({
  codePushInfo: { syncStatus, downloadProgress },
}) => {
  const convertToMegaByte = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2);

  const getDownloadProgress = (progress: DownloadProgress) =>
    `${convertToMegaByte(progress.receivedBytes)} / ${convertToMegaByte(progress.totalBytes)} MB`;

  const isUiToBeShown =
    syncStatus === codePush.SyncStatus.DOWNLOADING_PACKAGE ||
    syncStatus === codePush.SyncStatus.UPDATE_INSTALLED;

  return isUiToBeShown ? (
    <ListItem
      containerStyle={{ backgroundColor: '#f7f8f5' }}
      titleStyle={theme.viewStyles.text('M', 14, '#02475b')}
      rightContentContainerStyle={{ flexGrow: 0.35 }}
      title={
        syncStatus === codePush.SyncStatus.DOWNLOADING_PACKAGE
          ? `Downloading updates... ${
              downloadProgress ? getDownloadProgress(downloadProgress) : ''
            }`
          : syncStatus === codePush.SyncStatus.UPDATE_INSTALLED
          ? "We've finished downloading an update"
          : ''
      }
      rightTitleStyle={theme.viewStyles.text('M', 14, '#fcb716')}
      rightTitleProps={{ onPress: () => codePush.restartApp() }}
      rightTitle={syncStatus === codePush.SyncStatus.UPDATE_INSTALLED ? 'RESTART' : ''}
    />
  ) : null;
};
