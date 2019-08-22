import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { useQuery } from 'react-apollo-hooks';
import {
  getPatientAddressList,
  getPatientAddressList_getPatientAddressList_addressList,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import { GET_PATIENT_ADDRESS_LIST } from '@aph/mobile-patients/src/graphql/profiles';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';

const styles = StyleSheet.create({
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    margin: 20,
    padding: 16,
    paddingTop: 5,
  },
});

const addresses = [
  'Apollo Pharmacy\nPlot No B / 88, Opposite Andhra Bank\nJubilee Hills',
  'Apollo Pharmacy\nPlot No B / 88, Opposite Andhra Bank\nJubilee Hills',
  'Apollo Pharmacy\nPlot No B / 88, Opposite Andhra Bank\nJubilee Hills',
  'Apollo Pharmacy\nPlot No B / 88, Opposite Andhra Bank\nJubilee Hills',
  'Apollo Pharmacy\nPlot No B / 88, Opposite Andhra Bank\nJubilee Hills',
];

export interface SelectDeliveryAddressProps extends NavigationScreenProps {}

export const SelectDeliveryAddress: React.FC<SelectDeliveryAddressProps> = (props) => {
  const [selectedId, setselectedId] = useState<number>(0);
  const [addressList, setaddressList] = useState<
    getPatientAddressList_getPatientAddressList_addressList[] | null
  >([]);
  const { currentPatient } = useAllCurrentPatients();

  console.log(currentPatient);
  const { data, error } = useQuery<getPatientAddressList>(GET_PATIENT_ADDRESS_LIST, {
    variables: {
      patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
    },
  });
  if (error) {
    console.log('error', error);
  } else {
    console.log('getPatientAddressList', data);
    if (
      data &&
      data.getPatientAddressList &&
      addressList !== data.getPatientAddressList.addressList
    ) {
      console.log('data', data.getPatientAddressList);
      setaddressList(data.getPatientAddressList.addressList);
    }
  }

  const renderBottomButtons = () => {
    return (
      <StickyBottomComponent defaultBG>
        <Button title="DONE" style={{ flex: 1, marginHorizontal: 60 }} />
      </StickyBottomComponent>
    );
  };

  const renderRadioButtonList = () => {
    return (
      addressList &&
      addressList.map((address, i) => (
        <RadioSelectionItem
          title={`${address.addressLine1} ${address.addressLine2}\n ${address.city} ${address.state}`}
          isSelected={selectedId === i}
          onPress={() => setselectedId(i)}
          key={i}
          containerStyle={{
            paddingTop: 15,
          }}
          hideSeparator={i + 1 === addresses.length}
        />
      ))
    );
  };

  const renderAddresses = () => {
    return <View style={styles.cardStyle}>{renderRadioButtonList()}</View>;
  };

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <Header
        leftIcon="backArrow"
        title={'SELECT DELIVERY ADDRESS'}
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
      <ScrollView bounces={false}>{renderAddresses()}</ScrollView>
      {renderBottomButtons()}
    </SafeAreaView>
  );
};
