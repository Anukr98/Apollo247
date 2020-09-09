import { HealthMedicineCard } from '@aph/mobile-patients/src/components/HealthRecords/HealthMedicineCard';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { AddFileIcon, NoData, Filter } from '@aph/mobile-patients/src/components/ui/Icons';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, FlatList } from 'react-navigation';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizationsNew_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecksNew_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_prescriptions_response,
} from '../../graphql/types/getPatientPrismMedicalRecords';
import { postWebEngageEvent } from '../../helpers/helperFunctions';
import { WebEngageEvents, WebEngageEventName } from '../../helpers/webEngageEvents';

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
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();
  const { healthChecksNewData, hospitalizationsNewData, labResultsData, prescriptionsData } = props;
  const [combination, setCombination] = useState<{ type: string; data: any }[]>();

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

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    //props.onTabCount(props.MedicalRecordData.length);
  }, [currentPatient, client]);

  const renderFilter = () => {
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
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <Filter />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const renderCards = () => {
    return (
      <View>
        {labResultsData &&
        labResultsData.length == 0 &&
        prescriptionsData &&
        prescriptionsData.length == 0 ? (
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
