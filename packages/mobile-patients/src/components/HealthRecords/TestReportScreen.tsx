import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  SectionList,
  BackHandler,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Filter } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { HealthRecordCard } from '@aph/mobile-patients/src/components/HealthRecords/Components/HealthRecordCard';
import { PhrNoDataComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/PhrNoDataComponent';
import { ProfileImageComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/ProfileImageComponent';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  MedicalRecordType,
  AddLabTestRecordInput,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { addPatientLabTestRecord } from '@aph/mobile-patients/src/graphql/types/addPatientLabTestRecord';
import { ADD_PATIENT_LAB_TEST_RECORD } from '@aph/mobile-patients/src/graphql/profiles';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  g,
  postWebEngageEvent,
  initialSortByDays,
  editDeleteData,
  getSourceName,
  handleGraphQlError,
  postWebEngagePHR,
  phrSortByDate,
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
});

export enum FILTER_TYPE {
  SORT_BY = 'Sort by',
  TEST_NAME = 'Test Name',
  DATE = 'Date',
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

  const gotoPHRHomeScreen = () => {
    if (!callApi && !callPhrMainApi) {
      props.navigation.state.params?.onPressBack();
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
    }
  }, [testReportsData]);

  const getLatestLabAndHealthCheckRecords = () => {
    setShowSpinner(true);
    getPatientPrismMedicalRecordsApi(client, currentPatient?.id)
      .then((data: any) => {
        const labResultsData = g(data, 'getPatientPrismMedicalRecords', 'labResults', 'response');
        const healthChecksNewData = g(
          data,
          'getPatientPrismMedicalRecords',
          'healthChecksNew',
          'response'
        );
        let mergeArray: { type: string; data: any }[] = [];
        labResultsData?.forEach((c) => {
          mergeArray.push({ type: 'testReports', data: c });
        });
        healthChecksNewData?.forEach((c) => {
          mergeArray.push({ type: 'healthCheck', data: c });
        });
        setTestReportMainData(phrSortByDate(mergeArray));
        setShowSpinner(false);
        setCallPhrMainApi(true);
      })
      .catch((error) => {
        setShowSpinner(false);
        console.log('error getPatientPrismMedicalRecordsApi', error);
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

  useEffect(() => {
    const filteredData = sortByTypeRecords(filterApplied);
    if (filteredData) {
      let finalData: { key: string; data: any[] }[] = [];
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
        filteredData?.forEach((dataObject: any) => {
          const dataObjectArray: any[] = [];
          if (dataObject?.data?.labTestName && filterApplied === FILTER_TYPE.PARAMETER_NAME) {
            const labParametersLength = dataObject?.data?.labTestResults?.length;
            for (let i = 0; i < labParametersLength; i++) {
              const dateExistsAt = finalData.findIndex((data: { key: string; data: any[] }) => {
                const foundObjectIndex = dataObject?.data?.labTestResults?.findIndex(
                  (parameterObject: any) => parameterObject?.parameterName === data.key
                );
                return (
                  foundObjectIndex > -1 &&
                  data.key === dataObject?.data?.labTestResults[foundObjectIndex]?.parameterName
                );
              });
              const keyValue = dataObject?.data?.labTestResults[i]?.parameterName;
              if (keyValue) {
                const modifiedData = {
                  ...dataObject,
                  paramObject: dataObject?.data?.labTestResults[i],
                };
                if (dateExistsAt === -1 || finalData.length === 0) {
                  dataObjectArray.push(modifiedData);
                  const obj = {
                    key: keyValue,
                    data: dataObjectArray,
                  };
                  finalData.push(obj);
                } else if (dateExistsAt > -1) {
                  const array = finalData[dateExistsAt].data;
                  array.push(modifiedData);
                  finalData[dateExistsAt].data = array;
                }
              }
            }
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
      } else {
        // render when no filter is applied
        finalData = initialSortByDays('lab-results', filteredData, finalData);
      }
      setLocalTestReportsData(finalData);
    }
  }, [filterApplied, testReportMainData]);

  const getObjectParameter = (obj: any, filterAppliedString: string) => {
    if (obj.healthCheckName) {
      return filterAppliedString === 'labTestName'
        ? obj.healthCheckName
        : filterAppliedString === 'labTestSource'
        ? obj.source
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

  const sortByTypeRecords = (type: FILTER_TYPE | string) => {
    return testReportMainData?.sort(({ data: data1 }, { data: data2 }) => {
      const filteredData1 =
        type === FILTER_TYPE.DATE
          ? moment(data1?.date)
              .toDate()
              .getTime()
          : type === FILTER_TYPE.TEST_NAME
          ? _.lowerCase(data1?.labTestName || data1?.healthCheckName)
          : type === FILTER_TYPE.SOURCE
          ? _.lowerCase(data1?.labTestSource || data1?.source)
          : _.lowerCase(data1?.packageName);
      const filteredData2 =
        type === FILTER_TYPE.DATE
          ? moment(data2?.date)
              .toDate()
              .getTime()
          : type === FILTER_TYPE.TEST_NAME
          ? _.lowerCase(data2?.labTestName || data2?.healthCheckName)
          : type === FILTER_TYPE.SOURCE
          ? _.lowerCase(data2?.labTestSource || data2?.source)
          : _.lowerCase(data2?.packageName);
      if (type === FILTER_TYPE.DATE || !type) {
        return filteredData1 > filteredData2 ? -1 : filteredData1 < filteredData2 ? 1 : 0;
      }
      return filteredData2 > filteredData1 ? -1 : filteredData2 < filteredData1 ? 1 : 0;
    });
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

  const renderSearchAndFilterView = () => {
    const testFilterData = ConsultRxFilterArray.map((i) => {
      return { key: i.key, value: i.title };
    });
    return (
      <View style={styles.searchFilterViewStyle}>
        <Text style={{ ...theme.viewStyles.text('SB', 23, theme.colors.LIGHT_BLUE, 1, 30) }}>
          {'Test Reports'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
    props.navigation.navigate(AppRoutes.HealthRecordDetails, {
      data: filterApplied === FILTER_TYPE.PARAMETER_NAME ? selectedItem?.data : selectedItem,
      labResults: true,
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
            postWebEngagePHR('Lab Test', WebEngageEventName.PHR_ADD_LAB_TESTS);
            getLatestLabAndHealthCheckRecords();
          } else {
            setShowSpinner(false);
          }
        })
        .catch((e) => {
          CommonBugFender('AddRecord_ADD_PATIENT_LAB_TEST_RECORD', e);
          setShowSpinner(false);
          console.log(JSON.stringify(e), 'eeeee');
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
    const prescriptionName =
      filterApplied &&
      filterApplied === FILTER_TYPE.PACKAGE &&
      item?.data?.packageName?.length > 0 &&
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
    const hideEditDeleteOption = item?.data?.healthCheckName && showEditDeleteOption ? true : false;
    return (
      <HealthRecordCard
        item={filterApplied === FILTER_TYPE.PARAMETER_NAME ? item : item?.data}
        index={index}
        editDeleteData={editDeleteData()}
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
      />
    );
  };

  const renderTestReports = () => {
    return (
      <SectionList
        bounces={false}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 12, paddingHorizontal: 20 }}
        sections={localTestReportsData || []}
        renderItem={({ item, index }) => renderTestReportsItems(item, index)}
        ListEmptyComponent={<PhrNoDataComponent />}
        renderSectionHeader={({ section }) => renderSectionHeader(section)}
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
          title={`ADD DATA`}
          onPress={() => {
            setCallApi(false);
            const eventAttributes: WebEngageEvents[WebEngageEventName.ADD_RECORD] = {
              Source: 'Test Reports',
            };
            postWebEngageEvent(WebEngageEventName.ADD_RECORD, eventAttributes);
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

  return (
    <View style={{ flex: 1 }}>
      {showSpinner && <Spinner />}
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {testReportMainData?.length > 0 ? renderSearchAndFilterView() : null}
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {renderTestReports()}
        </ScrollView>
        {renderAddButton()}
      </SafeAreaView>
    </View>
  );
};
