import { orderList } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';

import {
  downloadDiagnosticReport,
  getPatientNameById,
  removeWhiteSpaces,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { Dimensions, SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import Pdf from 'react-native-pdf';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import moment from 'moment';
import { DownloadNew, ShareBlue } from '@aph/mobile-patients/src/components/ui/Icons';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { shareDocument } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { Overlay } from 'react-native-elements';
interface TestPdfRenderProps {
  uri?: string;
  title?: string;
  order?: any;
  isPopup?: boolean;
  isReport?: boolean;
  setDisplayPdf?: () => void;
  onPressClose: () => void;
}

const { height } = Dimensions.get('window');
const { CLEAR } = theme.colors;

export const TestPdfRender: React.FC<TestPdfRenderProps> = (props) => {
  const { uri, order, isPopup, isReport, onPressClose } = props;
  const { loading, setLoading } = useUIElements();

  const { allCurrentPatients } = useAllCurrentPatients();
  const [serviceableObject, setServiceableObject] = useState({} as any);
  Object.keys(serviceableObject)?.length === 0 && serviceableObject?.constructor === Object;
  const renderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        title={'VIEW REPORTS'}
        onPressLeftIcon={() => onPressClose()}
      />
    );
  };

  function _onPressViewReport(order: orderList) {
    const appointmentDetails = !!order?.slotDateTimeInUTC
      ? order?.slotDateTimeInUTC
      : order?.diagnosticDate;
    const appointmentDate = moment(appointmentDetails)?.format('DD MMM YYYY');
    const patientName = getPatientNameById(allCurrentPatients, order?.patientId)?.replace(
      / /g,
      '_'
    );
    downloadLabTest(removeWhiteSpaces(uri)!, appointmentDate, patientName, order);
  }

  useEffect(() => {
    setLoading?.(false);
  }, [])
  async function downloadLabTest(
    pdfUrl: string,
    appointmentDate: string,
    patientName: string,
    order: orderList
  ) {
    setLoading?.(true);
    try {
      await downloadDiagnosticReport(
        setLoading,
        pdfUrl,
        appointmentDate,
        patientName,
        true,
        undefined,
        order?.orderStatus,
        (order?.displayId).toString(),
        true
      );
    } catch (error) {
      setLoading?.(false);
      CommonBugFender('TestPdfRender_downloadLabTest', error);
    } finally {
      setLoading?.(false);
    }
  }
  const PDFView = () => {
    return (
      <Pdf
        key={uri}
        source={{ uri: uri }}
        style={{
          marginTop: 6,
          marginHorizontal: 10,
          height: isPopup ? height - 160 : height - 100,
          backgroundColor: 'transparent',
        }}
      />
    );
  };
  const shareReport = () => {
    setLoading?.(true);
    shareDocument(uri, 'application/pdf', order?.displayId, isReport);
    setTimeout(() => {
      setLoading?.(false);
    }, 5000);
  };

  return (
    <Overlay
      isVisible
      onRequestClose={() => onPressClose()}
      windowBackgroundColor={'rgba(0, 0, 0, 0.6)'}
      containerStyle={{ marginBottom: 0 }}
      fullScreen
      transparent
      overlayStyle={styles.phrOverlayStyle}
    >
    <View style={{ flex: 1 }}>
      <SafeAreaView>
        {renderHeader()}
        <View style={styles.pdfView}>
          <View style={styles.downloadContainerView}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                _onPressViewReport(order);
              }}
              style={styles.downloadView}
            >
              <DownloadNew />
              <Text style={styles.textStyles}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                shareReport();
              }}
              style={styles.downloadView}
            >
              <ShareBlue />
              <Text style={styles.textStyles}>Share</Text>
            </TouchableOpacity>
          </View>
          <ScrollView minimumZoomScale={1} maximumZoomScale={5}>
            {PDFView()}
          </ScrollView>
        </View>
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  phrOverlayStyle: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    backgroundColor: CLEAR,
    overflow: 'hidden',
    elevation: 0,
    bottom: 0,
    position: 'absolute',
  },
  downloadContainerView: {
    backgroundColor: 'white',
    width: '100%',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    borderRadius: 14,
    padding: 10,
  },
  downloadView: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  textStyles: {
    ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1),
    paddingHorizontal: 5,
  },
  pdfView: {
    backgroundColor: colors.DEFAULT_BACKGROUND_COLOR,
    marginBottom: 20,
  },
});
