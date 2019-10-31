import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-apollo-hooks';
import { Alert, SafeAreaView, StyleSheet, View } from 'react-native';
import { Overlay } from 'react-native-elements';
import { ScrollView } from 'react-navigation';
import { GET_PAST_CONSULTS_PRESCRIPTIONS } from '@aph/mobile-patients/src/graphql/profiles';
import {
  getPatientPastConsultsAndPrescriptions,
  getPatientPastConsultsAndPrescriptionsVariables,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders_medicineOrderLineItems,
} from '@aph/mobile-patients/src/graphql/types/getPatientPastConsultsAndPrescriptions';
import { g, aphConsole } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { EPrescription } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { EPrescriptionCard } from '@aph/mobile-patients/src/components/ui/EPrescriptionCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { CommonLogEvent } from '../../FunctionHelpers/DeviceHelper';

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
  selectedEprescriptionIds?: EPrescription['id'][];
}

export const SelectEPrescriptionModal: React.FC<SelectEPrescriptionModalProps> = (props) => {
  const [selectedPrescription, setSelectedPrescription] = useState<{ [key: string]: boolean }>({});
  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  const { data, loading, error } = useQuery<
    getPatientPastConsultsAndPrescriptions,
    getPatientPastConsultsAndPrescriptionsVariables
  >(GET_PAST_CONSULTS_PRESCRIPTIONS, {
    variables: {
      consultsAndOrdersInput: {
        patient: currentPatient && currentPatient.id ? currentPatient.id : '',
      },
    },
    fetchPolicy: 'no-cache',
  });
  aphConsole.log({ data, loading, error });

  useEffect(() => {
    const pIds = props.selectedEprescriptionIds;
    const selectedPrescr = {} as typeof selectedPrescription;
    if (pIds) {
      pIds!.forEach((id) => {
        selectedPrescr[id] = true;
      });
      setSelectedPrescription(selectedPrescr);
    }
  }, [props.selectedEprescriptionIds]);

  const getMedicines = (
    medicines: (getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders_medicineOrderLineItems | null)[]
  ) =>
    medicines
      .filter((item) => item!.medicineName)
      .map((item) => item!.medicineName)
      .join(', ');

  const ePrescriptions = g(data, 'getPatientPastConsultsAndPrescriptions', 'medicineOrders')! || [];
  const formattedEPrescriptions = ePrescriptions.map(
    (item) =>
      ({
        id: item!.id,
        date: moment(item!.quoteDateTime).format('DD MMM YYYY'),
        uploadedUrl: item!.prescriptionImageUrl,
        doctorName: '', // item.referringDoctor ? `Dr. ${item.referringDoctor}` : ''
        forPatient: (currentPatient && currentPatient.firstName) || '',
        medicines: getMedicines(item!.medicineOrderLineItems! || []),
      } as EPrescription)
  );

  const renderEPrescription = (item: EPrescription, i: number, arrayLength: number) => {
    return (
      <EPrescriptionCard
        key={i}
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
                CommonLogEvent('SELECT_PRESCRIPTION_MODAL', 'Formatted e prescription');
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
