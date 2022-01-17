import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  ArrowOrange,
  BarChar,
  LabTestIcon,
  LightBulb,
  ShareBlueIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Share from 'react-native-share';
import moment from 'moment';
import React, { useEffect, useState, useCallback } from 'react';
// import fetch from 'node-fetch';
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
  GET_INFORMATIVE_CONTENT,
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
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { ProfileImageComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/ProfileImageComponent';
import {
  g,
  handleGraphQlError,
  isSmallDevice,
  postCleverTapPHR,
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
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { getIonicCode } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  getInformativeContent,
  getInformativeContentVariables,
} from '@aph/mobile-patients/src/graphql/types/getInformativeContent';
import { configure } from '@react-native-community/netinfo';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

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
    paddingVertical: 10,
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
    height: '85%',
    width: 1,
    top: 10,
    backgroundColor: '#909090',
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
  topView: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
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
  contentCodeView: {
    left: 15,
    height: 50,
    backgroundColor: '#ffe6cc',
    borderRadius: 5,
    width: '95%',
    bottom: 3,
    top: 4,
  },
  contentCodeBtn: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    width: '90%',
    top: 7,
    left: 10,
    right: 10,
  },
  contentCodeText: {
    ...theme.fonts.IBMPlexSansSemiBold(13),
    width: '80%',
    left: 10,
    color: '#FC9916',
  },
  arrowIcon: {
    left: 20,
    width: 30,
    height: 30,
    top: 2,
  },
});

export interface ICONICCODE {
  title: string;
  FQA: [];
}

export interface TestReportViewScreenProps extends NavigationScreenProps {}

export const TestReportViewScreen: React.FC<TestReportViewScreenProps> = (props) => {
  const testReportsData = props.navigation?.getParam('testReport') || [];
  const [testResultArray, setTestResultArray] = useState<any>(
    props.navigation.state.params ? props.navigation.state.params.testResultArray : []
  );
  const [trueOR, setTrueOR] = useState<boolean>(false);
  const callDataBool = props.navigation?.getParam('callDataBool') || false;
  const [showPrescription, setshowPrescription] = useState<boolean>(true);
  const [showAdditionalNotes, setShowAdditionalNotes] = useState<boolean>(false);
  const [showReadMore, setShowReadMore] = useState<boolean>(false);
  const [apiError, setApiError] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const [showReadMoreData, setShowReadMoreData] = useState('');
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [resonseData, showResponseData] = useState<[]>([]);
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const [showPDF, setShowPDF] = useState<boolean>(false);
  const [pdfFileUrl, setPdfFileUrl] = useState<string>('');
  const [fileNamePDF, setFileNamePDF] = useState<string>('');
  const [sendParamName, setSendParamName] = useState<string>('');
  const [sendTestReportName, setSendTestReportName] = useState<string>('');
  const [lonicCode, setLonicCode] = useState<string>('');
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const config = AppConfig.Configuration;
  const { buildApolloClient, authToken } = useAuth();
  const apolloClientWithAuth = buildApolloClient(authToken);
  let responseAPI: boolean = false;
  let infoResponseAPI: boolean = false;

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

  // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    Platform.OS === 'android' && requestReadSmsPermission();
    setLoading && setLoading(true);
    // This is for creating a new object after collecting the data from the api..
    asyncFetchDailyData(data);
  }, []);

  const combineObjects = (arr: any) => {
    return arr.reduce((acc: any, o: any) => {
      return { ...o, ...acc };
    }, {});
  };

  const asyncFetchDailyData = async (dataToFetch: any) => {
    const apiArray: any[] = [];
    dataToFetch?.labTestResults?.map((item: any) => {
      apiArray.push({ parameterName: item?.parameterName, testName: dataToFetch?.labTestName });
    });
    const getResponse = await getClinicalCode(apiArray);
    const mainData: any[] = [];
    let mainSubData: any;
    const result = getResponse?.data?.getInformativeContent?.response?.map(
      (item: any, mainIndex: any) => {
        const o = Object.assign({}, dataToFetch?.labTestResults[mainIndex]);
        o.contentCode = Number(item?.contentCode);
        o.loincCode = item?.loincCode;
        return o;
      }
    );
    mainData.push({ ...dataToFetch, labTestResults: result });
    const mainObj = combineObjects(mainData);
    const contentCodeData: [] = [];
    const druplData: [] = [];
    mainObj?.labTestResults?.map((item: any) => {
      contentCodeData.push(item?.contentCode);
    });
    const duplicateContentCode = contentCodeData?.map((i) => Number(i));
    try {
      const drupalResponse = await getIonicCode(duplicateContentCode);
      if (!!drupalResponse?.data?.success) {
        setSuccessMessage(drupalResponse?.data?.success);
        drupalResponse?.data?.data?.map((items: any) => {
          duplicateContentCode?.map((mainItem: any) => {
            if (mainItem === items?.identifier) {
              druplData?.push({
                content: items?.content,
                identifier: items?.identifier,
                desc: items?.desc,
                title: items?.title,
              });
            }
          });
        });
        mainSubData = mainObj.labTestResults?.map((iteee: any) => {
          druplData?.map((item: any) => {
            if (iteee.contentCode === item?.identifier) {
              iteee['content'] = item?.content;
              iteee['desc'] = item?.desc;
              iteee['title'] = item?.title;
            }
          });
        });
      }
    } catch (error) {
      CommonBugFender('Fetch_info_content', error);
      currentPatient && handleGraphQlError(error);
      responseAPI = true;
    }
    if (!!infoResponseAPI || !!responseAPI) {
      setData(dataToFetch);
    } else {
      setData(mainObj);
    }
    setLoading && setLoading(false);
    setTrueOR(true);
  };

  const getClinicalCode = async (arrayParams: any) => {
    const res = await client
      .query<getInformativeContent, getInformativeContentVariables>({
        query: GET_INFORMATIVE_CONTENT,
        variables: {
          uhid: currentPatient?.uhid,
          params: arrayParams,
        },
        fetchPolicy: 'no-cache',
      })
      .catch((error) => {
        CommonBugFender('HealthRecordsHome_fetchTestData', error);
        currentPatient && handleGraphQlError(error);
        infoResponseAPI = true;
      });
    return res;
  };

  const getOrderDetails = async (displayId: string) => {
    const res = await apolloClientWithAuth.query<
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
        const resultForVisitNo = labResultsData?.find((item: any) => item?.identifier == visitId);
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
          : props.navigation.navigate(AppRoutes.HomeScreen);
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
              testResultArray?.length === 1
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
        testResultArray?.length === 1 ? downloadDocument() : callConvertToZipApi();
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
              testResultArray?.length === 1
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
    const fileUrls = testResultArray?.map((item: any) => item?.file_Url);
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
    postCleverTapPHR(
      currentPatient,
      fileShare
        ? CleverTapEventName.PHR_SHARE_LAB_TEST_REPORT
        : CleverTapEventName.PHR_DOWNLOAD_TEST_REPORT,
      'Test Report Screen View'
    );
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
    const _callDownloadDocumentApi = () => {
      if (testResultArray?.length === 1) {
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
        <View>
          <View style={{ flexDirection: 'row' }}>
            <LabTestIcon style={{ height: 20, width: 19, marginRight: 14 }} />
            <Text style={{ ...viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE, 1, 21) }}>
              {'Impressions'}
            </Text>
          </View>
          {data?.labTestResults?.map((item: any) => {
            const eventInputData = removeObjectProperty(item, data?.labTestName);
            const unit = item?.unit;
            let minNum: number;
            let maxNum: number;
            let resultStr: boolean;
            const validNumber = new RegExp(/^-?([0-9]*\.?[0-9]+|[0-9]+\.?[0-9]*)$/);
            var checkNumber = validNumber.test(item?.result);
            let resultColorChanger: boolean;
            let stringColorChanger: boolean;
            let rangeColorChanger: boolean;
            let columnDecider: boolean;
            let symbolSearch: boolean;
            let numberOfLineBreaks: any;
            if (!!item?.range) {
              const regExp = /[a-zA-Z!<:;>@#%^~=`{};&*]/g;
              const rangeBool = regExp.test(item?.range);
              var numCheck = hasNumber(item?.range);
              if (!rangeBool && !!numCheck) {
                minNum = item?.range?.split(/[-_–]/)[0]?.trim();
                maxNum = item?.range?.split(/[-_–]/)[1]?.trim();
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
              const regex = /[a-zA-Z-!$%^&*()_+|~=`{}[:;<>?,@#\]]/g;
              resultStr = regex.test(item?.result);
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
                    <Text numberOfLines={1} style={styles.labelStyle}>
                      {item?.parameterName}
                    </Text>
                    {data.labTestSource === 'Hospital' && !!item?.loincCode && !resultStr ? (
                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => {
                          postCleverTapPHR(
                            currentPatient,
                            CleverTapEventName.PHR_INFO_CONTENT,
                            'PHR Info content tracking',
                            eventInputData
                          );
                          handleOnClickForGraphPopUp(
                            item?.parameterName,
                            data?.labTestName,
                            item?.loincCode
                          );
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
                  {trueOR && successMessage && item?.content !== 0 && item?.content?.length > 0 ? (
                    <View style={styles.contentCodeView}>
                      <TouchableOpacity
                        style={styles.contentCodeBtn}
                        onPress={() => pushToInformaticPage(item?.content, item?.desc, item?.title)}
                      >
                        <LightBulb size="sm" />
                        <Text numberOfLines={2} style={styles.contentCodeText}>
                          {item.desc}
                        </Text>
                        <ArrowOrange style={styles.arrowIcon} />
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              </>
            ) : null;
          })}
        </View>
      );
    };

    const pushToInformaticPage = (content: any, desc: any, title: any) => {
      props.navigation.navigate(AppRoutes.InformativeContent, {
        relatedFAQ: content,
        desc: desc,
        title: title,
      });
    };

    const handleOnClickForGraphPopUp = (paramName: any, labTestName: any, lonCode: any) => {
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
            setLonicCode(String(lonCode));
            setShowPopup(true);
          }
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
          {data?.labTestSource === 'Hospital'
            ? testResultArray.map((item: any, index: any) => {
                const file_name = item?.fileName || '';
                const file_Url = item?.file_Url || '';
                return file_name && file_name.toLowerCase().endsWith('.png') ? (
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.imageViewStyle}
                    onPress={() => {
                      setShowPDF(true);
                      setPdfFileUrl(file_Url);
                      setFileNamePDF(file_name);
                    }}
                  >
                    <Pdf
                      key={file_Url}
                      source={{ uri: file_Url }}
                      style={styles.pdfStyle}
                      singlePage
                    />
                  </TouchableOpacity>
                ) : null;
              })
            : testResultArray?.map((item: any, index: any) => {
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
                    <Pdf
                      key={file_Url}
                      source={{ uri: file_Url }}
                      style={styles.pdfStyle}
                      singlePage
                    />
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
        {testResultArray?.length > 0 ? renderImage() : null}
        {testResultArray?.length > 0 || labResults ? renderDownloadButton() : null}
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
    var pdfStringHandler = data?.labTestName?.includes('.pdf')
      ? data?.labTestName?.slice(0, -4)
      : data?.labTestName;
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
            {pdfStringHandler || data?.healthCheckName}
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
    postCleverTapPHR(
      currentPatient,
      fileShare
        ? CleverTapEventName.PHR_SHARE_LAB_TEST_REPORT
        : CleverTapEventName.PHR_DOWNLOAD_TEST_REPORT,
      'Test Report Screen View'
    );
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
    } else if (!!callDataBool) {
      props.navigation.goBack();
    } else {
      props.navigation.state.params?.onPressBack && props.navigation.state.params?.onPressBack();
      props.navigation.goBack();
    }
  };

  const onPressAddParamterDetails = () => {
    const arrDate: [] = [];
    const arrRange: [] = [];
    const arrResult: [] = [];
    const modifiedResult: [] = [];
    let unit: string;
    const validNumber = new RegExp(/^[0-9]*([.,][0-9]+)?$/);
    if (resonseData?.length > 0) {
      resonseData?.map((items: any) => {
        const checkValidNumber = validNumber.test(items?.result);
        if (!!checkValidNumber) {
          arrDate?.push(items.resultDate);
          arrRange?.push(items.range);
          arrResult?.push(items.result);
          unit = items.unit;
        }
        setLoading && setLoading(false);
      });
    } else {
      const checkValidNumber = validNumber.test(resonseData?.result);
      if (!!checkValidNumber) {
        arrDate?.push(resonseData?.resultDate);
        arrRange?.push(resonseData?.range);
        arrResult?.push(resonseData?.result);
        unit = items?.unit;
      }
      setLoading && setLoading(false);
    }
    arrResult?.map((itm) => {
      modifiedResult.push({ y: Number(itm) });
    });
    const regex = /[a-zA-Z!$%^&*()_+|~=`{}[:;<>?,@#\]]/g;
    let rangeDecider;
    let minNumber;
    let maxNumber;
    const resultStr = regex.test(arrRange[0]);
    if (!resultStr) {
      rangeDecider = arrRange[0].split('-');
      minNumber = Number(rangeDecider[0]);
      maxNumber = Number(rangeDecider[1]);
    }
    postCleverTapPHR(
      currentPatient,
      CleverTapEventName.PHR_BAR_CHART_VISUALISATION,
      'Test Report Screen View',
      resonseData
    );
    const lineData = arrResult?.map((i) => Number(i));
    const dateForRanges = arrDate?.map((i) => Number(i));
    const imgArray: [] = [];
    modifiedResult?.map((item: any) => {
      imgArray?.push({ y: item.y, marker: String(item.y + ` ${unit}`) });
    });
    return arrDate.length > 0 ? (
      <CombinedBarChart
        title={sendParamName}
        onClickClose={() => setShowPopup(false)}
        isVisible={true}
        date={data?.date || data?.startDateTime || data?.billDateTime}
        minLine={!!minNumber ? minNumber : 0}
        maxLine={!!maxNumber ? maxNumber : 5}
        resultsData={imgArray}
        lineData={lineData}
        rangeDate={dateForRanges}
        testReport={sendTestReportName}
        allTestReports={testReportsData}
        onSendTestReport={(selectedItem, testImagesArray, callApi) =>
          callBackTestReports(selectedItem, testImagesArray, callApi)
        }
        lonicCode={lonicCode}
        siteName={data?.siteDisplayName}
        serviceName={sendTestReportName}
        unit={unit}
      />
    ) : null;
  };

  const callBackTestReports = (selectedItem: any, testImagesArray: any, callApi: any) => {
    setShowPopup(false);
    selectedItem?.labTestResults?.length > 0
      ? loadParams(selectedItem, testImagesArray, callApi)
      : null;
  };

  const loadParams = (selectedItem: any, testImagesArray: any, callApi: any) => {
    setLoading && setLoading(true);
    setData(selectedItem);
    setTestResultArray(testImagesArray);
    asyncFetchDailyData(selectedItem);
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
