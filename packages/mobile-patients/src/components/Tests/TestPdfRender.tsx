import {
  orderList,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';

import {
  downloadDiagnosticReport,
  getPatientNameById,
  removeWhiteSpaces,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {
  NavigationScreenProps,
  ScrollView,
} from 'react-navigation';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import Pdf from 'react-native-pdf';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import moment from 'moment';
import { DownloadNew, ShareBlue } from '@aph/mobile-patients/src/components/ui/Icons';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  shareDocument,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
export interface TestPdfRenderProps extends NavigationScreenProps {
  uri: string;
  title: string;
  order: any;
  isPopup: boolean;
  setDisplayPdf?: () => void;
}

const { width, height } = Dimensions.get('window');

export const TestPdfRender: React.FC<TestPdfRenderProps> = (props) => {
  const uri = props.uri || props.navigation.getParam('uri');
  const title = props.title || props.navigation.getParam('title');
  const order = props.order || props.navigation.getParam('order');
  const isReport = props.order || props.navigation.getParam('isReport');
  const isPopup = props.isPopup || props.navigation.getParam('isPopup');
  const setDisplayPdf = props.setDisplayPdf || props.navigation.getParam('setDisplayPdf');
  const { loading, setLoading, showAphAlert, hideAphAlert } = useUIElements();

  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
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
        onPressLeftIcon={() => props.navigation.goBack()}
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
    // downloadLabTest(removeWhiteSpaces(order?.labReportURL)!, appointmentDate, patientName, order);
    downloadLabTest(removeWhiteSpaces(uri)!, appointmentDate, patientName, order);
  }
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
    shareDocument(uri, 'application/pdf', order?.displayId, isReport)
  }

  return (
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
          <ScrollView
            minimumZoomScale={1} maximumZoomScale={5}
          >{PDFView()}</ScrollView>
        </View>
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
  );
};

const styles = StyleSheet.create({
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
