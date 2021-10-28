import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  orderList,
  TestBreadcrumbLink,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { GET_WIDGETS_PRICING_BY_ITEMID_CITYID } from '@aph/mobile-patients/src/graphql/profiles';

import {
  downloadDiagnosticReport,
  g,
  getPatientNameById,
  nameFormater,
  removeWhiteSpaces,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image as ImageNative,
  Image,
} from 'react-native';
import {
  NavigationScreenProps,
  StackActions,
  NavigationActions,
  ScrollView,
} from 'react-navigation';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { sourceHeaders } from '@aph/mobile-patients/src/utils/commonUtils';
import { PackageCard } from '@aph/mobile-patients/src/components/Tests/components/PackageCard';
import { TestListingHeader } from '@aph/mobile-patients/src/components/Tests/components/TestListingHeader';
import { Breadcrumb } from '@aph/mobile-patients/src/components/MedicineListing/Breadcrumb';
import {
  findDiagnosticsWidgetsPricing,
  findDiagnosticsWidgetsPricingVariables,
} from '@aph/mobile-patients/src/graphql/types/findDiagnosticsWidgetsPricing';
import { getDiagnosticListingWidget } from '@aph/mobile-patients/src/helpers/apiCalls';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useUIElements } from '../UIElementsProvider';
import { RenderPdf } from '../ui/RenderPdf';
import Pdf from 'react-native-pdf';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import moment from 'moment';
import { DownloadNew, ShareBlue } from '@aph/mobile-patients/src/components/ui/Icons';
import { useAllCurrentPatients } from '../../hooks/authHooks';
import {
  downloadDocument,
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
    downloadDocument(uri, 'application/pdf', order?.displayId)
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
