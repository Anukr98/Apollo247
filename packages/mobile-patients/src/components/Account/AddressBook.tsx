import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CapsuleView } from '@aph/mobile-patients/src/components/ui/CapsuleView';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { GET_PATIENT_ADDRESS_LIST } from '@aph/mobile-patients/src/graphql/profiles';
import {
  getPatientAddressList,
  getPatientAddressList_getPatientAddressList_addressList,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import { PATIENT_ADDRESS_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList, NavigationScreenProps, ScrollView } from 'react-navigation';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { formatAddress } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { postPharmacyAddNewAddressClick } from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import { AddressSource } from '@aph/mobile-patients/src/components/Medicines/AddAddress';

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
  const [addressList, setaddressList] = useState<
    getPatientAddressList_getPatientAddressList_addressList[] | null
  >([]);
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const { setAddresses, addresses } = useShoppingCart();
  const { setAddresses: setAdd } = useDiagnosticsCart();
  const { currentPatient } = useAllCurrentPatients();

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
      setAdd && setAdd(data.getPatientAddressList.addressList);
    }
  }

  const renderBottomButtons = () => {
    return (
      <StickyBottomComponent defaultBG>
        <Button
          title="ADD NEW ADDRESS"
          style={{ flex: 1, marginHorizontal: 60 }}
          onPress={() => {
            postPharmacyAddNewAddressClick('My Account');
            props.navigation.navigate(AppRoutes.AddAddress, {
              addOnly: true,
              source: 'My Account' as AddressSource,
            });
          }}
        />
      </StickyBottomComponent>
    );
  };
  const updateDataAddres = (dataname: string, address: any) => {
    props.navigation.push(AppRoutes.AddAddress, { KeyName: dataname, DataAddress: address });
  };

  const renderAddress = (
    address: savePatientAddress_savePatientAddress_patientAddress,
    index: number
  ) => {
    return (
      <TouchableOpacity
        style={[
          index < addresses.length - 1 ? {} : { marginBottom: 80 },
          index == 0 ? { marginTop: 20 } : {},
        ]}
        activeOpacity={1}
        onPress={() => updateDataAddres('Update', address)}
      >
        <View style={styles.cardStyle} key={index}>
          <Text style={styles.textStyle}>{formatAddress(address)}</Text>
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
        </View>
      </TouchableOpacity>
    );
  };

  const renderAddresses = () => {
    return (
      <View>
        <FlatList
          removeClippedSubviews={false}
          bounces={false}
          data={addresses}
          renderItem={({ item, index }) => renderAddress(item, index)}
        />
      </View>
    );
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
        <ScrollView bounces={false}>{renderAddresses()}</ScrollView>
        {renderBottomButtons()}
      </SafeAreaView>
      {showSpinner && <Spinner />}
    </View>
  );
};
