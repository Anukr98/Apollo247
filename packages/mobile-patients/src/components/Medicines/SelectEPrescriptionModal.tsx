import { EPrescription } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { EPrescriptionCard } from '@aph/mobile-patients/src/components/ui/EPrescriptionCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { GET_PAST_CONSULTS_PRESCRIPTIONS } from '@aph/mobile-patients/src/graphql/profiles';
import {
  getPatientPastConsultsAndPrescriptions,
  getPatientPastConsultsAndPrescriptionsVariables,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders_medicineOrderLineItems,
} from '@aph/mobile-patients/src/graphql/types/getPatientPastConsultsAndPrescriptions';
import { DoctorType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { aphConsole, g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import { Alert, SafeAreaView, StyleSheet, View } from 'react-native';
import { Overlay } from 'react-native-elements';
import { ScrollView } from 'react-navigation';

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
  const DATE_FORMAT = 'DD MMM YYYY';

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

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

  const getMedicines = (
    medicines: (getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_medicineOrders_medicineOrderLineItems | null)[]
  ) =>
    medicines
      .filter((item) => item!.medicineName)
      .map((item) => item!.medicineName)
      .join(', ');

  const ePrescriptions = g(data, 'getPatientPastConsultsAndPrescriptions', 'medicineOrders')! || [];
  const ePrescriptionsFromConsults =
    g(data, 'getPatientPastConsultsAndPrescriptions', 'consults')! || [];

  const getCaseSheet = (
    caseSheet: getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet[]
  ) =>
    caseSheet!.find(
      (item) =>
        item!.doctorType == DoctorType.STAR_APOLLO ||
        item!.doctorType == DoctorType.APOLLO ||
        item!.doctorType == DoctorType.PAYROLL
    )!;

  const getBlobUrl = (url: string | null) =>
    url ? `${AppConfig.Configuration.DOCUMENT_BASE_URL}${url}` : '';

  const formattedEPrescriptions = ePrescriptions
    .map(
      (item) =>
        ({
          id: item!.id,
          date: moment(item!.quoteDateTime).format(DATE_FORMAT),
          uploadedUrl: item!.prescriptionImageUrl,
          doctorName: `Meds Rx ${(item!.id && item!.id.substring(0, item!.id.indexOf('-'))) || ''}`, // item.referringDoctor ? `Dr. ${item.referringDoctor}` : ''
          forPatient: (currentPatient && currentPatient.firstName) || '',
          medicines: getMedicines(item!.medicineOrderLineItems! || []),
        } as EPrescription)
    )
    .concat(
      ePrescriptionsFromConsults.map(
        (item) =>
          ({
            id: item!.id,
            date: moment(item!.appointmentDateTime).format(DATE_FORMAT),
            uploadedUrl: getBlobUrl(
              (getCaseSheet(item!.caseSheet as any) || { blobName: '' }).blobName
            ),
            doctorName: item!.doctorInfo ? `Dr. ${item!.doctorInfo.firstName}` : '',
            forPatient: (currentPatient && currentPatient.firstName) || '',
            medicines: (
              (getCaseSheet(item!.caseSheet as any) || { medicinePrescription: [] })
                .medicinePrescription || []
            )
              .map((item) => item!.medicineName)
              .join(', '),
          } as EPrescription)
      )
    )
    .filter((item) => !!item.uploadedUrl)
    .sort(
      (a, b) =>
        moment(b.date, DATE_FORMAT)
          .toDate()
          .getTime() -
        moment(a.date, DATE_FORMAT)
          .toDate()
          .getTime()
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
          setSelectedPrescription({
            ...selectedPrescription,
            [item.id]: isSelected,
          });
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
      onRequestClose={() => props.onSubmit([])}
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
