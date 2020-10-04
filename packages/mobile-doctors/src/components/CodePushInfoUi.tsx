import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CodePushInfo } from '@aph/mobile-doctors/src/components/AppContainer';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import codePush, { DownloadProgress } from 'react-native-code-push';

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
  console.log('codePushInfo', syncStatus);
  const title =
    syncStatus === codePush.SyncStatus.DOWNLOADING_PACKAGE
      ? `Downloading updates... ${downloadProgress ? getDownloadProgress(downloadProgress) : ''}`
      : syncStatus === codePush.SyncStatus.UPDATE_INSTALLED
      ? "We've finished downloading an update"
      : '';
  return isUiToBeShown ? (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
      <TouchableOpacity
        style={styles.rightTitleView}
        onPress={() => {
          codePush.restartApp();
        }}
      >
        <Text style={styles.rightTitleStyle}>
          {syncStatus === codePush.SyncStatus.UPDATE_INSTALLED ? 'RESTART' : ''}
        </Text>
      </TouchableOpacity>
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7f8f5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    ...theme.viewStyles.text('M', 13, '#02475b'),
    width: '75%',
  },
  rightTitleStyle: {
    ...theme.viewStyles.text('M', 13, '#fcb716'),
  },
  rightTitleView: {
    height: 30,
    justifyContent: 'center',
  },
});
