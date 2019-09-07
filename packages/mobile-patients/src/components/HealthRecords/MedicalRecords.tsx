import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { AddFileIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useApolloClient } from 'react-apollo-hooks';
import {
  getPatientMedicalRecords,
  getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords,
} from '@aph/mobile-patients/src/graphql/types/getPatientMedicalRecords';
import { GET_MEDICAL_RECORD } from '@aph/mobile-patients/src/graphql/profiles';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { HealthMedicineCard } from '@aph/mobile-patients/src/components/HealthRecords/HealthMedicineCard';

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
        if (records !== medicalRecords) {
          setmedicalRecords(records);
        }
      })
      .catch((error) => {
        console.log('Error occured', { error });
      });
  }, [currentPatient, client, medicalRecords]);

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
