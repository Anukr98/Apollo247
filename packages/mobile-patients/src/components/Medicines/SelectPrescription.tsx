import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Check, PrescriptionIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList, NavigationScreenProps } from 'react-navigation';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({});

type prescriptions = {
  id: number;
  doctor_name: string;
  date: string;
  patient_name: string;
  disease: string;
};

const Prescriptions: prescriptions[] = [
  {
    id: 1,
    doctor_name: 'Dr. Simran Rai',
    date: '27 July 2019',
    patient_name: 'Preeti',
    disease: 'Cytoplam, Metformin, Insulin, Crocin',
  },
  {
    id: 2,
    doctor_name: 'Dr. Ranjan Reddy',
    date: '25 July 2019',
    patient_name: 'Surj',
    disease: 'Cytoplam, Metformin, Insulin, Crocin',
  },
];

export interface SelectPrescriptionProps extends NavigationScreenProps {}
export const SelectPrescription: React.FC<SelectPrescriptionProps> = (props) => {
  const [showSpinner, setshowSpinner] = useState<boolean>(false);

  const renderRow = (rowData: prescriptions, rowID: number) => {
    return (
      <TouchableOpacity onPress={() => {}}>
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            padding: 16,
            paddingLeft: 11,
            paddingBottom: 8,
            marginHorizontal: 20,
            backgroundColor: theme.colors.WHITE,
            marginTop: rowID === 0 ? 20 : 4,
            marginBottom: Prescriptions.length === rowID + 1 ? 20 : 4,
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
              {rowData.doctor_name}
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
                {rowData.date}
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
                {rowData.patient_name}
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
              {rowData.disease}
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
      <SafeAreaView>
        <Header
          title={'SELECT FROM E-PRESCRIPTIONS'}
          leftIcon="backArrow"
          container={{
            ...theme.viewStyles.cardContainer,
          }}
          // rightComponent={<RightHeader />}
          onPressLeftIcon={() => props.navigation.goBack()}
        />

        <FlatList
          bounces={false}
          data={Prescriptions}
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
    </View>
  );
};
