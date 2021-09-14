import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { BarChar, LabTestIcon, ShareBlueIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Share from 'react-native-share';
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
  Alert,
} from 'react-native';
import {
  GET_DIAGNOSTICS_ORDER_BY_DISPLAY_ID,
  GET_INDIVIDUAL_TEST_RESULT_PDF,
  GET_LAB_RESULT_PDF,
  GET_VISUALIZATION_DATA,
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
import _ from 'lodash';
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
import { CombinedBarChart } from '@aph/mobile-patients/src/components/HealthRecords/Components/CombinedBarChar';
import {
  getIndividualTestResultPdf,
  getIndividualTestResultPdfVariables,
} from '@aph/mobile-patients/src/graphql/types/getIndividualTestResultPdf';
import {
  getVisualizationData,
  getVisualizationDataVariables,
} from '@aph/mobile-patients/src/graphql/types/getVisualizationData';

const styles = StyleSheet.create({
  labelStyle: {
    color: theme.colors.TURQUOISE_LIGHT_BLUE,
    lineHeight: 21,
    ...theme.fonts.IBMPlexSansMedium(14),
    width: '80%',
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
    color: '#000000',
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansMedium(12),
  },
  labelViewStyle: {
    borderBottomWidth: 0,
    justifyContent: 'space-between',
    flexDirection: 'row',
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
    width: '95%',
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
  const testReportsData = props.navigation?.getParam('testReport') || [];
  const [showPrescription, setshowPrescription] = useState<boolean>(true);
  const [showAdditionalNotes, setShowAdditionalNotes] = useState<boolean>(false);
  const [showReadMore, setShowReadMore] = useState<boolean>(false);
  const [apiError, setApiError] = useState(false);
  const [showReadMoreData, setShowReadMoreData] = useState('');
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [resonseData, showResponseData] = useState<[]>([]);
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const [showPDF, setShowPDF] = useState<boolean>(false);
  const [pdfFileUrl, setPdfFileUrl] = useState<string>('');
  const [fileNamePDF, setFileNamePDF] = useState<string>('');
  const [sendParamName, setSendParamName] = useState<string>('');
  const [sendTestReportName, setSendTestReportName] = useState<string>('');
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
            'getPatientPrismMedicalRecords_V3',
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
          'getPatientPrismMedicalRecords_V3',
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
          headingStyle={{ ...viewStyles.text('SB', 14, '#000000', 1, 23) }}
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

  const downloadPDFTestReport = (fileShare?: boolean) => {
    if (currentPatient?.id) {
      setLoading && setLoading(true);
      if (data?.labTestSource === 'Hospital') {
        client
          .query<getIndividualTestResultPdf, getIndividualTestResultPdfVariables>({
            query: GET_INDIVIDUAL_TEST_RESULT_PDF,
            variables: {
              patientId: currentPatient?.id,
              recordId: data?.id,
              sequence: data?.testSequence,
            },
          })
          .then(({ data }: any) => {
            if (data?.getIndividualTestResultPdf?.url) {
              imagesArray?.length === 0
                ? downloadDocument(data?.getIndividualTestResultPdf?.url, fileShare)
                : callConvertToZipApi(data?.getIndividualTestResultPdf?.url, fileShare);
            }
          })
          .catch((e: any) => {
            setLoading?.(false);
            currentPatient && handleGraphQlError(e, 'Report is yet not available');
            CommonBugFender('HealthRecordDetails_downloadPDFTestReport', e);
          });
      } else if (!!data?.healthCheckDate) {
        downloadDocument(data.fileUrl);
      } else if (
        (data?.labTestSource == 'self' || data?.labTestSource == '247self') &&
        data?.labTestResults?.length === 0
      ) {
        imagesArray?.length === 1 ? downloadDocument() : callConvertToZipApi();
      } else {
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
                ? downloadDocument(data?.getLabResultpdf?.url, fileShare)
                : callConvertToZipApi(data?.getLabResultpdf?.url, fileShare);
            }
          })
          .catch((e: any) => {
            setLoading?.(false);
            currentPatient && handleGraphQlError(e, 'Report is yet not available');
            CommonBugFender('HealthRecordDetails_downloadPDFTestReport', e);
          });
      }
    }
  };

  const callConvertToZipApi = (pdfUrl?: string, fileShare?: boolean) => {
    setLoading?.(true);
    const fileUrls = imagesArray?.map((item: any) => item?.file_Url);
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
          downloadZipFile(data?.convertToZip?.zipUrl, fileShare);
        }
      })
      .catch((e: any) => {
        setLoading && setLoading(false);
        currentPatient && handleGraphQlError(e, 'Report is yet not available');
        CommonBugFender('HealthRecordDetails_callConvertToZipApi', e);
      })
      .finally(() => {
        setLoading && setLoading(false);
      });
  };

  const downloadZipFile = (zipUrl: string, fileShare?: boolean) => {
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
      addAndroidDownloads:
        !fileShare && fileShare === undefined
          ? {
              title: fileName,
              useDownloadManager: true,
              notification: true,
              path: downloadPath,
              mime: mimeType(downloadPath),
              description: 'File downloaded by download manager.',
            }
          : undefined,
    })
      .fetch('GET', zipUrl)
      .then((res) => {
        setLoading && setLoading(false);
        postWebEngagePHR(currentPatient, webEngageEventName, webEngageSource, eventInputData);
        const shareOptions = {
          title: mimeType(res.path()),
          url: `file://${res.path()}`,
          failOnCancel: false,
          showAppsToView: true,
        };
        if (fileShare!! && fileShare === true) {
          Platform.OS === 'ios'
            ? RNFetchBlob.ios.previewDocument(res.path())
            : Share.open(shareOptions);
        } else {
          Platform.OS === 'ios'
            ? RNFetchBlob.ios.previewDocument(res.path())
            : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
        }
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
        <Button title={'SAVE AS PDF'} onPress={_callDownloadDocumentApi} />
      </View>
    );
  };

  const renderDetailsFinding = () => {
    const hasNumber = (myString: string) => {
      return /\d/.test(myString);
    };
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
            let validNumber = new RegExp(/^-?([0-9]*\.?[0-9]+|[0-9]+\.?[0-9]*)$/);
            var checkNumber = validNumber.test(item?.result);
            var resultColorChanger: boolean;
            var stringColorChanger: boolean;
            var rangeColorChanger: boolean;
            var columnDecider: boolean;
            var symbolSearch: boolean;
            var numberOfLineBreaks: any;
            if (!!item?.range) {
              var regExp = /[a-zA-Z!<:;>@#%^~=`{};&*]/g;
              var rangeBool = regExp.test(item?.range);
              var numCheck = hasNumber(item?.range);
              if (!rangeBool && !!numCheck) {
                minNum = item?.range?.split(/[-_–]/)[0].trim();
                maxNum = item?.range?.split(/[-_–]/)[1].trim();
                let parseResult = Number(item?.result);
                if (!!minNum && !!maxNum) {
                  parseResult >= minNum && parseResult <= maxNum
                    ? (resultColorChanger = true)
                    : (resultColorChanger = false);
                }
              }
              if (rangeBool) {
                symbolSearch = true;
                rangeColorChanger = true;
              } else {
                symbolSearch = false;
                rangeColorChanger = false;
              }
              if (item?.range?.length > 40) {
                columnDecider = true;
              } else {
                columnDecider = false;
              }
            }

            if (!!item?.result) {
              var regex = /[a-zA-Z-!$%^&*()_+|~=`{}[:;<>?,@#\]]/g;
              var resultStr = regex.test(item?.result);
              if (resultStr) {
                rangeColorChanger = true;
              } else {
                rangeColorChanger = false;
              }
              if (item?.result?.length > 14) {
                stringColorChanger = true;
              }
              numberOfLineBreaks = (item?.result?.match(/\n/g) || []).length;
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
                        !numCheck ||
                        symbolSearch === true ||
                        item?.range === item?.result
                          ? '#9B9B9B'
                          : resultColorChanger
                          ? '#16DE9B'
                          : '#D87878',
                      height:
                        stringColorChanger === true && item?.result?.length > 100
                          ? 170
                          : !!item.range &&
                            item?.range?.length > 70 &&
                            item?.parameterName?.length > 70
                          ? 330
                          : !!item.range && item?.range?.length > 70
                          ? 280
                          : !!item.range && item?.range?.length < 70 && item?.range?.length > 30
                          ? 210
                          : !!item.result && numberOfLineBreaks >= 3
                          ? 190
                          : !!item?.parameterName && item?.parameterName?.length > 60
                          ? 150
                          : !!item?.result && numberOfLineBreaks <= 2 && item?.result?.length < 100
                          ? 190
                          : 150,
                    },
                  ]}
                >
                  <View style={styles.labelViewStyle}>
                    <Text style={styles.labelStyle}>{item?.parameterName}</Text>
                    {data.labTestSource === 'Hospital' && !!checkNumber ? (
                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => {
                          handleOnClickForGraphPopUp(item.parameterName, data?.labTestName);
                        }}
                      >
                        <BarChar size="sm" />
                      </TouchableOpacity>
                    ) : null}
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
                          width: stringColorChanger === true ? '95%' : '45%',
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
                              symbolSearch === true ||
                              !numCheck ||
                              !item?.range ||
                              item?.range === item?.result
                                ? '#F7F7F7'
                                : resultColorChanger
                                ? theme.colors.COMPLETE_STATUS_BGK
                                : theme.colors.FAILURE_STATUS_BGK,
                            color:
                              stringColorChanger === true ||
                              rangeColorChanger === true ||
                              symbolSearch === true ||
                              !numCheck ||
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
                                : !!item.result && numberOfLineBreaks >= 3
                                ? 80
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

    const handleOnClickForGraphPopUp = (paramName: any, labTestName: any) => {
      setLoading && setLoading(true);
      client
        .query<getVisualizationData, getVisualizationDataVariables>({
          query: GET_VISUALIZATION_DATA,
          variables: {
            uhid: currentPatient?.uhid,
            serviceName: labTestName,
            parameterName: paramName,
          },
        })
        .then(({ data }: any) => {
          if (data?.getVisualizationData?.response?.length > 0) {
            showResponseData(data.getVisualizationData.response);
            setSendParamName(paramName);
            setSendTestReportName(labTestName);
          }
          setShowPopup(true);
        })
        .catch((e: any) => {
          setLoading?.(false);
          currentPatient && handleGraphQlError(e, 'Report is yet not available');
          CommonBugFender('HealthRecordDetails_downloadPDFTestReport', e);
        });
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
            <Text style={styles.rangeValueContainer}>{`${range + ` ${unit}`}`}</Text>
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
            onPress={() => (labResults ? downloadPDFTestReport(true) : downloadDocument())}
          >
            <ShareBlueIcon size={'md'} style={{ width: 22, height: 22 }} />
          </TouchableOpacity>
        </View>
        <View style={styles.dateViewRender}>{renderDateView()}</View>
        <View style={styles.doctorNameRender}>
          <Text style={styles.recordNameTextStyle}>
            {data?.labTestName || data?.healthCheckName}
          </Text>
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

  const downloadDocument = (pdfUrl: string = '', fileShare?: boolean) => {
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
      addAndroidDownloads:
        !fileShare && fileShare === undefined
          ? {
              title: fileName,
              useDownloadManager: true,
              notification: true,
              path: downloadPath,
              mime: mimeType(downloadPath),
              description: 'File downloaded by download manager.',
            }
          : undefined,
    })
      .fetch(
        'GET',
        labResults
          ? pdfUrl || data?.testResultFiles[0].file_Url
          : data?.testResultFiles[0].file_Url,
        {
          //some headers ..
        }
      )
      .then((res) => {
        setLoading && setLoading(false);
        postWebEngagePHR(currentPatient, webEngageEventName, webEngageSource, eventInputData);
        const shareOptions = {
          title: mimeType(res.path()),
          url: `file://${res.path()}`,
          failOnCancel: false,
          showAppsToView: true,
        };

        if (!!fileShare && fileShare === true) {
          Platform.OS === 'ios'
            ? RNFetchBlob.ios.previewDocument(res.path())
            : Share.open(shareOptions);
        } else {
          Platform.OS === 'ios'
            ? RNFetchBlob.ios.previewDocument(res.path())
            : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
        }
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

  const onPressAddParamterDetails = () => {
    let arrDate: [] = [];
    let arrRange: [] = [];
    let arrResult: [] = [];
    let modifiedResult: [] = [];
    let validNumber = new RegExp(/^[0-9]*([.,][0-9]+)?$/);
    if (resonseData?.length > 0) {
      resonseData?.map((items: any) => {
        let checkValidNumber = validNumber.test(items?.result);
        if (!!checkValidNumber) {
          arrDate?.push(items.resultDate);
          arrRange?.push(items.range);
          arrResult?.push(items.result);
        }
        setLoading && setLoading(false);
      });
    } else {
      let checkValidNumber = validNumber.test(resonseData?.result);
      if (!!checkValidNumber) {
        arrDate?.push(resonseData.resultDate);
        arrRange?.push(resonseData.range);
        arrResult?.push(resonseData.result);
      }
      setLoading && setLoading(false);
    }
    arrResult?.map((itm) => {
      modifiedResult.push({ y: Number(itm) });
    });
    var regex = /[a-zA-Z!$%^&*()_+|~=`{}[:;<>?,@#\]]/g;
    var rangeDecider;
    var minNumber;
    var maxNumber;
    var resultStr = regex.test(arrRange[0]);
    if (!resultStr) {
      rangeDecider = arrRange[0].split('-');
      minNumber = Number(rangeDecider[0]);
      maxNumber = Number(rangeDecider[1]);
    }
    const lineData = arrResult?.map((i) => Number(i));
    const dateForRanges = arrDate?.map((i) => Number(i));
    return arrResult?.length > 0 ? (
      <CombinedBarChart
        title={sendParamName}
        onClickClose={() => setShowPopup(false)}
        isVisible={true}
        date={data?.date || data?.startDateTime || data?.billDateTime}
        minLine={!!minNumber ? minNumber : 0}
        maxLine={!!maxNumber ? maxNumber : 5}
        resultsData={modifiedResult}
        lineData={lineData}
        rangeDate={dateForRanges}
        testReport={sendTestReportName}
        allTestReports={testReportsData}
        onSendTestReport={(selectedItem) => callBackTestReports(selectedItem)}
        siteName={data?.siteDisplayName}
        serviceName={sendTestReportName}
      />
    ) : (
      Alert.alert('OOPS!!', 'Result doesnt have a valid value')
    );
  };

  const callBackTestReports = (selectedItem: any) => {
    setShowPopup(false);
    setData(selectedItem);
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
          {showPopup && onPressAddParamterDetails()}
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
