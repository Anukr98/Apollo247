import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  LabTestIcon,
  ShareBlueIcon,
  ShareIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
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
import { GET_LAB_RESULT_PDF } from '@aph/mobile-patients/src/graphql/profiles';
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
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import {
  getLabResultpdf,
  getLabResultpdfVariables,
} from '@aph/mobile-patients/src/graphql/types/getLabResultpdf';
import { WebEngageEventName } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import _, { min } from 'lodash';
import { PhrNoDataComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/PhrNoDataComponent';
import { navigateToHome } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { ResultTestReportsPopUp } from '@aph/mobile-patients/src/components/HealthRecords/Components/ResultTestReportsPopUp';

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
    width: '85%',
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
    ...theme.fonts.IBMPlexSansMedium(14),
    marginLeft: 18,
    textAlign: 'left',
  },
  descText: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Medium',
    paddingHorizontal: 10,
    paddingTop: 5,
    textAlign: 'justify',
    left: 15,
    borderRadius: 10,
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
    ...theme.fonts.IBMPlexSansMedium(14),
    marginTop: 10,
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
  const [showReadMoreData, setShowReadMoreData] = useState('');
  const [data, setData] = useState<any>(
    props.navigation.state.params ? props.navigation.state.params.data : {}
  );
  const labResults = props.navigation.state.params
    ? props.navigation.state.params.labResults
    : false;
  const [apiError] = useState(false);
  const { currentPatient } = useAllCurrentPatients();
  const { setLoading } = useUIElements();
  const client = useApolloClient();

  //for deeplink
  const movedFrom = props.navigation.getParam('movedFrom');

  useEffect(() => {
    Platform.OS === 'android' && requestReadSmsPermission();
  });

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
      if (Platform.OS === 'android') {
        if (!!data?.fileUrl) {
          downloadDocument();
        }
      }
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
            downloadDocument(data?.getLabResultpdf?.url);
          }
        })
        .catch((e: any) => {
          setLoading?.(false);
          currentPatient && handleGraphQlError(e, 'Report is yet not available');
        });
    }
  };

  const renderDownloadButton = () => {
    const buttonTitle = 'TEST REPORT';
    const btnTitle = labResults && Platform.OS === 'ios' ? 'SAVE ' : 'DOWNLOAD ';
    return (
      <View style={{ marginHorizontal: 40, marginBottom: 15, marginTop: 33 }}>
        {!!data.fileUrl && labResults && Platform.OS === 'ios' ? (
          <Button
            title={'SAVE ATTACHMENT'}
            style={{ marginBottom: 20 }}
            onPress={() => downloadDocument()}
          />
        ) : null}
        <Button
          title={btnTitle + buttonTitle}
          onPress={() => (labResults ? downloadPDFTestReport() : downloadDocument())}
        />
      </View>
    );
  };

  const renderDetailsFinding = () => {
    const convertToNum = (stringToNumber: string, item: number) => {
      if (!!stringToNumber && stringToNumber.length <= 12) {
        var symbolSearch = stringToNumber.includes('<') || stringToNumber.includes('>');
        if (!symbolSearch) {
          const splitNum = stringToNumber.split('-')[item].trim();
          let numCoverter = parseInt(splitNum);
          return numCoverter;
        }
      }
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
            let minNum = convertToNum(item.range, 0);
            let maxNum = convertToNum(item.range, 1);
            let parseResult = parseInt(item.result);
            var resultColorChanger: boolean;
            var stringColorChanger: boolean;
            var rangeColorChanger: boolean;
            var columnDecider: boolean;
            if (!!item.result) {
              if (item.result.length > 14) {
                stringColorChanger = true;
              } else {
                parseResult >= minNum && parseResult <= maxNum
                  ? (resultColorChanger = true)
                  : (resultColorChanger = false);
              }
            }
            if (!!item.range) {
              var symbolSearch =
                item.range.includes('<') || item.range.includes('>') || item.range.includes(':');
              if (symbolSearch) {
                rangeColorChanger = true;
              } else {
                rangeColorChanger = false;
              }
              if (item.range.length > 30) {
                columnDecider = true;
              } else {
                columnDecider = false;
              }
            }

            return !!item.result ? (
              <>
                <View
                  style={[
                    styles.botContainer,
                    {
                      borderLeftColor:
                        stringColorChanger === true || rangeColorChanger === true || !item.range
                          ? '#9B9B9B'
                          : resultColorChanger === true
                          ? '#16DE9B'
                          : '#D87878',
                      height:
                        stringColorChanger === true && item.result.length > 100
                          ? 170
                          : !!item.range && item.range.length > 30
                          ? 200
                          : 110,
                    },
                  ]}
                >
                  <View style={styles.labelViewStyle}>
                    <Text style={styles.labelStyle}>{item.parameterName}</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: columnDecider ? 'column' : 'row',
                      height:
                        stringColorChanger === true && item.result.length > 100 ? '50%' : '65%',
                      width:
                        stringColorChanger === true && item.result.length > 60 ? '97%' : '100%',
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
                              stringColorChanger === true && item.result.length > 100 ? 15 : 0.5,
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
                              !item.range
                                ? '#F7F7F7'
                                : resultColorChanger === true
                                ? theme.colors.COMPLETE_STATUS_BGK
                                : theme.colors.FAILURE_STATUS_BGK,
                            color:
                              stringColorChanger === true ||
                              rangeColorChanger === true ||
                              !item.range
                                ? theme.colors.ASTRONAUT_BLUE
                                : resultColorChanger === true
                                ? theme.colors.COMPLETE_STATUS_TEXT
                                : theme.colors.FAILURE_STATUS_TEXT,
                            lineHeight: stringColorChanger === true ? 21 : 18,
                            fontFamily:
                              stringColorChanger === true ? 'IBMPlexSans' : 'IBMPlexSans-Medium',
                            width:
                              stringColorChanger === true && item.result.length > 100
                                ? '100%'
                                : undefined,
                          },
                        ]}
                      >
                        {`${item.result}` || 'N/A'}
                      </Text>
                      {item.result.length > 100 ? (
                        <TouchableOpacity
                          onPress={() => renderReadMore(item.result)}
                          style={styles.readMoreTouch}
                        >
                          <Text style={styles.readMoreText}>{'READ MORE'}</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                    {!!item.range
                      ? renderDataFromTestReports(item.range, unit, columnDecider)
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
            <Text style={styles.rangeTextContainer}>{range ? `${range + `${unit}`}` : 'N/A'}</Text>
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

  const renderImage = () => {
    const file_name = g(data, 'testResultFiles', '0', 'fileName')
      ? g(data, 'testResultFiles', '0', 'fileName')
      : '';
    return (
      <View
        style={{
          marginTop: 0,
        }}
      >
        <ScrollView>
          {file_name && file_name.toLowerCase().endsWith('.pdf') ? (
            <View style={{ marginHorizontal: 20, marginBottom: 15, marginTop: 30 }}>
              <Pdf key={data.fileUrl} source={{ uri: data.fileUrl }} style={styles.PDFRender} />
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                props.navigation.navigate(AppRoutes.ImageSliderScreen, {
                  images: [data.fileUrl],
                  heading: file_name || 'Image',
                });
              }}
              style={{ marginHorizontal: 20, marginBottom: 15, marginTop: 15 }}
            >
              <Image
                placeholderStyle={styles.imageRender}
                PlaceholderContent={<Spinner style={{ backgroundColor: 'transparent' }} />}
                source={{ uri: data.fileUrl }}
                style={{
                  width: '100%',
                  height: 425,
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderData = () => {
    return (
      <View style={{ marginBottom: 20 }}>
        {data?.labTestResults?.length > 0 ? renderDetailsFinding() : null}
        {data?.additionalNotes ? renderTopLineReport() : null}
        {!!data.fileUrl ? renderImage() : null}
        {!!data.fileUrl || labResults ? renderDownloadButton() : null}
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
            <Text style={styles.doctorTextStyle}>
              {'Dr. ' + data?.labTestRefferedBy || 'Dr. -'}
            </Text>
            <Text style={styles.doctorTextStyle}>{` ${'\u25CF'} ` + data?.siteDisplayName}</Text>
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
    const webEngageSource = 'Lab Test';
    const webEngageEventName = WebEngageEventName.PHR_DOWNLOAD_TEST_REPORT;
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
        postWebEngagePHR(currentPatient, webEngageEventName, webEngageSource, data);
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
