import moment from 'moment';
import React, { useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import { Alert, SafeAreaView, StyleSheet, View } from 'react-native';
import { Overlay } from 'react-native-elements';
import { ScrollView } from 'react-navigation';
import { GET_MEDICAL_RECORD } from '../../graphql/profiles';
import {
  getPatientPastConsultsAndPrescriptions,
  getPatientPastConsultsAndPrescriptionsVariables,
} from '../../graphql/types/getPatientPastConsultsAndPrescriptions';
import { g } from '../../helpers/helperFunctions';
import { useAllCurrentPatients } from '../../hooks/authHooks';
import { theme } from '../../theme/theme';
import { EPrescription } from '../ShoppingCartProvider';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EPrescriptionCard } from '../ui/EPrescriptionCard';
import { Header } from '../ui/Header';
import { Spinner } from '../ui/Spinner';

const styles = StyleSheet.create({
  noDataCard: {
    height: 'auto',
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'white',
    elevation: 0,
  },
});

export interface SelectEPrescriptionModalProps {
  onSubmit: (prescriptions: EPrescription[]) => void;
  isVisible: boolean;
}

export const SelectEPrescriptionModal: React.FC<SelectEPrescriptionModalProps> = (props) => {
  const [selectedPrescription, setSelectedPrescription] = useState<{ [key: string]: boolean }>({});
  const { currentPatient } = useAllCurrentPatients();

  const { data, loading, error } = useQuery<
    getPatientPastConsultsAndPrescriptions,
    getPatientPastConsultsAndPrescriptionsVariables
  >(GET_MEDICAL_RECORD, {
    variables: {
      consultsAndOrdersInput: {
        patient: currentPatient && currentPatient.id ? currentPatient.id : '',
      },
    },
    fetchPolicy: 'no-cache',
  });
  const ePrescriptions = g(data, 'getPatientPastConsultsAndPrescriptions', 'medicineOrders')! || [];
  const formattedEPrescriptions = ePrescriptions.map(
    (item) =>
      ({
        id: item!.id,
        date: moment(item!.orderDateTime).format('DD MMMM YYYY'),
        uploadedUrl: item!.prescriptionImageUrl,
        doctorName: '', // item.referringDoctor ? `Dr. ${item.referringDoctor}` : ''
        forPatient: (currentPatient && currentPatient.firstName) || '',
        medicines: (item!.medicineOrderLineItems || [])
          .filter((item) => item!.medicineName)
          .join(', '),
      } as EPrescription)
  );

  // const filteredEPrescriptions = ePrescriptions.filter((item) => item!.prescriptionImageUrl);
  console.log(JSON.stringify({ ePrescriptions }));
  // console.log(JSON.stringify({ filteredEPrescriptions }));

  const renderEPrescription = (item: EPrescription, i: number, arrayLength: number) => {
    return (
      <EPrescriptionCard
        actionType="selection"
        isSelected={!!selectedPrescription[item.id]}
        date={item.date}
        doctorName={item.doctorName}
        forPatient={item.forPatient}
        medicines={item.medicines}
        style={{
          marginTop: i === 0 ? 20 : 4,
          marginBottom: arrayLength === i + 1 ? 16 : 4,
        }}
        onSelect={(isSelected) => {
          if (!item.uploadedUrl) {
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

  const renderNoPrescriptions = () => {
    if (!loading && formattedEPrescriptions.length == 0) {
      return (
        <Card
          cardContainer={[styles.noDataCard]}
          heading={'Uh oh! :('}
          description={'No Records Found!'}
          descriptionTextStyle={{ fontSize: 14 }}
          headingTextStyle={{ fontSize: 14 }}
        />
      );
    }
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
            onPressLeftIcon={() => props.onSubmit([])}
          />
          <ScrollView bounces={false}>
            {renderNoPrescriptions()}
            {formattedEPrescriptions.map((item, index, array) => {
              return renderEPrescription(item, index, array.length);
            })}
          </ScrollView>
          <View style={{ justifyContent: 'center', alignItems: 'center', marginHorizontal: 60 }}>
            <Button
              title={'UPLOAD'}
              disabled={
                Object.keys(selectedPrescription).filter((item) => selectedPrescription[item])
                  .length == 0
              }
              onPress={() => {
                props.onSubmit(
                  formattedEPrescriptions.filter((item) => selectedPrescription[item!.id])
                );
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
