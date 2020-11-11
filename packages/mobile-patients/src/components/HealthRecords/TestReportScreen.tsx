import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, SectionList } from 'react-native';
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
import { MedicalRecordType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  g,
  postWebEngageEvent,
  initialSortByDays,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import moment from 'moment';
import _ from 'lodash';

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
    ...theme.viewStyles.text('SB', 18, '#02475B', 1, 23.4),
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

export enum EDIT_DELETE_TYPE {
  EDIT = 'Edit Details',
  DELETE = 'Delete Data',
}

type FilterArray = {
  key: FILTER_TYPE;
  title: string;
};

type EditDeleteArray = {
  key: EDIT_DELETE_TYPE;
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

const ConsultRxEditDeleteArray: EditDeleteArray[] = [
  { key: EDIT_DELETE_TYPE.EDIT, title: EDIT_DELETE_TYPE.EDIT },
  { key: EDIT_DELETE_TYPE.DELETE, title: EDIT_DELETE_TYPE.DELETE },
];

export interface TestReportScreenProps
  extends NavigationScreenProps<{
    testReportsData: any;
    onPressBack: () => void;
  }> {}

export const TestReportScreen: React.FC<TestReportScreenProps> = (props) => {
  const testReportsData = props.navigation?.getParam('testReportsData') || [];
  const { currentPatient } = useAllCurrentPatients();
  const [filterApplied, setFilterApplied] = useState<FILTER_TYPE | string>('');
  const [editDeleteOption, setEditDeleteOption] = useState<EDIT_DELETE_TYPE | string>('');
  const [localTestReportsData, setLocalTestReportsData] = useState<Array<{
    key: string;
    data: any[];
  }> | null>(null);

  const gotoPHRHomeScreen = () => {
    props.navigation.state.params?.onPressBack();
    props.navigation.goBack();
  };

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
        filteredData.forEach((dataObject: any) => {
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
  }, [filterApplied, testReportsData]);

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
    return (
      testReportsData &&
      testReportsData.sort(({ data: data1 }, { data: data2 }) => {
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
            ? moment(data2.date)
                .toDate()
                .getTime()
            : type === FILTER_TYPE.TEST_NAME
            ? _.lowerCase(data2.labTestName || data2.healthCheckName)
            : type === FILTER_TYPE.SOURCE
            ? _.lowerCase(data2?.labTestSource || data2?.source)
            : _.lowerCase(data2.packageName);
        if (type === FILTER_TYPE.DATE || !type) {
          return filteredData1 > filteredData2 ? -1 : filteredData1 < filteredData2 ? 1 : 0;
        }
        return filteredData2 > filteredData1 ? -1 : filteredData2 < filteredData1 ? 1 : 0;
      })
    );
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
        <Text style={{ ...theme.viewStyles.text('SB', 23, '#02475B', 1, 30) }}>
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
            <Filter style={{ width: 24, height: 24 }} />
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
        ? 'Clinical Document'
        : section.key === 'APP247'
        ? 'Apollo 24/7'
        : section.key;
    return <Text style={styles.sectionHeaderTitleStyle}>{sectionTitle}</Text>;
  };

  const onHealthCardItemPress = (selectedItem: any) => {
    props.navigation.navigate(AppRoutes.HealthRecordDetails, {
      data: selectedItem,
      labResults: true,
    });
  };

  const renderTestReportsItems = (item: any, index: number) => {
    // For Next Phase
    // const editDeleteData = ConsultRxEditDeleteArray.map((i) => {
    //   return { key: i.key, value: i.title };
    // });
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
    const getSourceName = (
      labTestSource: string,
      siteDisplayName: string,
      healthCheckSource: string
    ) => {
      if (
        labTestSource === 'self' ||
        labTestSource === '247self' ||
        siteDisplayName === 'self' ||
        siteDisplayName === '247self' ||
        healthCheckSource === 'self' ||
        healthCheckSource === '247self'
      ) {
        return 'Clinical Document';
      }
      return siteDisplayName || labTestSource || healthCheckSource;
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
    const soureName = getSourceName(
      item?.data?.labTestSource || '-',
      item?.data?.siteDisplayName || '-',
      item?.data?.source || '-'
    );
    const selfUpload = true;
    return (
      <HealthRecordCard
        item={item?.data}
        index={index}
        onHealthCardPress={(selectedItem) => onHealthCardItemPress(selectedItem)}
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

  const renderAddButton = () => {
    return (
      <StickyBottomComponent style={styles.stickyBottomComponentStyle}>
        <Button
          style={{ width: '100%' }}
          title={`ADD DATA`}
          onPress={() => {
            const eventAttributes: WebEngageEvents[WebEngageEventName.ADD_RECORD] = {
              Source: 'Test Reports',
            };
            postWebEngageEvent(WebEngageEventName.ADD_RECORD, eventAttributes);
            props.navigation.navigate(AppRoutes.AddRecord, {
              navigatedFrom: 'Test Reports',
              recordType: MedicalRecordType.TEST_REPORT,
            });
          }}
        />
      </StickyBottomComponent>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {testReportsData.length > 0 ? renderSearchAndFilterView() : null}
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {renderTestReports()}
        </ScrollView>
        {renderAddButton()}
      </SafeAreaView>
    </View>
  );
};
