import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Check, PrescriptionIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { GET_MEDICAL_RECORD } from '@aph/mobile-patients/src/graphql/profiles';
import {
  getPatientMedicalRecords,
  getPatientMedicalRecordsVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientMedicalRecords';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-apollo-hooks';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList, NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({});

export interface SelectPrescriptionProps extends NavigationScreenProps {}
export const SelectPrescription: React.FC<SelectPrescriptionProps> = (props) => {
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();

  useEffect(() => {
    if (!currentPatient) {
      console.log('No current patients available');
      getPatientApiCall();
    }
  }, [currentPatient]);

  const { data, loading, error } = useQuery<
    getPatientMedicalRecords,
    getPatientMedicalRecordsVariables
  >(GET_MEDICAL_RECORD, {
    variables: {
      patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
    },
    fetchPolicy: 'no-cache',
  });
  const ePrescriptions = g(data, 'getPatientMedicalRecords', 'medicalRecords') || [];
  console.log({ ePrescriptions });

  const renderRow = (rowData: typeof ePrescriptions[0], rowID: number) => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={() => {}}>
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            padding: 16,
            paddingLeft: 11,
            paddingBottom: 8,
            marginHorizontal: 20,
            backgroundColor: theme.colors.WHITE,
            marginTop: rowID === 0 ? 20 : 4,
            marginBottom: ePrescriptions.length === rowID + 1 ? 20 : 4,
          }}
          key={rowID}
        >
          <View style={{ flexDirection: 'row' }}>
            <PrescriptionIcon />
            <Text
              style={{
                color: theme.colors.LIGHT_BLUE,
                lineHeight: 24,
                textAlign: 'left',
                ...theme.fonts.IBMPlexSansMedium(16),
                paddingLeft: 16,
              }}
            >
              {rowData!.referringDoctor}
            </Text>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Check />
            </View>
          </View>
          <View style={{ paddingLeft: 43 }}>
            <View style={{ flexDirection: 'row', paddingTop: 5, paddingBottom: 3.5 }}>
              <Text
                style={{
                  color: theme.colors.TEXT_LIGHT_BLUE,
                  textAlign: 'left',
                  ...theme.fonts.IBMPlexSansMedium(14),
                  lineHeight: 20,
                  letterSpacing: 0.04,
                }}
              >
                {rowData!.testDate}
              </Text>
              <View
                style={{
                  borderRightWidth: 0.5,
                  borderBottomColor: 'rgba(2, 71, 91, 0.3)',
                  paddingLeft: 24,
                }}
              />
              <Text
                style={{
                  paddingLeft: 19,
                  color: theme.colors.TEXT_LIGHT_BLUE,
                  textAlign: 'left',
                  ...theme.fonts.IBMPlexSansMedium(14),
                  lineHeight: 20,
                  letterSpacing: 0.04,
                }}
              >
                {(currentPatient && currentPatient.firstName) || ''}
              </Text>
            </View>
            <View
              style={{
                borderBottomWidth: 0.5,
                borderBottomColor: 'rgba(2, 71, 91, 0.3)',
              }}
            />
            <Text
              style={{
                marginTop: 7.5,
                color: theme.colors.SKY_BLUE,
                textAlign: 'left',
                ...theme.fonts.IBMPlexSansMedium(12),
              }}
            >
              {rowData!.medicalRecordParameters}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View
      style={{
        ...theme.viewStyles.container,
      }}
    >
      <SafeAreaView
        style={{
          backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
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
        <FlatList
          bounces={false}
          data={ePrescriptions}
          onEndReachedThreshold={0.5}
          renderItem={({ item, index }) => renderRow(item, index)}
          keyExtractor={(_, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
        />
        <View style={{ height: 80 }} />
      </SafeAreaView>
      <StickyBottomComponent defaultBG>
        <Button title={'UPLOAD'} onPress={() => {}} style={{ marginHorizontal: 60, flex: 1 }} />
      </StickyBottomComponent>
      {(loading || showSpinner) && <Spinner />}
    </View>
  );
};
