import { AphOverlayProps } from '@aph/mobile-patients/src/components/ui/AphOverlay';
import { CALENDAR_TYPE } from '@aph/mobile-patients/src/components/ui/CalendarView';
import { TestSlot } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useState } from 'react';
import {
  Dimensions,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Linking,
  Clipboard,
} from 'react-native';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { Overlay } from 'react-native-elements';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import {
  WhatsAppIcon,
  CopyBlue,
  DownloadNew,
  ShareBlue,
  ViewIcon,
  Cross,
  CrossYellow,
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
                      const whatsAppScheme = `whatsapp://send?text=${props.order?.labReportURL?.replace('&','%26')}`;
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
  containerContentStyle: {
    flex: 1,
    backgroundColor: theme.colors.WHITE,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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
  noDataCard: {
    height: 'auto',
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'white',
    elevation: 0,
  },
  chatWithUsView: { paddingBottom: 10, paddingTop: 5 },
  chatWithUsTouch: { flexDirection: 'row', justifyContent: 'flex-end' },
  whatsappIconStyle: { height: 24, width: 24, resizeMode: 'contain' },
  chatWithUsText: {
    textAlign: 'center',
    paddingRight: 0,
    marginHorizontal: 5,
    ...theme.viewStyles.text('B', 14, colors.APP_YELLOW),
  },
  dropdownOverlayStyle: {
    padding: 0,
    margin: 0,
    height: 'auto',
    borderRadius: 10,
  },
  cancelReasonHeadingView: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: theme.colors.WHITE,
    padding: 18,
    marginBottom: 24,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    flexDirection: 'row',
  },
  cancelReasonHeadingText: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SHERPA_BLUE,
    textAlign: 'center',
    marginHorizontal: '20%',
  },
  cancelReasonContentHeading: {
    marginBottom: 12,
    color: '#0087ba',
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  cancelReasonContentView: { flexDirection: 'row', alignItems: 'center' },
  cancelReasonContentText: {
    flex: 0.9,
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SHERPA_BLUE,
  },
  reasonCancelDropDownExtraView: {
    marginTop: 5,
    backgroundColor: '#00b38e',
    height: 2,
  },
  cancelReasonSubmitButton: { margin: 16, marginTop: 32, width: 'auto' },
  reasonCancelOverlay: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    flex: 1,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  reasonCancelCrossTouch: { marginTop: 80, alignSelf: 'flex-end' },
  reasonCancelView: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  modalMainView: {
    backgroundColor: 'rgba(100,100,100, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
    // alignItems: 'center',
    flexDirection: 'column',
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
