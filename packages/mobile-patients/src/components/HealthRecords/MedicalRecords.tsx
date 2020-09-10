import { HealthMedicineCard } from '@aph/mobile-patients/src/components/HealthRecords/HealthMedicineCard';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { AddFileIcon, NoData, Filter } from '@aph/mobile-patients/src/components/ui/Icons';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, FlatList } from 'react-navigation';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizationsNew_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecksNew_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_prescriptions_response,
} from '@aph/mobile-patients/src/graphql/types/getPatientPrismMedicalRecords';
import { postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import moment from 'moment';

const styles = StyleSheet.create({
  filterViewStyle: {
    height: 60,
    ...theme.viewStyles.lightSeparatorStyle,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

enum FILTER_TYPE {
  VIEW_BY = 'View By',
  DATE = 'Date',
  TEST = 'Test',
  PACKAGE = 'Package',
}

type FilterArray = {
  key: FILTER_TYPE;
  title: string;
};

const TestFilterArray: FilterArray[] = [
  { key: FILTER_TYPE.VIEW_BY, title: FILTER_TYPE.VIEW_BY },
  { key: FILTER_TYPE.DATE, title: FILTER_TYPE.DATE },
  { key: FILTER_TYPE.TEST, title: FILTER_TYPE.TEST },
  { key: FILTER_TYPE.PACKAGE, title: FILTER_TYPE.PACKAGE },
];

export interface MedicalRecordsProps extends NavigationScreenProps {
  healthChecksNewData?:
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecksNew_response | null)[]
    | null
    | undefined;
  hospitalizationsNewData?:
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizationsNew_response | null)[]
    | null
    | undefined;
  labResultsData?:
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response | null)[]
    | null
    | undefined;
  prescriptionsData?:
    | (getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_prescriptions_response | null)[]
    | null
    | undefined;
}

export const MedicalRecords: React.FC<MedicalRecordsProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();
  const { healthChecksNewData, hospitalizationsNewData, labResultsData, prescriptionsData } = props;
  const [combination, setCombination] = useState<{ type: string; data: any }[]>();
  const [filterApplied, setFilterApplied] = useState<FILTER_TYPE | string>(FILTER_TYPE.DATE);
  const [listRefersh, setListRefersh] = useState<boolean>(false);

  useEffect(() => {
    const mergeArray: { type: string; data: any }[] = [];
    console.log('combination before', mergeArray);
    labResultsData?.forEach((item) => {
      mergeArray.push({ type: 'lab', data: item });
    });
    healthChecksNewData?.forEach((item) => {
      mergeArray.push({ type: 'healthCheck', data: item });
    });
    hospitalizationsNewData?.forEach((item) => {
      mergeArray.push({ type: 'hospitalization', data: item });
    });
    console.log('combination after', mergeArray);
    setCombination(sortByDate(mergeArray));
  }, [labResultsData, healthChecksNewData, hospitalizationsNewData]);

  const sortByDate = (array: { type: string; data: any }[]) => {
    return array.sort(({ data: data1 }, { data: data2 }) => {
      let date1 = new Date(data1.date);
      let date2 = new Date(data2.date);
      return date1 > date2 ? -1 : date1 < date2 ? 1 : 0;
    });
  };

  const sortByTypeRecords = (type: FILTER_TYPE | string) => {
    return (
      combination &&
      combination.sort(({ data: data1 }, { data: data2 }) => {
        const filteredData1 =
          type === FILTER_TYPE.DATE
            ? moment(data1.date)
                .toDate()
                .getTime()
            : type === FILTER_TYPE.TEST
            ? data1.labTestName
            : data1.packageName;
        const filteredData2 =
          type === FILTER_TYPE.DATE
            ? moment(data2.date)
                .toDate()
                .getTime()
            : type === FILTER_TYPE.TEST
            ? data2.labTestName
            : data2.packageName;
        if (type === FILTER_TYPE.DATE) {
          return filteredData1 > filteredData2 ? -1 : filteredData1 < filteredData2 ? 1 : 0;
        }
        return filteredData2 > filteredData1 ? -1 : filteredData2 < filteredData1 ? 1 : 0;
      })
    );
  };

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    const filteredData = sortByTypeRecords(filterApplied);
    if (filteredData) {
      setCombination(filteredData);
      setListRefersh(!listRefersh);
    }
  }, [filterApplied]);

  const renderFilter = () => {
    const testFilterData = TestFilterArray.map((i) => {
      return { key: i.key, value: i.title };
    });
    return (
      <View style={styles.filterViewStyle}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() =>
            props.navigation.navigate(AppRoutes.AddRecord, {
              navigatedFrom: 'Medical Records',
            })
          }
        >
          <AddFileIcon />
        </TouchableOpacity>
        {labResultsData && labResultsData.length > 0 ? (
          <MaterialMenu
            options={testFilterData}
            selectedText={filterApplied}
            menuContainerStyle={{
              alignItems: 'flex-end',
              marginTop: 25,
            }}
            itemContainer={{ height: 44.8, marginHorizontal: 12, width: 260 / 2 }}
            itemTextStyle={{
              ...theme.viewStyles.text('M', 16, '#01475b'),
              paddingHorizontal: 0,
            }}
            firstOptionText={true}
            selectedTextStyle={{
              ...theme.viewStyles.text('M', 16, '#00b38e'),
              alignSelf: 'flex-start',
            }}
            bottomPadding={{ paddingBottom: 20 }}
            onPress={(selectedFilter) => {
              if (selectedFilter.key !== FILTER_TYPE.VIEW_BY) {
                console.log('selectedFilter', selectedFilter);
                setFilterApplied(selectedFilter.key);
              }
            }}
          >
            <Filter />
          </MaterialMenu>
        ) : null}
      </View>
    );
  };

  const renderCards = () => {
    return (
      <View>
        {(labResultsData && labResultsData.length == 0) ||
        (healthChecksNewData && healthChecksNewData.length == 0) ||
        (hospitalizationsNewData && hospitalizationsNewData.length == 0) ? (
          <View style={{ justifyContent: 'center', flexDirection: 'column' }}>
            <View
              style={{
                marginTop: 38,
                height: 60,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 25,
              }}
            >
              <NoData />
            </View>
            <Text
              style={{
                ...theme.fonts.IBMPlexSansMedium(12),
                color: '#02475b',
                marginBottom: 25,
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              You don’t have any records with us right now. {'\n'}Add a record to keep everything
              handy in one place!
            </Text>
            <View style={{ marginLeft: 60, marginRight: 60, marginBottom: 20 }}>
              <Button
                title="ADD RECORD"
                onPress={() => {
                  const eventAttributes: WebEngageEvents[WebEngageEventName.ADD_RECORD] = {
                    Source: 'Medical Records',
                  };
                  postWebEngageEvent(WebEngageEventName.ADD_RECORD, eventAttributes);
                  props.navigation.navigate(AppRoutes.AddRecord, {
                    navigatedFrom: 'Medical Records',
                  });
                }}
              />
            </View>
          </View>
        ) : (
          <View>
            <FlatList
              bounces={false}
              data={combination || []}
              removeClippedSubviews={false}
              extraData={listRefersh}
              renderItem={({ item, index }) => {
                let data;
                if (item.type === 'lab') {
                  data = { datalab: item.data, disableDelete: true };
                } else if (item.type === 'prescription') {
                  data = { dataprescription: item.data, disableDelete: true };
                } else if (item.type === 'healthCheck') {
                  data = { datahealthcheck: item.data, disableDelete: true };
                } else if (item.type === 'hospitalization') {
                  data = { datahospitalization: item.data, disableDelete: true };
                }
                return (
                  <HealthMedicineCard
                    {...data}
                    onClickCard={() => {
                      props.navigation.navigate(AppRoutes.HealthRecordDetails, {
                        data: item.data,
                        healthCheck: item.type === 'healthCheck' ? true : false,
                        hospitalization: item.type === 'hospitalization' ? true : false,
                      });
                    }}
                    disableDelete={true}
                  />
                );
              }}
            />
          </View>
        )}
      </View>
    );
  };
  return (
    <View>
      {((labResultsData && labResultsData?.length > 0) ||
        (prescriptionsData && prescriptionsData.length > 0) ||
        (healthChecksNewData && healthChecksNewData.length > 0) ||
        (hospitalizationsNewData && hospitalizationsNewData.length > 0)) &&
        renderFilter()}
      {renderCards()}
    </View>
  );
};
