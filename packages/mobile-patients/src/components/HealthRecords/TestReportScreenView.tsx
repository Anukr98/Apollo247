import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { LabTestIcon, ShareBlueIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState, useCallback } from 'react';
import {
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  BackHandler,
  View,
} from 'react-native';
import {
  GET_DIAGNOSTICS_ORDER_BY_DISPLAY_ID,
  GET_LAB_RESULT_PDF,
  PHR_COVERT_TO_ZIP,
} from '@aph/mobile-patients/src/graphql/profiles';
import string from '@aph/mobile-patients/src/strings/strings.json';
import Pdf from 'react-native-pdf';
import { useApolloClient } from 'react-apollo-hooks';
import { Image } from 'react-native-elements';
import { NavigationScreenProps } from 'react-navigation';
import RNFetchBlob from 'rn-fetch-blob';
import { mimeType } from '@aph/mobile-patients/src/helpers/mimeType';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { ProfileImageComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/ProfileImageComponent';
import {
  g,
  handleGraphQlError,
  postWebEngagePHR,
  isSmallDevice,
  removeObjectProperty,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import {
  getLabResultpdf,
  getLabResultpdfVariables,
} from '@aph/mobile-patients/src/graphql/types/getLabResultpdf';
import {
  convertToZip,
  convertToZipVariables,
} from '@aph/mobile-patients/src/graphql/types/convertToZip';
import { WebEngageEventName } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import _, { min } from 'lodash';
import {
  getPatientPrismMedicalRecordsApi,
  getPatientPrismSingleMedicalRecordApi,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { PhrNoDataComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/PhrNoDataComponent';
import {
  getDiagnosticOrderDetailsByDisplayID,
  getDiagnosticOrderDetailsByDisplayIDVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrderDetailsByDisplayID';
import { navigateToHome } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { ResultTestReportsPopUp } from '@aph/mobile-patients/src/components/HealthRecords/Components/ResultTestReportsPopUp';
import { MedicalRecordType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { RenderPdf } from '@aph/mobile-patients/src/components/ui/RenderPdf';

const styles = StyleSheet.create({
  labelStyle: {
    color: theme.colors.TURQUOISE_LIGHT_BLUE,
    lineHeight: 21,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  readMoreText: {
    textAlign: 'right',
    borderRadius: 10,
    bottom: 2,
    right: 8,
    ...theme.viewStyles.text('SB', isSmallDevice ? 14 : 15, theme.colors.APP_YELLOW, 1, 20),
    letterSpacing: 0.25,
    marginBottom: '1.5%',
  },
  readMoreTouch: {
    backgroundColor: '#F7F7F7',
    width: '100%',
    top: 10,
    left: 15,
  },
  descriptionStyle: {
    color: theme.colors.SKY_BLUE,
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  labelViewStyle: {
    borderBottomWidth: 0,
    borderBottomColor: theme.colors.SEPARATOR_LINE,
    marginLeft: 18,
    width: '95%',
  },
  botContainer: {
    width: '100%',
    justifyContent: 'space-around',
    marginTop: 25,
    borderLeftWidth: 2,
  },
  rangeViewContainer: {
    justifyContent: 'space-around',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '45%',
    bottom: 5,
    left: 12,
  },
  resultViewContainer: {
    justifyContent: 'space-around',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  resultTextContainer: {
    color: theme.colors.ASTRONAUT_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(14),
    marginLeft: 18,
    textAlign: 'left',
  },
  descText: {
    ...theme.fonts.IBMPlexSansMedium(14),
    paddingHorizontal: 10,
    paddingTop: 5,
    textAlign: 'justify',
    left: 15,
    borderRadius: 6,
    paddingVertical: 3,
  },
  verticleLine: {
    height: '90%',
    width: 1,
    backgroundColor: '#909090',
    top: 5,
  },
  rangeTextContainer: {
    color: theme.colors.ASTRONAUT_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(14),
    marginTop: 10,
  },
  rangeValueContainer: {
    color: theme.colors.ASTRONAUT_BLUE,
    ...theme.fonts.IBMPlexSansMedium(14),
    marginTop: 10,
    left: 3,
  },
  iconRender: {
    flexDirection: 'row',
    position: 'absolute',
    right: 5,
    top: 5,
  },
  topView: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  PDFRender: {
    height: 425,
    width: '100%',
    backgroundColor: 'transparent',
  },
  imageRender: {
    height: 425,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shareIconRender: {
    marginTop: 20,
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    right: 20,
  },
  dateViewRender: {
    position: 'absolute',
    right: 20,
    top: 55,
  },
  doctorNameRender: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    left: 20,
    bottom: 7,
    width: '75%',
  },
  collapseCardLabelViewStyle: {
    marginTop: 20,
    marginLeft: 20,
    marginRight: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  cardViewStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 10,
    marginBottom: 15,
    marginHorizontal: 8,
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 29,
  },
  recordNameTextStyle: {
    ...viewStyles.text('SB', 14, '#000000', 1, 30),
    marginRight: 10,
  },
  imageViewStyle: {
    marginHorizontal: 30,
    marginBottom: 15,
    marginTop: 15,
    backgroundColor: 'transparent',
  },
  imagePlaceHolderStyle: {
    height: 425,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  imageStyle: {
    width: '100%',
    height: 425,
  },
  pdfStyle: {
    height: 425,
    width: '100%',
    backgroundColor: 'transparent',
  },
  doctorTextStyle: { ...viewStyles.text('R', 12, '#000000', 1, 21), marginTop: 6 },
  safeAreaViewStyle: {
    ...theme.viewStyles.container,
  },
  mainViewStyle: {
    flex: 1,
  },
});

export interface TestReportViewScreenProps extends NavigationScreenProps {}

export const TestReportViewScreen: React.FC<TestReportViewScreenProps> = (props) => {
  const [showPrescription, setshowPrescription] = useState<boolean>(true);
  const [showAdditionalNotes, setShowAdditionalNotes] = useState<boolean>(false);
  const [showReadMore, setShowReadMore] = useState<boolean>(false);
  const [apiError, setApiError] = useState(false);
  const [showReadMoreData, setShowReadMoreData] = useState('');
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const [showPDF, setShowPDF] = useState<boolean>(false);
  const [pdfFileUrl, setPdfFileUrl] = useState<string>('');
  const [fileNamePDF, setFileNamePDF] = useState<string>('');
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();

  //for deeplink
  const movedFrom = props.navigation.getParam('movedFrom');
  const displayId = props.navigation.getParam('id');
  const webEngageSource = 'Lab Test';
  const file_name_text = 'TestReport_';
  const webEngageEventName: WebEngageEventName = WebEngageEventName.PHR_DOWNLOAD_TEST_REPORT;

  const [data, setData] = useState<any>(
    props.navigation.state.params ? props.navigation.state.params.data : {}
  );
  const labResults = props.navigation.state.params
    ? props.navigation.state.params.labResults
    : false;
  const healthrecordId = props.navigation.state.params
    ? props.navigation.state.params?.healthrecordId
    : '';
  const healthRecordType = props.navigation.state.params
    ? props.navigation.state.params?.healthRecordType
    : '';
  const prescriptionSource = props.navigation.state.params
    ? props.navigation.state.params?.prescriptionSource
    : null;

  const imagesArray = g(data, 'testResultFiles') ? g(data, 'testResultFiles') : [];
  const propertyName = g(data, 'testResultFiles') ? 'testResultFiles' : '';
  const eventInputData = removeObjectProperty(data, propertyName);

  useEffect(() => {
    Platform.OS === 'android' && requestReadSmsPermission();
  });

  const getOrderDetails = async (displayId: string) => {
    const res = await client.query<
      getDiagnosticOrderDetailsByDisplayID,
      getDiagnosticOrderDetailsByDisplayIDVariables
    >({
      query: GET_DIAGNOSTICS_ORDER_BY_DISPLAY_ID,
      variables: {
        displayId: Number(displayId),
      },
      fetchPolicy: 'no-cache',
    });
    return res;
  };

  useEffect(() => {
    if (!!movedFrom && !!displayId && movedFrom == 'deeplink') {
      fetchDiagnosticOrderDetails(displayId);
    }
  }, []);

  useEffect(() => {
    // calling this api only for search records
    if (healthrecordId) {
      setLoading && setLoading(true);
      getPatientPrismSingleMedicalRecordApi(
        client,
        currentPatient?.id,
        [healthRecordType],
        healthrecordId,
        prescriptionSource
      )
        .then((_data: any) => {
          const labResultsData = g(
            _data,
            'getPatientPrismMedicalRecords_V2',
            'labResults',
            'response',
            '0' as any
          );
          setData(labResultsData);
          data ? setApiError(false) : setApiError(true);
        })
        .catch((error) => {
          setApiError(true);
          CommonBugFender('HealthRecordsHome_fetchTestData', error);
          currentPatient && handleGraphQlError(error);
        })
        .finally(() => setLoading && setLoading(false));
    }
  }, []);

  const fetchDiagnosticOrderDetails = async (displayId: string) => {
    setLoading?.(true);
    try {
      const res = await getOrderDetails(displayId);
      const { data } = res;
      const getData = g(data, 'getDiagnosticOrderDetailsByDisplayID', 'ordersList');
      const visitId = getData?.visitNo;
      if (currentPatient?.id === getData?.patientId) {
        if (!!visitId) {
          fetchTestReportResult(visitId);
        } else {
          setLoading?.(false);
          renderError(string.diagnostics.unableToFetchReport, true);
        }
      } else {
        setLoading?.(false);
        renderError(string.diagnostics.incorrectUserReport, false);
      }
    } catch (error) {
      CommonBugFender('RecordDetails_fetchDiagnosticOrderDetails_try', error);
      setLoading?.(false);
      renderError(string.diagnostics.unableToFetchReport, true);
    }
  };

  const fetchTestReportResult = useCallback((visitId: string) => {
    getPatientPrismMedicalRecordsApi(
      client,
      currentPatient?.id,
      [MedicalRecordType.TEST_REPORT],
      'Diagnostics'
    )
      .then((data: any) => {
        const labResultsData = g(
          data,
          'getPatientPrismMedicalRecords_V2',
          'labResults',
          'response'
        );
        let resultForVisitNo = labResultsData?.find((item: any) => item?.identifier == visitId);
        if (!!resultForVisitNo) {
          setData(resultForVisitNo);
          setLoading?.(false);
        } else {
          setLoading?.(false);
          renderError(string.diagnostics.responseUnavailableForReport, false);
        }
      })
      .catch((error) => {
        CommonBugFender('OrderedTestStatus_fetchTestReportsData', error);
        currentPatient && handleGraphQlError(error);
      })
      .finally(() => setLoading?.(false));
  }, []);

  const renderError = (message: string, redirectToOrders: boolean) => {
    showAphAlert?.({
      unDismissable: true,
      title: string.common.uhOh,
      description: message,
      onPressOk: () => {
        hideAphAlert?.();
        redirectToOrders
          ? props.navigation.navigate(AppRoutes.YourOrdersTest)
          : props.navigation.navigate(AppRoutes.ConsultRoom);
      },
    });
  };

  const requestReadSmsPermission = async () => {
    try {
      const resuts = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
      if (
        resuts[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] !==
        PermissionsAndroid.RESULTS.GRANTED
      ) {
      }
      if (
        resuts[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] !==
        PermissionsAndroid.RESULTS.GRANTED
      ) {
      }
      if (resuts) {
      }
    } catch (error) {
      CommonBugFender('RecordDetails_requestReadSmsPermission_try', error);
    }
  };

  const handleBack = async () => {
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
    onGoBack();
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const renderTopLineReport = () => {
    return (
      <View>
        <CollapseCard
          heading="ADDITIONAL NOTES"
          collapse={showAdditionalNotes}
          containerStyle={
            !showAdditionalNotes && {
              ...theme.viewStyles.cardViewStyle,
              marginHorizontal: 8,
            }
          }
          headingStyle={{ ...viewStyles.text('SB', 18, theme.colors.LIGHT_BLUE, 1, 23) }}
          labelViewStyle={styles.collapseCardLabelViewStyle}
          onPress={() => setShowAdditionalNotes(!showAdditionalNotes)}
        >
          <View style={[styles.cardViewStyle, { paddingBottom: 12, paddingTop: 12 }]}>
            <View>
              <Text style={styles.descriptionStyle}>{data?.additionalNotes}</Text>
            </View>
          </View>
        </CollapseCard>
      </View>
    );
  };

  const downloadPDFTestReport = () => {
    if (currentPatient?.id) {
      setLoading && setLoading(true);
      client
        .query<getLabResultpdf, getLabResultpdfVariables>({
          query: GET_LAB_RESULT_PDF,
          variables: {
            patientId: currentPatient?.id,
            recordId: data?.id,
          },
        })
        .then(({ data }: any) => {
          if (data?.getLabResultpdf?.url) {
            imagesArray?.length === 0
              ? downloadDocument(data?.getLabResultpdf?.url)
              : callConvertToZipApi(data?.getLabResultpdf?.url);
          }
        })
        .catch((e: any) => {
          setLoading?.(false);
          currentPatient && handleGraphQlError(e, 'Report is yet not available');
          CommonBugFender('HealthRecordDetails_downloadPDFTestReport', e);
        });
    }
  };

  const callConvertToZipApi = (pdfUrl?: string) => {
    setLoading?.(true);
    const fileUrls = imagesArray?.map((item) => item?.file_Url);
    pdfUrl && fileUrls?.push(pdfUrl);
    client
      .mutate<convertToZip, convertToZipVariables>({
        mutation: PHR_COVERT_TO_ZIP,
        variables: {
          uhid: currentPatient?.uhid || '',
          fileUrls: fileUrls,
        },
      })
      .then(({ data }) => {
        setLoading?.(false);
        if (data?.convertToZip?.zipUrl) {
          downloadZipFile(data?.convertToZip?.zipUrl);
        }
      })
      .catch((e: any) => {
        setLoading?.(false);
        currentPatient && handleGraphQlError(e, 'Report is yet not available');
        CommonBugFender('HealthRecordDetails_callConvertToZipApi', e);
      });
  };

  const downloadZipFile = (zipUrl: string) => {
    const dirs = RNFetchBlob.fs.dirs;
    const fileName: string =
      file_name_text + currentPatient?.uhid + '_' + new Date().getTime() + '.zip';
    const downloadPath =
      Platform.OS === 'ios'
        ? (dirs.DocumentDir || dirs.MainBundleDir) + '/' + (fileName || 'Apollo_TestReport.zip')
        : dirs.DownloadDir + '/' + (fileName || 'Apollo_TestReport.zip');
    setLoading && setLoading(true);
    RNFetchBlob.config({
      fileCache: true,
      path: downloadPath,
      addAndroidDownloads: {
        title: fileName,
        useDownloadManager: true,
        notification: true,
        path: downloadPath,
        mime: mimeType(downloadPath),
        description: 'File downloaded by download manager.',
      },
    })
      .fetch('GET', zipUrl)
      .then((res) => {
        setLoading && setLoading(false);
        postWebEngagePHR(currentPatient, webEngageEventName, webEngageSource, eventInputData);
        Platform.OS === 'ios'
          ? RNFetchBlob.ios.previewDocument(res.path())
          : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
      })
      .catch((err) => {
        CommonBugFender('HealthRecordDetails_downloadZipFile', err);
        currentPatient && handleGraphQlError(err);
        setLoading && setLoading(false);
      })
      .finally(() => {
        setLoading && setLoading(false);
      });
  };

  const renderDownloadButton = () => {
    const buttonTitle = 'TEST REPORT';
    const btnTitle = 'DOWNLOAD ';
    const _callDownloadDocumentApi = () => {
      if (imagesArray?.length === 1) {
        labResults ? downloadPDFTestReport() : downloadDocument();
      } else {
        labResults ? downloadPDFTestReport() : callConvertToZipApi();
      }
    };
    return (
      <View style={{ marginHorizontal: 40, marginBottom: 15, marginTop: 33 }}>
        <Button title={btnTitle + buttonTitle} onPress={_callDownloadDocumentApi} />
      </View>
    );
  };

  const renderDetailsFinding = () => {
    const renderTestReportDetails = () => {
      return (
        <>
          <View style={{ flexDirection: 'row' }}>
            <LabTestIcon style={{ height: 20, width: 19, marginRight: 14 }} />
            <Text style={{ ...viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE, 1, 21) }}>
              {'Impressions'}
            </Text>
          </View>
          {data?.labTestResults?.map((item: any) => {
            const unit = item?.unit;
            var minNum: number;
            var maxNum: number;
            var resultColorChanger: boolean;
            var stringColorChanger: boolean;
            var rangeColorChanger: boolean;
            var ress: boolean;
            var columnDecider: boolean;
            if (!!item?.range) {
              var symbolSearch =
                item?.range?.includes('<') ||
                item?.range?.includes('>') ||
                item?.range?.includes(':');
              var letterCheck = item?.range?.includes('-');
              if (letterCheck && !symbolSearch) {
                minNum = item?.range.split('-')[0].trim();
                maxNum = item?.range.split('-')[1].trim();
                let parseResult = parseInt(item?.result);
                parseResult >= minNum && parseResult <= maxNum
                  ? (resultColorChanger = true)
                  : (resultColorChanger = false);
              }
              if (symbolSearch) {
                rangeColorChanger = true;
              } else {
                rangeColorChanger = false;
              }
              if (item?.range?.length > 30) {
                columnDecider = true;
              } else {
                columnDecider = false;
              }
            }
            if (!!item?.result) {
              if (item?.result?.length > 14) {
                stringColorChanger = true;
              }
            }

            return !!item?.result ? (
              <>
                <View
                  style={[
                    styles.botContainer,
                    {
                      borderLeftColor:
                        stringColorChanger === true ||
                        rangeColorChanger === true ||
                        !item?.range ||
                        item?.range === item?.result
                          ? '#9B9B9B'
                          : resultColorChanger
                          ? '#16DE9B'
                          : '#D87878',
                      height:
                        stringColorChanger === true && item?.result?.length > 100
                          ? 170
                          : !!item?.range && item?.range?.length > 30
                          ? 200
                          : 110,
                    },
                  ]}
                >
                  <View style={styles.labelViewStyle}>
                    <Text style={styles.labelStyle}>{item?.parameterName}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: columnDecider ? 'column' : 'row',
                      height:
                        stringColorChanger === true && item?.result?.length > 100 ? '50%' : '65%',
                      width:
                        stringColorChanger === true && item?.result?.length > 60 ? '97%' : '100%',
                    }}
                  >
                    <View
                      style={[
                        styles.resultViewContainer,
                        {
                          width: stringColorChanger === true ? '100%' : '45%',
                          top: 2,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.resultTextContainer,
                          {
                            bottom:
                              stringColorChanger === true && item?.result?.length > 100
                                ? 15
                                : columnDecider
                                ? 8
                                : 0.5,
                          },
                        ]}
                      >
                        {'Result:'}
                      </Text>
                      <Text
                        style={[
                          styles.descText,
                          {
                            backgroundColor:
                              stringColorChanger === true ||
                              rangeColorChanger === true ||
                              !item?.range ||
                              item?.range === item?.result
                                ? '#F7F7F7'
                                : resultColorChanger
                                ? theme.colors.COMPLETE_STATUS_BGK
                                : theme.colors.FAILURE_STATUS_BGK,
                            color:
                              stringColorChanger === true ||
                              rangeColorChanger === true ||
                              !item?.range ||
                              item?.range === item?.result
                                ? theme.colors.ASTRONAUT_BLUE
                                : resultColorChanger
                                ? theme.colors.COMPLETE_STATUS_TEXT
                                : theme.colors.FAILURE_STATUS_TEXT,
                            lineHeight: stringColorChanger === true ? 21 : 18,
                            height:
                              stringColorChanger === true &&
                              Platform.OS === 'android' &&
                              item?.result?.length > 100
                                ? 55
                                : undefined,
                            width:
                              stringColorChanger === true && item?.result?.length > 100
                                ? '100%'
                                : undefined,
                          },
                        ]}
                      >
                        {`${item?.result}` || 'N/A'}
                      </Text>
                      {item?.result?.length > 100 ? (
                        <TouchableOpacity
                          onPress={() => renderReadMore(item?.result)}
                          style={[
                            styles.readMoreTouch,
                            { top: Platform.OS === 'android' ? 2 : 10 },
                          ]}
                        >
                          <Text style={styles.readMoreText}>{'READ MORE'}</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                    {!!item?.range
                      ? renderDataFromTestReports(item?.range, unit, columnDecider)
                      : null}
                  </View>
                </View>
              </>
            ) : null;
          })}
        </>
      );
    };

    // Handling stringified Test Results from the hospital data
    // To avoid mix up between numeric and string values
    const renderDataFromTestReports = (range: string, unit: string, columnDecider: boolean) => {
      return (
        <>
          {columnDecider ? null : <View style={styles.verticleLine}></View>}
          <View
            style={[
              styles.rangeViewContainer,
              {
                width: columnDecider ? undefined : '45%',
                left: columnDecider ? 16 : 12,
                top: columnDecider ? 3 : undefined,
              },
            ]}
          >
            <Text style={styles.rangeTextContainer}>{'Range:'}</Text>
            <Text style={styles.rangeValueContainer}>{range ? `${range + `${unit}`}` : 'N/A'}</Text>
          </View>
        </>
      );
    };

    return (
      <View style={{ marginBottom: showPrescription ? 0 : 15 }}>
        <CollapseCard
          heading="DETAILED FINDINGS"
          collapse={showPrescription}
          containerStyle={
            !showPrescription && {
              ...theme.viewStyles.cardViewStyle,
              marginHorizontal: 8,
            }
          }
          headingStyle={{ ...viewStyles.text('SB', 14, '#000000', 1, 23) }}
          labelViewStyle={styles.collapseCardLabelViewStyle}
          onPress={() => setshowPrescription(!showPrescription)}
        >
          <View style={{ marginTop: 11, marginBottom: 20 }}>
            <View style={[styles.cardViewStyle, { marginTop: 4, marginBottom: 4, paddingTop: 16 }]}>
              {renderTestReportDetails()}
            </View>
          </View>
        </CollapseCard>
      </View>
    );
  };

  const renderPdf = () => {
    return showPDF ? (
      <RenderPdf
        uri={pdfFileUrl}
        title={fileNamePDF || 'Document.pdf'}
        isPopup={true}
        setDisplayPdf={() => {
          setShowPDF(false);
          setPdfFileUrl('');
        }}
        navigation={props.navigation}
      />
    ) : null;
  };

  const renderImage = () => {
    return (
      <View>
        <ScrollView>
          {imagesArray?.map((item, index) => {
            const file_name = item?.fileName || '';
            const file_Url = item?.file_Url || '';
            return file_name && file_name.toLowerCase().endsWith('.pdf') ? (
              <TouchableOpacity
                activeOpacity={1}
                style={styles.imageViewStyle}
                onPress={() => {
                  setShowPDF(true);
                  setPdfFileUrl(file_Url);
                  setFileNamePDF(file_name);
                }}
              >
                <Pdf key={file_Url} source={{ uri: file_Url }} style={styles.pdfStyle} singlePage />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  props.navigation.navigate(AppRoutes.ImageSliderScreen, {
                    images: [file_Url],
                    heading: file_name || 'Image',
                  });
                }}
                style={styles.imageViewStyle}
              >
                <Image
                  placeholderStyle={styles.imagePlaceHolderStyle}
                  PlaceholderContent={<Spinner style={{ backgroundColor: 'transparent' }} />}
                  source={{ uri: file_Url }}
                  style={styles.imageStyle}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderData = () => {
    return (
      <View style={{ marginBottom: 20 }}>
        {data?.labTestResults?.length > 0 ? renderDetailsFinding() : null}
        {data?.additionalNotes ? renderTopLineReport() : null}
        {imagesArray?.length > 0 ? renderImage() : null}
        {imagesArray?.length > 0 || labResults ? renderDownloadButton() : null}
      </View>
    );
  };

  const renderTestTopDetailsView = () => {
    const renderDateView = () => {
      return (
        <Text style={{ ...viewStyles.text('R', 12, '#000000', 1, 14) }}>{`${moment(
          data?.date || data?.startDateTime || data?.billDateTime
        ).format(string.common.date_placeholder_text)}`}</Text>
      );
    };
    return (
      <View style={styles.topView}>
        <View style={styles.shareIconRender}>
          <TouchableOpacity
            onPress={() => (labResults ? downloadPDFTestReport() : downloadDocument())}
          >
            <ShareBlueIcon size={'sm'} style={{ width: 16, height: 16 }} />
          </TouchableOpacity>
        </View>
        <View style={styles.dateViewRender}>{renderDateView()}</View>
        <View style={styles.doctorNameRender}>
          <Text style={styles.recordNameTextStyle}>{data?.labTestName}</Text>
          <View style={{ flexDirection: 'row' }}>
            {!!data?.labTestRefferedBy ? (
              <Text style={styles.doctorTextStyle}>
                {'Dr. ' + data?.labTestRefferedBy || 'Dr. -'}
              </Text>
            ) : null}
            <Text style={styles.doctorTextStyle}>
              {` ${!!data?.labTestRefferedBy ? '\u25CF' : ''} ` + data?.siteDisplayName}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const getFileName = (file_name: string, pdfUrl: string) => {
    const file_name_text = 'TestReport_';
    const labResultFileName = `${file_name_text}${moment(data?.date).format(
      'DD MM YYYY'
    )}_Apollo 247${new Date().getTime()}${pdfUrl ? '.pdf' : file_name}`;
    return labResults
      ? labResultFileName
      : file_name_text +
          moment(data?.date).format('DD MM YYYY') +
          '_Apollo 247' +
          new Date().getTime() +
          file_name;
  };

  const downloadDocument = (pdfUrl: string = '') => {
    const file_name = g(data, 'testResultFiles', '0', 'fileName')
      ? g(data, 'testResultFiles', '0', 'fileName')
      : '';
    const dirs = RNFetchBlob.fs.dirs;

    const fileName: string = getFileName(file_name, pdfUrl);
    const downloadPath =
      Platform.OS === 'ios'
        ? (dirs.DocumentDir || dirs.MainBundleDir) + '/' + (fileName || 'Apollo_TestReport.pdf')
        : dirs.DownloadDir + '/' + (fileName || 'Apollo_TestReport.pdf');
    setLoading && setLoading(true);
    RNFetchBlob.config({
      fileCache: true,
      path: downloadPath,
      addAndroidDownloads: {
        title: fileName,
        useDownloadManager: true,
        notification: true,
        path: downloadPath,
        mime: mimeType(downloadPath),
        description: 'File downloaded by download manager.',
      },
    })
      .fetch('GET', labResults ? pdfUrl || data?.fileUrl : data.fileUrl, {
        //some headers ..
      })
      .then((res) => {
        setLoading && setLoading(false);
        postWebEngagePHR(currentPatient, webEngageEventName, webEngageSource, eventInputData);
        Platform.OS === 'ios'
          ? RNFetchBlob.ios.previewDocument(res.path())
          : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
      })
      .catch((err) => {
        CommonBugFender('ConsultDetails_renderFollowUp', err);
        currentPatient && handleGraphQlError(err);
        setLoading && setLoading(false);
      })
      .finally(() => {
        setLoading && setLoading(false);
      });
  };

  const renderProfileImage = () => {
    return (
      <ProfileImageComponent
        currentPatient={currentPatient}
        onPressProfileImage={() => props.navigation.pop(2)}
      />
    );
  };

  const onGoBack = () => {
    if (movedFrom == 'deeplink') {
      navigateToHome(props.navigation);
    } else {
      props.navigation.state.params?.onPressBack && props.navigation.state.params?.onPressBack();
      props.navigation.goBack();
    }
  };

  const renderReadMore = (resultString: string) => {
    setShowReadMoreData(resultString);
    setShowReadMore(true);
  };

  const onPressReadMore = () => {
    return (
      showReadMore && (
        <ResultTestReportsPopUp
          title={showReadMoreData}
          heading={'RESULT'}
          isVisible={true}
          onClickClose={() => {
            setShowReadMore(false);
          }}
        />
      )
    );
  };

  if (data) {
    const headerTitle = 'TEST REPORTS DETAILS';
    return (
      <View style={styles.mainViewStyle}>
        <SafeAreaView style={styles.safeAreaViewStyle}>
          <Header
            title={headerTitle}
            leftIcon="backArrow"
            rightComponent={renderProfileImage()}
            container={{ borderBottomWidth: 0 }}
            onPressLeftIcon={onGoBack}
          />
          {renderPdf()}
          <ScrollView bounces={false}>
            {renderTestTopDetailsView()}
            {renderData()}
            {onPressReadMore()}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }
  return (
    <View style={styles.mainViewStyle}>
      <SafeAreaView style={styles.safeAreaViewStyle}>
        <Header
          leftIcon="backArrow"
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={onGoBack}
        />
        {apiError ? (
          <PhrNoDataComponent noDataText={string.common.phr_api_error_text} phrErrorIcon />
        ) : null}
      </SafeAreaView>
    </View>
  );
};
