import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  SectionList,
  BackHandler,
  TextInput,
  Keyboard,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  Filter,
  PhrSearchIcon,
  SearchDarkPhrIcon,
  LabTestPhrSearchIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { HealthRecordCard } from '@aph/mobile-patients/src/components/HealthRecords/Components/HealthRecordCard';
import { PhrNoDataComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/PhrNoDataComponent';
import { ProfileImageComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/ProfileImageComponent';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import {
  MedicalRecordType,
  AddLabTestRecordInput,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { addPatientLabTestRecord } from '@aph/mobile-patients/src/graphql/types/addPatientLabTestRecord';
import {
  ADD_PATIENT_LAB_TEST_RECORD,
  GET_INDIVIDUAL_TEST_RESULT_PDF,
  GET_PRISM_AUTH_TOKEN,
  MERGE_PDF,
} from '@aph/mobile-patients/src/graphql/profiles';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { mimeType } from '../../helpers/mimeType';
import {
  g,
  postWebEngageEvent,
  initialSortByDays,
  editDeleteData,
  getSourceName,
  handleGraphQlError,
  postCleverTapPHR,
  phrSortByDate,
  getPhrHighlightText,
  isValidSearch,
  phrSearchCleverTapEvents,
  postCleverTapIfNewSession,
  removeObjectProperty,
  postCleverTapEvent,
  removeObjectNullUndefinedProperties,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  deletePatientPrismMedicalRecords,
  getPatientPrismMedicalRecordsApi,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useApolloClient } from 'react-apollo-hooks';
import moment from 'moment';
import _ from 'lodash';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  getPrismAuthTokenVariables,
  getPrismAuthToken,
} from '@aph/mobile-patients/src/graphql/types/getPrismAuthToken';
import { searchPHRApiWithAuthToken } from '@aph/mobile-patients/src/helpers/apiCalls';
import { SearchHealthRecordCard } from '@aph/mobile-patients/src/components/HealthRecords/Components/SearchHealthRecordCard';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { BillRecordCard } from '@aph/mobile-patients/src/components/HealthRecords/BillRecordCard';
import { mergePDFS, mergePDFSVariables } from '@aph/mobile-patients/src/graphql/types/mergePDFS';
import RNFetchBlob from 'rn-fetch-blob';
import {
  getIndividualTestResultPdf,
  getIndividualTestResultPdfVariables,
} from '@aph/mobile-patients/src/graphql/types/getIndividualTestResultPdf';

const styles = StyleSheet.create({
  searchFilterViewStyle: {
    marginHorizontal: 20,
    marginVertical: 22,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuContainerStyle: {
    alignItems: 'flex-end',
    marginTop: 30,
  },
  itemTextStyle: {
    ...theme.viewStyles.text('M', 16, '#01475b'),
    paddingHorizontal: 0,
  },
  selectedTextStyle: {
    ...theme.viewStyles.text('M', 16, '#00b38e'),
    alignSelf: 'flex-start',
  },
  stickyBottomComponentStyle: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: 30,
  },
  sectionHeaderTitleStyle: {
    ...theme.viewStyles.text('SB', 18, theme.colors.LIGHT_BLUE, 1, 23.4),
    marginBottom: 3,
  },
  searchBarMainViewStyle: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 22,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  searchBarViewStyle: {
    backgroundColor: theme.colors.CARD_BG,
    flexDirection: 'row',
    padding: 10,
    flex: 1,
    alignItems: 'center',
    borderRadius: 5,
  },
  cancelTextStyle: {
    ...theme.viewStyles.text('M', 12, theme.colors.SKY_BLUE, 1, 15.6),
    marginLeft: 18,
  },
  textInputStyle: {
    ...theme.viewStyles.text('R', 14, theme.colors.SHERPA_BLUE, 1, 18),
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 1,
  },
  loaderViewStyle: { justifyContent: 'center', flex: 1, alignItems: 'center' },
  loaderStyle: { height: 100, backgroundColor: 'transparent', alignSelf: 'center' },
  healthRecordTypeTextStyle: {
    ...theme.viewStyles.text('R', 12, theme.colors.SILVER_LIGHT, 1, 21),
    marginHorizontal: 13,
  },
  healthRecordTypeViewStyle: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  searchListHeaderViewStyle: { marginHorizontal: 17, marginVertical: 15 },
  searchListHeaderTextStyle: { ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE, 1, 21) },
  phrNodataMainViewStyle: { marginTop: 59, backgroundColor: 'transparent' },
  searchBarMainView: { flexDirection: 'row', alignItems: 'center' },
  doctorTestReportPHRTextStyle: {
    ...theme.viewStyles.text('R', 12, theme.colors.SKY_BLUE, 1, 14),
    marginLeft: 20,
    marginBottom: 10,
    marginRight: 32,
    marginTop: 2,
  },
});

export enum FILTER_TYPE {
  SORT_BY = 'Sort by',
  TEST_NAME = 'Test Name',
  DATE = 'Bill Date',
  PACKAGE = 'Package',
  PARAMETER_NAME = 'Parameter Name',
  SOURCE = 'Source',
}

type FilterArray = {
  key: FILTER_TYPE;
  title: string;
};

const ConsultRxFilterArray: FilterArray[] = [
  { key: FILTER_TYPE.SORT_BY, title: FILTER_TYPE.SORT_BY },
  { key: FILTER_TYPE.TEST_NAME, title: FILTER_TYPE.TEST_NAME },
  { key: FILTER_TYPE.DATE, title: FILTER_TYPE.DATE },
  { key: FILTER_TYPE.PACKAGE, title: FILTER_TYPE.PACKAGE },
  { key: FILTER_TYPE.PARAMETER_NAME, title: FILTER_TYPE.PARAMETER_NAME },
  { key: FILTER_TYPE.SOURCE, title: FILTER_TYPE.SOURCE },
];

export interface TestReportScreenProps
  extends NavigationScreenProps<{
    testReportsData: any;
    onPressBack: () => void;
    authToken: string;
    callTestReportsApi: () => void;
  }> {}

export const TestReportScreen: React.FC<TestReportScreenProps> = (props) => {
  const testReportsData = props.navigation?.getParam('testReportsData') || [];
  const [testReportMainData, setTestReportMainData] = useState<any>([]);
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [filterApplied, setFilterApplied] = useState<FILTER_TYPE | string>('');
  const [localTestReportsData, setLocalTestReportsData] = useState<Array<{
    key: string;
    data: any[];
  }> | null>(null);
  const [callApi, setCallApi] = useState(false);
  const [callPhrMainApi, setCallPhrMainApi] = useState(false);
  const [isSearchFocus, SetIsSearchFocus] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchInputFocus, setSearchInputFocus] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const _searchInputRef = useRef(null);
  const [apiError, setApiError] = useState(false);
  const file_name_text = 'TestReport_';

  const [healthRecordSearchResults, setHealthRecordSearchResults] = useState<any>([]);
  const [prismAuthToken, setPrismAuthToken] = useState<string>(
    props.navigation?.getParam('authToken') || ''
  );
  const [searchQuery, setSearchQuery] = useState({});
  const { phrSession, setPhrSession } = useAppCommonData();

  const gotoPHRHomeScreen = () => {
    if (!callApi && !callPhrMainApi) {
      props.navigation.state.params?.onPressBack();
    } else {
      props.navigation.state.params?.onPressBack();
      props.navigation.state.params?.callTestReportsApi();
    }
    props.navigation.goBack();
  };

  const handleBack = async () => {
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
    gotoPHRHomeScreen();
    return true;
  };

  useEffect(() => {
    if (testReportsData?.length > 0) {
      setTestReportMainData(testReportsData);
    } else {
      setApiError(true);
    }
  }, [testReportsData]);

  const getLatestLabAndHealthCheckRecords = () => {
    setShowSpinner(true);
    getPatientPrismMedicalRecordsApi(client, currentPatient?.id, [
      MedicalRecordType.TEST_REPORT,
      MedicalRecordType.HEALTHCHECK,
    ])
      .then((data: any) => {
        const labResultsData = g(
          data,
          'getPatientPrismMedicalRecords_V2',
          'labResults',
          'response'
        );
        const healthChecksData = g(
          data,
          'getPatientPrismMedicalRecords_V2',
          'healthChecks',
          'response'
        );
        let mergeArray: { type: string; data: any }[] = [];
        labResultsData?.forEach((c) => {
          mergeArray.push({ type: 'testReports', data: c });
        });
        healthChecksData?.forEach((c) => {
          mergeArray.push({ type: 'healthCheck', data: c });
        });
        setTestReportMainData(phrSortByDate(mergeArray));
        setShowSpinner(false);
        setCallPhrMainApi(true);
      })
      .catch((error) => {
        CommonBugFender('TestReportScreen_getPatientPrismMedicalRecordsApi', error);
        setShowSpinner(false);
        currentPatient && handleGraphQlError(error);
      });
  };

  useEffect(() => {
    if (callApi) {
      getLatestLabAndHealthCheckRecords();
    }
  }, [callApi]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, [callApi, callPhrMainApi]);

  const getAuthToken = async () => {
    client
      .query<getPrismAuthToken, getPrismAuthTokenVariables>({
        query: GET_PRISM_AUTH_TOKEN,
        fetchPolicy: 'no-cache',
        variables: {
          uhid: currentPatient?.uhid || '',
        },
      })
      .then(({ data }) => {
        const prism_auth_token = g(data, 'getPrismAuthToken', 'response');
        if (prism_auth_token) {
          setPrismAuthToken(prism_auth_token);
        }
      })
      .catch((e) => {
        CommonBugFender('TestReportScreen_GET_PRISM_AUTH_TOKEN', e);
      });
  };

  const onSearchHealthRecords = (_searchText: string) => {
    setSearchLoading(true);
    searchPHRApiWithAuthToken(_searchText, prismAuthToken, 'LabTest')
      .then(({ data }) => {
        setHealthRecordSearchResults([]);
        if (data?.response) {
          const recordData = data.response;
          const finalData: any[] = [];
          recordData.forEach((recordData: any) => {
            const { healthrecordType } = recordData;
            if (healthrecordType === 'LABTEST') {
              finalData.push({ healthkey: MedicalRecordType.TEST_REPORT, value: recordData });
            }
          });
          setHealthRecordSearchResults(finalData);
          setSearchLoading(false);
          phrSearchCleverTapEvents(
            CleverTapEventName.PHR_NO_USERS_SEARCHED_LOCAL.replace(
              '{0}',
              'LabTest'
            ) as CleverTapEventName,
            currentPatient,
            _searchText
          );
        } else {
          getAuthToken();
          setSearchLoading(false);
        }
      })
      .catch((error) => {
        CommonBugFender('TestReportScreen_searchPHRApiWithAuthToken', error);
        getAuthToken();
        setSearchLoading(false);
      });
  };

  useEffect(() => {
    if (testReportMainData) {
      let finalData: { key: string; data: any[] }[] = [];
      let arrData: Array<{
        key: string;
        data: any[];
      }> = [];
      let remItem: { key: string; data: any[] }[] = [];
      let arrElements: { data: any[] }[] = [];
      if (filterApplied) {
        const filterAppliedString =
          filterApplied === FILTER_TYPE.DATE
            ? 'date'
            : filterApplied === FILTER_TYPE.PACKAGE
            ? 'packageName'
            : filterApplied === FILTER_TYPE.TEST_NAME
            ? 'labTestName'
            : filterApplied === FILTER_TYPE.PARAMETER_NAME
            ? 'parameterName'
            : 'labTestSource';
        testReportMainData?.forEach((dataObject: any) => {
          const dataObjectArray: any[] = [];
          if (dataObject?.data?.labTestName && filterApplied === FILTER_TYPE.PARAMETER_NAME) {
            dataObject?.data?.labTestResults?.forEach((parameterObject: any) => {
              const keyValue = parameterObject?.parameterName;
              const dataExistsAt = finalData?.findIndex((data: { key: string; data: any[] }) => {
                return data?.key === keyValue;
              });
              if (keyValue) {
                const modifiedData = { ...dataObject, paramObject: parameterObject };
                if (dataExistsAt === -1 || finalData?.length === 0) {
                  const obj = {
                    key: keyValue,
                    data: [modifiedData],
                  };
                  finalData?.push(obj);
                } else if (dataExistsAt > -1) {
                  const array = finalData[dataExistsAt]?.data;
                  array?.push(modifiedData);
                  finalData[dataExistsAt].data = array;
                }
              }
            });
          } else {
            const dateExistsAt = finalData.findIndex((data: { key: string; data: any[] }) => {
              return (
                (data.key === '247self' ? 'self' : data.key) ===
                getObjectParameter(dataObject?.data, filterAppliedString)
              );
            });
            const keyValue = getObjectParameter(dataObject?.data, filterAppliedString);
            if (keyValue) {
              if (dateExistsAt === -1 || finalData.length === 0) {
                dataObjectArray.push(dataObject);
                const obj = {
                  key: keyValue,
                  data: dataObjectArray,
                };
                finalData.push(obj);
              } else if (dateExistsAt > -1) {
                const array = finalData[dateExistsAt].data;
                array.push(dataObject);
                finalData[dateExistsAt].data = array;
              }
            }
          }
        });
        finalData = finalData?.sort((data1: any, data2: any) => {
          const filteredData1 = _.lowerCase(data1?.key);
          const filteredData2 = _.lowerCase(data2?.key);
          return filteredData2 > filteredData1 ? -1 : filteredData2 < filteredData1 ? 1 : 0;
        });
      } else {
        // render when no filter is applied
        finalData = initialSortByDays('lab-results', testReportMainData, finalData);
        finalData.forEach(function(item) {
          item.data.map((items) => {
            if (!!items?.data?.billNo || items?.data?.billNo === null) {
              let path = 'data.billNo';
              arrElements = _(item.data)
                .filter((object) => _.has(object, path))
                .groupBy(path)
                .map((value, key) => ({
                  key: key,
                  data: value,
                }))
                .value();
              remItem = _(arrElements)
                .groupBy(path)
                .map((value, key) => ({
                  key: item.key,
                  data: value,
                }))
                .value();
            }
          });
          arrData.push({ key: remItem[0].key, data: remItem[0].data });
        });
      }
      if (filterApplied === FILTER_TYPE.DATE) {
        finalData.forEach(function(item) {
          item.data.map((items) => {
            if (!!items?.data?.billNo || items?.data?.billNo === null) {
              let path = 'data.billNo';
              arrElements = _(item.data)
                .filter((object) => _.has(object, path))
                .groupBy(path)
                .map((value, key) => ({
                  key: key,
                  data: value,
                }))
                .value();
              remItem = _(arrElements)
                .groupBy(path)
                .map((value, key) => ({
                  key: item.key,
                  data: value,
                }))
                .value();
            }
          });
          arrData.push({ key: remItem[0].key, data: remItem[0].data });
        });
      }
      arrData?.length > 0 ? setLocalTestReportsData(arrData) : setLocalTestReportsData(finalData);
    }
  }, [filterApplied, testReportMainData]);

  const getObjectParameter = (obj: any, filterAppliedString: string) => {
    if (obj.healthCheckName) {
      return filterAppliedString === 'labTestName'
        ? obj.healthCheckName
        : filterAppliedString === 'billNo'
        ? obj.billNo
        : filterAppliedString === 'labTestSource'
        ? obj.source === '247self'
          ? 'self'
          : obj.source
        : filterAppliedString === 'packageName' || filterAppliedString === 'parameterName'
        ? null
        : obj[filterAppliedString];
    } else {
      return filterApplied === FILTER_TYPE.PACKAGE && (!obj.packageName || obj.packageName === '-')
        ? obj.labTestName
        : filterAppliedString === 'labTestSource' &&
          (obj[filterAppliedString] === '247self' || obj[filterAppliedString] === 'self')
        ? 'self'
        : obj[filterAppliedString];
    }
  };

  const renderProfileImage = () => {
    return (
      <ProfileImageComponent
        onPressProfileImage={gotoPHRHomeScreen}
        currentPatient={currentPatient}
      />
    );
  };

  const renderHeader = () => {
    return (
      <Header
        title={'TEST REPORTS'}
        leftIcon={'backArrow'}
        rightComponent={renderProfileImage()}
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={gotoPHRHomeScreen}
      />
    );
  };

  const onSearchTextChange = (value: string) => {
    SetIsSearchFocus(true);
    if (isValidSearch(value)) {
      setSearchText(value);
      if (!(value && value.length > 2)) {
        setHealthRecordSearchResults([]);
        return;
      }
      setSearchLoading(true);
      const search = _.debounce(onSearchHealthRecords, 500);
      setSearchQuery((prevSearch: any) => {
        if (prevSearch.cancel) {
          prevSearch.cancel();
        }
        return search;
      });
      search(value);
    }
  };

  const onCancelTextClick = () => {
    if (_searchInputRef.current) {
      setSearchText('');
      SetIsSearchFocus(false);
      setShowSearchBar(false);
      _searchInputRef?.current?.clear();
      setHealthRecordSearchResults([]);
      Keyboard.dismiss();
    }
  };

  const renderSearchBar = () => {
    return (
      <View style={styles.searchBarMainView}>
        <View style={styles.searchBarMainViewStyle}>
          <View style={styles.searchBarViewStyle}>
            <PhrSearchIcon style={{ width: 20, height: 20 }} />
            <TextInput
              placeholder={'Search lab reports'}
              autoCapitalize={'none'}
              autoFocus={searchInputFocus}
              style={styles.textInputStyle}
              selectionColor={theme.colors.TURQUOISE_LIGHT_BLUE}
              numberOfLines={1}
              ref={_searchInputRef}
              onFocus={() => SetIsSearchFocus(true)}
              value={searchText}
              placeholderTextColor={theme.colors.placeholderTextColor}
              underlineColorAndroid={'transparent'}
              onChangeText={(value) => onSearchTextChange(value)}
            />
          </View>
          {isSearchFocus ? (
            <Text style={styles.cancelTextStyle} onPress={onCancelTextClick}>
              {'Cancel'}
            </Text>
          ) : null}
          {searchText?.length > 2 ? null : renderFilterView()}
        </View>
      </View>
    );
  };

  const renderFilterView = () => {
    const testFilterData = ConsultRxFilterArray.map((i) => {
      return { key: i.key, value: i.title };
    });
    return (
      <MaterialMenu
        options={testFilterData}
        selectedText={filterApplied}
        menuContainerStyle={styles.menuContainerStyle}
        itemContainer={{ height: 44.8, marginHorizontal: 12, width: 260 / 2 }}
        itemTextStyle={styles.itemTextStyle}
        firstOptionText={true}
        selectedTextStyle={styles.selectedTextStyle}
        lastContainerStyle={{ borderBottomWidth: 0 }}
        bottomPadding={{ paddingBottom: 10 }}
        onPress={(selectedFilter) => {
          if (selectedFilter.key !== FILTER_TYPE.SORT_BY) {
            setFilterApplied(selectedFilter.key);
          }
        }}
      >
        <View style={{ paddingLeft: 16 }}>
          <Filter style={{ width: 24, height: 24 }} />
        </View>
      </MaterialMenu>
    );
  };

  const renderSearchAndFilterView = () => {
    return (
      <View style={styles.searchFilterViewStyle}>
        <Text style={{ ...theme.viewStyles.text('SB', 23, theme.colors.LIGHT_BLUE, 1, 30) }}>
          {'Test Reports'}
        </Text>
        <View style={styles.searchBarMainView}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setShowSearchBar(true);
              setSearchInputFocus(true);
            }}
            style={{ paddingLeft: 11 }}
          >
            <SearchDarkPhrIcon style={{ width: 17.49, height: 17.49 }} />
          </TouchableOpacity>
          {renderFilterView()}
        </View>
      </View>
    );
  };

  const renderSectionHeader = (section: any) => {
    let sectionTitle =
      filterApplied === FILTER_TYPE.DATE
        ? section.key && moment(new Date(section.key)).format('DD MMM YYYY')
        : section.key === '247self' || section.key === 'self'
        ? string.common.clicnical_document_text
        : section.key === 'APP247'
        ? 'Apollo 24/7'
        : section.key;
    return <Text style={styles.sectionHeaderTitleStyle}>{sectionTitle}</Text>;
  };

  const onHealthCardItemPress = (selectedItem: any) => {
    const eventInputData = removeObjectProperty(selectedItem, 'testResultFiles');
    postCleverTapIfNewSession(
      'Test Reports',
      currentPatient,
      eventInputData,
      phrSession,
      setPhrSession
    );
    props.navigation.navigate(AppRoutes.TestReportViewScreen, {
      data: filterApplied === FILTER_TYPE.PARAMETER_NAME ? selectedItem?.data : selectedItem,
      labResults: true,
    });
  };

  const onDownloadLabTestReports = (clubImages: any) => {
    setShowSpinner(true);
    var imageArray: [] = [];
    clubImages.map((items: any) => {
      if (!!items?.data?.fileUrl) {
        imageArray.push(items?.data?.fileUrl);
      } else {
        client
          .query<getIndividualTestResultPdf, getIndividualTestResultPdfVariables>({
            query: GET_INDIVIDUAL_TEST_RESULT_PDF,
            variables: {
              patientId: currentPatient?.id,
              recordId: items?.id,
              sequence: items?.testSequence,
            },
          })
          .then(({ data }: any) => {
            if (data?.getIndividualTestResultPdf?.url) {
              imageArray.push(data?.getIndividualTestResultPdf?.url);
            }
            setShowSpinner(false);
          })
          .catch((e: any) => {
            setShowSpinner(false);
            currentPatient && handleGraphQlError(e, 'Report is yet not available');
            CommonBugFender('HealthRecordDetails_downloadPDFTestReport', e);
          });
      }
    });

    if (imageArray?.length > 0) {
      setShowSpinner(true);
      client
        .mutate<mergePDFS, mergePDFSVariables>({
          mutation: MERGE_PDF,
          variables: { uhid: currentPatient?.id, fileUrls: imageArray },
          fetchPolicy: 'no-cache',
        })
        .then((data: any) => {
          setShowSpinner(false);
          downloadDocument(data?.data?.mergePDFS?.mergepdfUrl);
        })
        .catch((e) => {
          CommonBugFender('MERGE_PDF', e);
          setShowSpinner(false);
          handleGraphQlError(e);
        });
    }
  };

  const downloadDocument = (url: any) => {
    setShowSpinner!(true);
    const dirs = RNFetchBlob.fs.dirs;
    const fileName: string =
      Platform.OS === 'android'
        ? file_name_text + currentPatient?.uhid + '_' + new Date().getTime()
        : 'TEST_REPORT' + '.pdf';
    const downloadPath =
      Platform.OS === 'ios'
        ? (dirs.DocumentDir || dirs.MainBundleDir) + '/' + (fileName || 'Apollo_TestReport.pdf')
        : dirs.DownloadDir + '/' + (fileName || 'Apollo_TestReport.pdf');
    RNFetchBlob.config({
      fileCache: true,
      path: downloadPath,
      addAndroidDownloads: {
        title: fileName,
        useDownloadManager: true,
        notification: true,
        mediaScannable: true,
        path: downloadPath,
        mime: mimeType(downloadPath),
        description: 'File downloaded by download manager.',
      },
    })
      .fetch('GET', url, {
        //some headers ..
      })
      .then((res) => {
        setShowSpinner!(false);
        Platform.OS === 'ios'
          ? RNFetchBlob.ios.previewDocument(res.path())
          : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
      })
      .catch((err) => {
        setShowSpinner!(false);
        CommonBugFender('REAL_TIME_TEST_REPORT', err);
        handleGraphQlError(err);
      })
      .finally(() => {
        setShowSpinner && setShowSpinner!(false);
      });
  };

  const onPressDeletePrismMedicalRecords = (selectedItem: any) => {
    if (filterApplied === FILTER_TYPE.PARAMETER_NAME) {
      setShowSpinner(true);
      let resultParams = selectedItem?.data?.labTestResults?.filter(
        (result: any) => selectedItem?.paramObject !== result
      );
      if (resultParams?.length > 0) {
        resultParams = resultParams.map((labParam: any) => {
          const splitRange = labParam?.range?.split('-');
          return {
            parameterName: labParam?.parameterName || '',
            result: parseFloat((labParam?.result || 0).toString()),
            unit: labParam?.unit || '',
            maximum: parseFloat((splitRange[1] || 0).toString()),
            minimum: parseFloat((splitRange[0] || 0).toString()),
          };
        });
      }
      const inputData: AddLabTestRecordInput = {
        id: selectedItem?.data?.id || null,
        patientId: currentPatient?.id || '',
        labTestName: selectedItem?.data?.labTestName || '',
        labTestDate:
          selectedItem?.data?.date !== ''
            ? moment(selectedItem?.data?.date).format('YYYY-MM-DD')
            : '',
        recordType: MedicalRecordType.TEST_REPORT,
        referringDoctor: selectedItem?.data?.labTestRefferedBy || '',
        observations: '',
        additionalNotes: selectedItem?.data?.additionalNotes || '',
        labTestResults: resultParams || [],
        testResultFiles: [],
      };
      client
        .mutate<addPatientLabTestRecord>({
          mutation: ADD_PATIENT_LAB_TEST_RECORD,
          variables: {
            AddLabTestRecordInput: inputData,
          },
        })
        .then(({ data }) => {
          setShowSpinner(false);
          const status = g(data, 'addPatientLabTestRecord', 'status');
          if (status) {
            getLatestLabAndHealthCheckRecords();
            const eventInputData = removeObjectProperty(selectedItem, 'testResultFiles');
            postCleverTapPHR(
              currentPatient,
              CleverTapEventName.PHR_DELETE_TEST_REPORT,
              'Test Report',
              eventInputData
            );
          } else {
            setShowSpinner(false);
          }
        })
        .catch((e) => {
          CommonBugFender('TestReportScreen_DeleteParameter_ADD_PATIENT_LAB_TEST_RECORD', e);
          setShowSpinner(false);
          currentPatient && handleGraphQlError(e);
        });
    } else {
      setShowSpinner(true);
      deletePatientPrismMedicalRecords(
        client,
        selectedItem?.id,
        currentPatient?.id || '',
        selectedItem?.labTestName ? MedicalRecordType.TEST_REPORT : MedicalRecordType.HEALTHCHECK
      )
        .then((status) => {
          if (status) {
            getLatestLabAndHealthCheckRecords();
          } else {
            setShowSpinner(false);
          }
        })
        .catch((error) => {
          CommonBugFender('TestReportScreen_deletePatientPrismMedicalRecords', error);
          setShowSpinner(false);
          currentPatient && handleGraphQlError(error);
        });
    }
  };

  const onPressEditPrismMedicalRecords = (selectedItem: any) => {
    setCallApi(false);
    props.navigation.navigate(AppRoutes.AddRecord, {
      navigatedFrom: 'Test Reports',
      recordType: MedicalRecordType.TEST_REPORT,
      selectedRecordID:
        filterApplied === FILTER_TYPE.PARAMETER_NAME ? selectedItem?.data?.id : selectedItem?.id,
      selectedRecord:
        filterApplied === FILTER_TYPE.PARAMETER_NAME ? selectedItem?.data : selectedItem,
      onRecordAdded: onRecordAdded,
    });
  };

  const renderTestReportsItems = (item: any, index: number) => {
    const getPresctionDate = (date: string) => {
      let prev_date = new Date();
      prev_date.setDate(prev_date.getDate() - 1);
      if (moment(new Date()).format('DD/MM/YYYY') === moment(new Date(date)).format('DD/MM/YYYY')) {
        return 'Today';
      } else if (
        moment(prev_date).format('DD/MM/YYYY') === moment(new Date(date)).format('DD/MM/YYYY')
      ) {
        return 'Yesterday';
      }
      return moment(new Date(date)).format('DD MMM');
    };

    if (item?.key === 'null') {
      return item?.data?.map((dataItem: any, index: number) => {
        const prescriptionName =
          filterApplied &&
          filterApplied === FILTER_TYPE.PACKAGE &&
          dataItem?.data?.packageName?.length > 0 &&
          dataItem?.data?.packageName !== '-'
            ? dataItem?.data?.packageName
            : filterApplied === FILTER_TYPE.PARAMETER_NAME && dataItem?.data?.labTestName
            ? `${
                dataItem?.paramObject
                  ? `${dataItem?.paramObject.range || '-'} ${dataItem?.paramObject.unit || ''}`
                  : '-'
              }`
            : dataItem?.data?.labTestName || dataItem?.data?.healthCheckName;
        const doctorName =
          filterApplied === FILTER_TYPE.PARAMETER_NAME && dataItem?.data?.labTestName
            ? dataItem?.data?.labTestName
            : dataItem?.data?.labTestRefferedBy
            ? 'with Dr. ' + dataItem?.data?.labTestRefferedBy
            : '';
        const dateText = getPresctionDate(dataItem?.data?.date);
        const soureName =
          getSourceName(
            dataItem?.data?.labTestSource,
            dataItem?.data?.siteDisplayName,
            dataItem?.data?.source
          ) || '-';
        const selfUpload = true;
        const showEditDeleteOption =
          soureName === string.common.clicnical_document_text || soureName === '-' ? true : false;
        const hideEditDeleteOption =
          dataItem?.data?.healthCheckName && showEditDeleteOption ? true : false;
        return (
          <HealthRecordCard
            item={filterApplied === FILTER_TYPE.PARAMETER_NAME ? dataItem : dataItem?.data}
            index={index}
            editDeleteData={editDeleteData(MedicalRecordType.TEST_REPORT)}
            showUpdateDeleteOption={showEditDeleteOption}
            hideUpdateDeleteOption={hideEditDeleteOption}
            onHealthCardPress={(selectedItem) => onHealthCardItemPress(selectedItem)}
            onDeletePress={(selectedItem) => onPressDeletePrismMedicalRecords(selectedItem)}
            onEditPress={(selectedItem) => onPressEditPrismMedicalRecords(selectedItem)}
            prescriptionName={prescriptionName}
            doctorName={doctorName}
            dateText={dateText}
            selfUpload={selfUpload}
            sourceName={soureName || ''}
            deleteRecordText={'test results'}
          />
        );
      });
    } else if (item.data.billNo === null || !!item.data.billNo) {
      const prescriptionName =
        filterApplied &&
        filterApplied === FILTER_TYPE.PACKAGE &&
        item.data?.packageName?.length > 0 &&
        item?.data?.packageName !== '-'
          ? item?.data?.packageName
          : filterApplied === FILTER_TYPE.PARAMETER_NAME && item?.data?.labTestName
          ? `${
              item?.paramObject
                ? `${item?.paramObject.range || '-'} ${item?.paramObject.unit || ''}`
                : '-'
            }`
          : item?.data?.labTestName || item?.data?.healthCheckName;
      const doctorName =
        filterApplied === FILTER_TYPE.PARAMETER_NAME && item?.data?.labTestName
          ? item?.data?.labTestName
          : item?.data?.labTestRefferedBy
          ? 'with Dr. ' + item?.data?.labTestRefferedBy
          : '';
      const dateText = getPresctionDate(item?.data?.date);
      const soureName =
        getSourceName(item?.data?.labTestSource, item?.data?.siteDisplayName, item?.data?.source) ||
        '-';
      const selfUpload = true;
      const showEditDeleteOption =
        soureName === string.common.clicnical_document_text || soureName === '-' ? true : false;
      const hideEditDeleteOption =
        item?.data?.healthCheckName && showEditDeleteOption ? true : false;
      return (
        <HealthRecordCard
          item={filterApplied === FILTER_TYPE.PARAMETER_NAME ? item : item?.data}
          index={index}
          editDeleteData={editDeleteData(MedicalRecordType.TEST_REPORT)}
          showUpdateDeleteOption={showEditDeleteOption}
          hideUpdateDeleteOption={hideEditDeleteOption}
          onHealthCardPress={(selectedItem) => onHealthCardItemPress(selectedItem)}
          onDeletePress={(selectedItem) => onPressDeletePrismMedicalRecords(selectedItem)}
          onEditPress={(selectedItem) => onPressEditPrismMedicalRecords(selectedItem)}
          prescriptionName={prescriptionName}
          doctorName={doctorName}
          dateText={dateText}
          selfUpload={selfUpload}
          sourceName={soureName || ''}
          deleteRecordText={'test results'}
        />
      );
    } else {
      return (
        <BillRecordCard
          onHealthCardPress={(selectedItem) => onHealthCardItemPress(selectedItem)}
          onDownloadLabTestReports={(testReportsItem) => onDownloadLabTestReports(testReportsItem)}
          item={item?.data}
          testReportItems={item?.data}
        />
      );
    }
  };

  const renderTestReports = () => {
    return (
      <SectionList
        bounces={false}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 12, paddingHorizontal: 20 }}
        sections={localTestReportsData || []}
        renderItem={({ item, index }) => renderTestReportsItems(item, index)}
        ListEmptyComponent={renderEmptyView()}
        renderSectionHeader={({ section }) => renderSectionHeader(section)}
      />
    );
  };

  const renderSearchLoader = () => {
    return (
      <View style={styles.loaderViewStyle}>
        <Spinner style={styles.loaderStyle} />
      </View>
    );
  };

  const renderEmptyView = () => {
    if (!!testReportMainData) {
      return null;
    } else {
      return <PhrNoDataComponent />;
    }
  };

  const searchListHeaderView = () => {
    const search_result_text =
      healthRecordSearchResults?.length === 1
        ? `${healthRecordSearchResults?.length} search result for \‘${searchText}\’`
        : `${healthRecordSearchResults?.length} search results for \‘${searchText}\’`;
    return (
      <View style={styles.searchListHeaderViewStyle}>
        <Text style={styles.searchListHeaderTextStyle}>{search_result_text}</Text>
      </View>
    );
  };

  const onClickSearchHealthCard = (item: any) => {
    const { healthrecordId } = item?.value;
    props.navigation.navigate(AppRoutes.TestReportViewScreen, {
      healthrecordId: healthrecordId,
      healthRecordType: MedicalRecordType.TEST_REPORT,
      labResults: true,
    });
  };

  const renderHealthRecordSearchItem = (item: any, index: number) => {
    const healthCardTopView = () => {
      return (
        <View style={styles.healthRecordTypeViewStyle}>
          <LabTestPhrSearchIcon style={{ width: 14, height: 15 }} />
          <Text style={styles.healthRecordTypeTextStyle} numberOfLines={1}>
            {'Test Reports'}
          </Text>
        </View>
      );
    };
    const dateText = `${moment(item?.value?.date).format('DD MMM YYYY')} - `;
    const healthMoreText = getPhrHighlightText(item?.value?.highlight || '');
    return (
      <SearchHealthRecordCard
        dateText={dateText}
        healthRecordTitle={item?.value?.title}
        healthRecordMoreText={healthMoreText}
        searchHealthCardTopView={healthCardTopView()}
        item={item}
        index={index}
        onSearchHealthCardPress={(item) => onClickSearchHealthCard(item)}
      />
    );
  };

  const renderHealthRecordSearchResults = () => {
    return searchLoading ? (
      renderSearchLoader()
    ) : (
      <FlatList
        keyExtractor={(_, index) => `${index}`}
        bounces={false}
        data={healthRecordSearchResults}
        ListEmptyComponent={
          <PhrNoDataComponent mainViewStyle={styles.phrNodataMainViewStyle} phrSearchList />
        }
        ListHeaderComponent={searchListHeaderView}
        renderItem={({ item, index }) => renderHealthRecordSearchItem(item, index)}
      />
    );
  };

  const onRecordAdded = () => {
    setCallApi(true);
  };

  const renderAddButton = () => {
    return (
      <StickyBottomComponent style={styles.stickyBottomComponentStyle}>
        <Button
          style={{ width: '100%' }}
          title={string.common.addTestReportText}
          onPress={() => {
            setCallApi(false);
            const eventAttributes: CleverTapEvents[CleverTapEventName.ADD_RECORD] = {
              Source: 'Test Report',
            };
            postWebEngageEvent(CleverTapEventName.ADD_RECORD, eventAttributes);
            postCleverTapEvent(CleverTapEventName.ADD_RECORD, eventAttributes);
            props.navigation.navigate(AppRoutes.AddRecord, {
              navigatedFrom: 'Test Reports',
              recordType: MedicalRecordType.TEST_REPORT,
              onRecordAdded: onRecordAdded,
            });
          }}
        />
      </StickyBottomComponent>
    );
  };

  const renderTestReportsMainView = () => {
    return (
      <>
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {renderTestReports()}
        </ScrollView>
        {renderAddButton()}
      </>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {showSpinner && <Spinner />}
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {testReportMainData?.length > 0
          ? showSearchBar
            ? renderSearchBar()
            : renderSearchAndFilterView()
          : null}
        <Text style={styles.doctorTestReportPHRTextStyle}>
          {string.common.doctorConsultPHRText}
        </Text>
        {apiError ? (
          <PhrNoDataComponent noDataText={string.common.phr_api_error_text} phrErrorIcon />
        ) : null}
        {searchText?.length > 2 ? renderHealthRecordSearchResults() : renderTestReportsMainView()}
      </SafeAreaView>
    </View>
  );
};
