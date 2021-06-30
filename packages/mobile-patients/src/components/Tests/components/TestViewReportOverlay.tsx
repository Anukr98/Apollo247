import { AphOverlayProps } from '@aph/mobile-patients/src/components/ui/AphOverlay';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Linking, Clipboard } from 'react-native';
import { Overlay } from 'react-native-elements';
import {
  CopyBlue,
  DownloadNew,
  ShareBlue,
  ViewIcon,
  CrossPopup,
} from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';

export interface TestViewReportOverlayProps extends AphOverlayProps {
  onPressViewReport?: any;
  order?: any;
}
export const TestViewReportOverlay: React.FC<TestViewReportOverlayProps> = (props) => {
  const [snackbarState, setSnackbarState] = useState<boolean>(false);

  const copyToClipboard = (refId: string) => {
    Clipboard.setString(refId);
    setSnackbarState(true);
  };
  const viewReportItemsArray = [
    {
      icon: <ViewIcon />,
      title: string.Report.view,
    },
    {
      icon: <DownloadNew />,
      title: string.Report.download,
    },
    {
      icon: <ShareBlue />,
      title: string.Report.share,
    },
    {
      icon: <CopyBlue />,
      title: string.Report.copy,
    },
  ];
  return (
    <Overlay
      isVisible
      onRequestClose={() => props.onClose()}
      windowBackgroundColor={'rgba(0, 0, 0, 0.6)'}
      containerStyle={{ marginBottom: 0 }}
      fullScreen
      transparent
      overlayStyle={styles.phrOverlayStyle}
    >
      <View>
        <TouchableOpacity
          style={styles.closeContainer}
          onPress={() => {
            props.onClose();
          }}
        >
          <CrossPopup />
        </TouchableOpacity>
        <View style={styles.reportModalView}>
          <View style={styles.reportModalOptionsView}>
            {viewReportItemsArray.map((item) => (
              <TouchableOpacity
                onPress={async () => {
                  if (item?.title == string.Report.view || item?.title == string.Report.download) {
                    props.onPressViewReport();
                  } else if (item?.title == string.Report.share) {
                    try {
                      const whatsAppScheme = `whatsapp://send?text=${props.order?.labReportURL?.replace(
                        '&',
                        '%26'
                      )}`;
                      const canOpenURL = await Linking.canOpenURL(whatsAppScheme);
                      canOpenURL && Linking.openURL(whatsAppScheme);
                    } catch (error) {}
                  } else {
                    copyToClipboard(
                      props.order && props.order?.labReportURL ? props.order?.labReportURL : ''
                    );
                  }
                  setTimeout(() => {
                    props.onClose();
                  }, 500);
                }}
                style={styles.itemView}
              >
                {item?.icon}
                <Text style={styles.itemTextStyle}>{item?.title}</Text>
                {snackbarState && item?.title == string.Report.copy ? (
                  <Text style={styles.copyTextStyle}>Copied !!</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    backgroundColor: theme.colors.WHITE,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: 500,
  },
  closeContainer: {
    alignSelf: 'flex-end',
    margin: 10,
  },
  phrOverlayStyle: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    elevation: 0,
    bottom: 0,
    position: 'absolute',
    justifyContent: 'flex-end',
  },
  reportModalView: {
    backgroundColor: 'white',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  reportModalOptionsView: {
    backgroundColor: 'white',
    width: '100%',
  },
  itemView: {
    backgroundColor: 'white',
    width: '100%',
    padding: 10,
    flexDirection: 'row',
    alignContent: 'center',
    borderBottomColor: '#e8e8e8',
    borderBottomWidth: 1,
  },
  itemTextStyle: {
    marginHorizontal: 10,
    ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE),
  },
  copyTextStyle: {
    marginHorizontal: 10,
    textAlign: 'left',
    ...theme.viewStyles.text('SB', 14, theme.colors.APP_GREEN),
  },
});
