import { AphOverlayProps } from '@aph/mobile-patients/src/components/ui/AphOverlay';
import { CALENDAR_TYPE } from '@aph/mobile-patients/src/components/ui/CalendarView';
import {
  downloadDiagnosticReport,
  g,
  TestSlot,
  removeWhiteSpaces,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import {
  Dimensions,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Linking,
  Clipboard,
  Platform,
} from 'react-native';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { Overlay } from 'react-native-elements';
import {
  CopyBlue,
  DownloadNew,
  ShareBlue,
  ViewIcon,
  CrossPopup,
} from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { mimeType } from '@aph/mobile-patients/src/helpers/mimeType';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';

export interface TestViewReportOverlayProps extends AphOverlayProps {
  onPressViewReport?: any;
  downloadDocument?: any;
  order?: any;
  viewReportOrderId?: number;
}
export const TestViewReportOverlay: React.FC<TestViewReportOverlayProps> = (props) => {
  const [snackbarState, setSnackbarState] = useState<boolean>(false);
  const { loading, setLoading, showAphAlert, hideAphAlert } = useUIElements();
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
                  if (
                    props.viewReportOrderId == props.order?.displayId &&
                    item?.title != string.Report.copy
                  ) {
                    showAphAlert!({
                      title: string.common.uhOh,
                      description: 'Download error. Please try after some time.',
                    });
                  } else {
                    if (
                      item?.title == string.Report.view ||
                      item?.title == string.Report.download
                    ) {
                      props.onPressViewReport();
                    } else if (item?.title == string.Report.share) {
                      props.downloadDocument(
                        removeWhiteSpaces(props?.order?.labReportURL),
                        'application/pdf'
                      );
                    } else {
                      copyToClipboard(
                        props.order && props.order?.labReportURL
                          ? removeWhiteSpaces(props.order?.labReportURL)
                          : ''
                      );
                    }
                    setTimeout(() => {
                      props.onClose();
                    }, 500);
                  }
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
