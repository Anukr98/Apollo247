import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import { SafeAreaView, StyleSheet, View, Alert } from 'react-native';
import { Overlay } from 'react-native-elements';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { GET_MEDICAL_RECORD } from '../../graphql/profiles';
import {
  getPatientMedicalRecords,
  getPatientMedicalRecordsVariables,
  getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords,
} from '../../graphql/types/getPatientMedicalRecords';
import { g } from '../../helpers/helperFunctions';
import { useAllCurrentPatients } from '../../hooks/authHooks';
import { theme } from '../../theme/theme';
import { Button } from '../ui/Button';
import { EPrescriptionCard } from '../ui/EPrescriptionCard';
import { Header } from '../ui/Header';
import { Spinner } from '../ui/Spinner';
import moment from 'moment';

const styles = StyleSheet.create({});

export interface SelectEPrescriptionModalModalProps extends NavigationScreenProps {
  onSubmit: (
    prescriptions: (getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords | null)[]
  ) => void;
  isVisible: boolean;
}

export const SelectEPrescriptionModalModal: React.FC<SelectEPrescriptionModalModalProps> = (
  props
) => {
  const [selectedPrescription, setSelectedPrescription] = useState<{ [key: string]: boolean }>({});
  const { currentPatient } = useAllCurrentPatients();

  useEffect(() => {
    console.log({ selectedPrescription });
  }, [selectedPrescription]);

  const { data, loading, error } = useQuery<
    getPatientMedicalRecords,
    getPatientMedicalRecordsVariables
  >(GET_MEDICAL_RECORD, {
    variables: {
      patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
    },
    fetchPolicy: 'no-cache',
  });
  const ePrescriptions = g(data, 'getPatientMedicalRecords', 'medicalRecords')! || [];
  console.log(JSON.stringify({ ePrescriptions }));

  const renderEPrescription = (
    item: getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords,
    i: number,
    arrayLength: number
  ) => {
    return (
      <EPrescriptionCard
        actionType="selection"
        isSelected={!!selectedPrescription[item.id]}
        date={moment(item.testDate).format('DD MMMM YYYY')}
        doctorName={item.referringDoctor ? `Dr. ${item.referringDoctor}` : ''}
        forPatient={(currentPatient && currentPatient.firstName) || ''}
        medicines={item!.testName || ''}
        style={{
          marginTop: i === 0 ? 20 : 4,
          marginBottom: arrayLength === i + 1 ? 16 : 4,
        }}
        onSelect={(isSelected) => {
          if (!item!.documentURLs) {
            Alert.alert('Alert', 'This prescription has no uploaded documents.');
          } else {
            setSelectedPrescription({
              ...selectedPrescription,
              [item.id]: isSelected,
            });
          }
        }}
      />
    );
  };

  return (
    <Overlay
      overlayStyle={{
        padding: 0,
        margin: 0,
        backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
      }}
      fullScreen
      isVisible={props.isVisible}
    >
      <View style={theme.viewStyles.container}>
        <SafeAreaView
          style={{
            backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
            flex: 1,
          }}
        >
          <Header
            title={'SELECT FROM E-PRESCRIPTIONS'}
            leftIcon="backArrow"
            container={{
              ...theme.viewStyles.cardContainer,
            }}
            onPressLeftIcon={() => props.navigation.goBack()}
          />
          <ScrollView bounces={false}>
            {ePrescriptions.map((item, index, ePrescriptions) => {
              return renderEPrescription(item!, index, ePrescriptions.length);
            })}
          </ScrollView>
          {/* <FlatList
            bounces={false}
            data={ePrescriptions}
            renderItem={({ item, index }) =>
              renderEPrescription(item!, index, ePrescriptions.length)
            }
            keyExtractor={(_, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
          /> */}
          <View style={{ justifyContent: 'center', alignItems: 'center', marginHorizontal: 60 }}>
            <Button
              title={'UPLOAD'}
              onPress={() => {
                props.onSubmit(ePrescriptions.filter((item) => selectedPrescription[item!.id]));
              }}
              style={{ marginHorizontal: 60, marginVertical: 20 }}
            />
          </View>
        </SafeAreaView>
        {loading && <Spinner />}
      </View>
    </Overlay>
  );
};
