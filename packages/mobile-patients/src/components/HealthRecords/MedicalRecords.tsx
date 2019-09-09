import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { AddFileIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useApolloClient } from 'react-apollo-hooks';
import {
  getPatientMedicalRecords,
  getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords,
} from '@aph/mobile-patients/src/graphql/types/getPatientMedicalRecords';
import {
  GET_MEDICAL_RECORD,
  DELETE_PATIENT_MEDICAL_RECORD,
} from '@aph/mobile-patients/src/graphql/profiles';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { HealthMedicineCard } from '@aph/mobile-patients/src/components/HealthRecords/HealthMedicineCard';
import {
  deletePatientMedicalRecord,
  deletePatientMedicalRecordVariables,
} from '../../graphql/types/deletePatientMedicalRecord';

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

export interface MedicalRecordsProps extends NavigationScreenProps {}

export const MedicalRecords: React.FC<MedicalRecordsProps> = (props) => {
  const [countTab, setCountTab] = useState<any>();
  const [medicalRecords, setmedicalRecords] = useState<
    (getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords | null)[] | null | undefined
  >([]);

  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();

  useEffect(() => {
    client
      .query<getPatientMedicalRecords>({
        query: GET_MEDICAL_RECORD,
        variables: {
          patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
        },
      })
      .then(({ data }) => {
        const records = g(data, 'getPatientMedicalRecords', 'medicalRecords');
        console.log('getPatientMedicalRecords', data, records);
        setCountTab(data.getPatientMedicalRecords!.medicalRecords!.length);
        if (records !== medicalRecords) {
          setmedicalRecords(records);
        }
      })
      .catch((error) => {
        console.log('Error occured', { error });
      });
  }, [currentPatient, client]);

  // const client = useApolloClient();
  //console.log('DataMedical', props.data.id);
  const renderDeleteMedicalOrder = (MedicaId: string) => {
    client
      .mutate<deletePatientMedicalRecord, deletePatientMedicalRecordVariables>({
        mutation: DELETE_PATIENT_MEDICAL_RECORD,
        variables: { recordId: MedicaId },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        console.log('renderDeleteMedicalOrder', _data);
        console.log('Before', { medicalRecords });
        const newRecords = medicalRecords!.filter((record) => record!.id != MedicaId);
        console.log('After', { newRecords });
        setmedicalRecords(newRecords);
      })
      .catch((e) => {
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        console.log('Error occured while render Delete MedicalOrder', errorMessage, error);
        Alert.alert('Error', errorMessage);
      });
  };

  const renderFilter = () => {
    return (
      <View style={styles.filterViewStyle}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => props.navigation.navigate(AppRoutes.AddRecord)}
        >
          <AddFileIcon />
        </TouchableOpacity>
      </View>
    );
  };

  const renderCards = () => {
    console.log(medicalRecords, 'medicalRecord');

    if (medicalRecords && medicalRecords.length)
      return (
        <View>
          {medicalRecords.map((item) => {
            console.log('item', item);

            if (item)
              return (
                <HealthMedicineCard
                  data={item}
                  onClickCard={() => {
                    props.navigation.navigate(AppRoutes.RecordDetails, { data: item });
                  }}
                  onPressDelete={() => {
                    renderDeleteMedicalOrder(item.id);
                  }}
                />
              );
          })}
        </View>
      );
  };
  return (
    <View>
      {renderFilter()}
      {renderCards()}
    </View>
  );
};
