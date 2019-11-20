import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { useQuery } from 'react-apollo-hooks';
import {
  getPatientAddressList,
  getPatientAddressList_getPatientAddressList_addressList,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import { GET_PATIENT_ADDRESS_LIST } from '@aph/mobile-patients/src/graphql/profiles';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Remove, AddIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { PATIENT_ADDRESS_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { CapsuleView } from '@aph/mobile-patients/src/components/ui/CapsuleView';

const styles = StyleSheet.create({
  addressContainer: {
    marginTop: 16,
  },
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    marginVertical: 4,
    padding: 16,
    flexDirection: 'row',
  },
  textStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 20,
    color: theme.colors.SHERPA_BLUE,
  },
});

export interface AddressBookProps extends NavigationScreenProps {}

export const AddressBook: React.FC<AddressBookProps> = (props) => {
  const [selectedId, setselectedId] = useState<number>(0);
  const [addressList, setaddressList] = useState<
    getPatientAddressList_getPatientAddressList_addressList[] | null
  >([]);
  const [showSpinner, setshowSpinner] = useState<boolean>(true);

  const { setAddresses, addresses } = useShoppingCart();
  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  const { data, error } = useQuery<getPatientAddressList>(GET_PATIENT_ADDRESS_LIST, {
    fetchPolicy: 'no-cache',
    variables: {
      patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
    },
  });
  if (error) {
    console.log('error', error);
  } else {
    if (
      data &&
      data.getPatientAddressList &&
      data.getPatientAddressList.addressList &&
      addressList !== data.getPatientAddressList.addressList
    ) {
      setaddressList(data.getPatientAddressList.addressList);
      setshowSpinner(false);
      setAddresses && setAddresses(data.getPatientAddressList.addressList);
    }
  }

  const renderBottomButtons = () => {
    return (
      <StickyBottomComponent defaultBG>
        <Button
          title="ADD NEW ADDRESS"
          style={{ flex: 1, marginHorizontal: 60 }}
          onPress={() => props.navigation.navigate(AppRoutes.AddAddress, { addOnly: true })}
        />
      </StickyBottomComponent>
    );
  };
  const updateDataAddres = (dataname: string, address: any) => {
    props.navigation.push(AppRoutes.AddAddress, { KeyName: dataname, DataAddress: address });
  };
  const deleteDataAddres = (address: any) => {};
  const renderRadioButtonList = () => {
    return (
      addresses &&
      addresses.map((address, i) => (
        <View style={styles.cardStyle} key={i}>
          <TouchableOpacity onPress={() => updateDataAddres('Update', address)}>
            <Text style={styles.textStyle}>{`${address.addressLine1}${
              address.addressLine2 ? ' ' + address.addressLine2 : ''
            } \n${address.landmark ? `${address.landmark}\n` : ''}${
              address.city ? `${address.city}, ` : ''
            }${address.state ? `${address.state}- ` : ''}${address.zipcode}`}</Text>
          </TouchableOpacity>
          <CapsuleView
            title={
              address.addressType === PATIENT_ADDRESS_TYPE.OTHER
                ? address.otherAddressType!
                : address.addressType!
            }
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor: '#0087ba',
              opacity: 0.4,
              width: 116,
              height: 24,
            }}
            titleTextStyle={{
              ...theme.fonts.IBMPlexSansBold(9),
              color: '#02475b',
              paddingHorizontal: 10,
              letterSpacing: 0.5,
              opacity: 1,
            }}
            isActive={false}
          ></CapsuleView>
          {/* <View style={{ padding: 3 }}>
            <TouchableOpacity onPress={() => updateDataAddres('Update', address)}>
              <View style={{ alignItems: 'flex-end' }}>
                <AddIcon />
              </View>
            </TouchableOpacity> */}
          {/* <TouchableOpacity onPress={() => deleteDataAddres(address)}>
              <View style={{ alignItems: 'flex-end' }}>
                <Remove />
              </View>
            </TouchableOpacity> */}
          {/* </View> */}
        </View>
      ))
    );
  };

  const renderAddresses = () => {
    return <View style={styles.addressContainer}>{renderRadioButtonList()}</View>;
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          leftIcon="backArrow"
          title={'ADDRESS BOOK'}
          container={{
            ...theme.viewStyles.cardViewStyle,
            borderRadius: 0,
          }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <ScrollView bounces={false}>
          {renderAddresses()}
          <View style={{ height: 80 }} />
        </ScrollView>
        {renderBottomButtons()}
      </SafeAreaView>
      {showSpinner && <Spinner />}
    </View>
  );
};
