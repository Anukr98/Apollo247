import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { SAVE_PATIENT_ADDRESS } from '@aph/mobile-patients/src/graphql/profiles';
import { savePatientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { Mutation } from 'react-apollo';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({});

export interface AddAddressProps extends NavigationScreenProps {}

export const AddAddress: React.FC<AddAddressProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const [userName, setuserName] = useState<string>('');
  const [phoneNumber, setphoneNumber] = useState<string>('');
  const [addressLine1, setaddressLine1] = useState<string>('');
  const [pincode, setpincode] = useState<string>('');
  const [address, setaddress] = useState<string>('');

  useEffect(() => {
    setuserName(currentPatient && currentPatient.firstName ? currentPatient.firstName : '');
    console.log('currentPatient', currentPatient);
  }, [currentPatient]);

  const renderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        title={'ADD NEW ADDRESS'}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const renderAddress = () => {
    return (
      <View
        style={{
          ...theme.viewStyles.cardViewStyle,
          margin: 20,
          padding: 16,
        }}
      >
        <TextInputComponent value={userName} placeholder={'User Name'} />
        <TextInputComponent
          value={phoneNumber}
          onChangeText={(phoneNumber) => setphoneNumber(phoneNumber)}
          placeholder={'Phone Number'}
        />
        <TextInputComponent
          value={addressLine1}
          onChangeText={(addressLine1) => setaddressLine1(addressLine1)}
          placeholder={'Address Line 1'}
        />
        <TextInputComponent
          value={pincode}
          onChangeText={(pincode) => setpincode(pincode)}
          placeholder={'Pincode'}
        />
        <TextInputComponent
          value={address}
          onChangeText={(address) => setaddress(address)}
          placeholder={'Address'}
        />
      </View>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ ...theme.viewStyles.container }}>
        {renderHeader()}
        {renderAddress()}
        <StickyBottomComponent defaultBG>
          <Mutation<savePatientAddress> mutation={SAVE_PATIENT_ADDRESS}>
            {(mutate, { loading, data, error }) => (
              <Button
                title={'SAVE & USE'}
                style={{ flex: 1, marginHorizontal: 40 }}
                onPress={() => {
                  const addressInput = {
                    patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
                    addressLine1: addressLine1,
                    addressLine2: '',
                    city: '',
                    state: '',
                    zipcode: pincode,
                    landmark: address,
                  };
                  console.log(addressInput, 'addressInput');
                  mutate({
                    variables: {
                      PatientAddressInput: addressInput,
                    },
                  });
                }}
              >
                {data ? props.navigation.goBack() : null}
                {error ? console.log('bookAppointment error', error) : null}
              </Button>
            )}
          </Mutation>
        </StickyBottomComponent>
      </SafeAreaView>
    </View>
  );
};
