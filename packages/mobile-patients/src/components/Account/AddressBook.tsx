import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { useApolloClient } from 'react-apollo-hooks';
import {
  DELETE_PATIENT_ADDRESS,
  GET_PATIENT_ADDRESS_LIST,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getPatientAddressList,
  getPatientAddressListVariables,
  getPatientAddressList_getPatientAddressList_addressList,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import { PATIENT_ADDRESS_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList, NavigationScreenProps, ScrollView } from 'react-navigation';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  nameFormater,
  formatAddressBookAddress,
  handleGraphQlError,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { postPharmacyAddNewAddressClick } from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import { AddressSource } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';
import {
  DeleteIconWhite,
  EditAddressIcon,
  HomeAddressIcon,
  LocationIcon,
  OfficeAddressIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import {
  deletePatientAddress,
  deletePatientAddressVariables,
} from '@aph/mobile-patients/src/graphql/types/deletePatientAddress';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

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
  headingTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
    color: theme.colors.SHERPA_BLUE,
  },
  outerAddressView: { marginLeft: '1.5%', flexDirection: 'row' },
  innerAddressView: { marginLeft: '3%', width: '89%' },
  userNameView: { marginTop: 4, flexDirection: 'row', width: '83%' },
  addressText: { opacity: 0.4, ...theme.fonts.IBMPlexSansMedium(10), marginHorizontal: '2%' },
  iconTouch: { height: 20, width: 20 },
  iconStyles: {
    tintColor: theme.colors.SHERPA_BLUE,
    opacity: 0.4,
    width: 15,
    height: 15,
    resizeMode: 'contain',
  },
  verticalLine: {
    borderLeftWidth: 1,
    backgroundColor: theme.colors.SHERPA_BLUE,
    opacity: 0.4,
    marginLeft: 6,
    marginRight: 6,
  },
  addressTypeIcon: {
    height: 25,
    width: 23,
    resizeMode: 'contain',
    tintColor: theme.colors.SHERPA_BLUE,
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

  useEffect(() => {
    getAddressList();
  }, []);

  const getAddressList = () => {
    client
      .query<getPatientAddressList, getPatientAddressListVariables>({
        query: GET_PATIENT_ADDRESS_LIST,

        variables: {
          patientId: currentPatient && currentPatient.id ? currentPatient.id : '',
        },
        fetchPolicy: 'no-cache',
      })
      .then((data) => {
        if (data) {
          const addressList = data?.data?.getPatientAddressList?.addressList || [];
          if (addressList) {
            setaddressList(addressList);
            setshowSpinner(false);
            setAddresses && setAddresses(addressList);
            setAdd && setAdd(addressList);
          }
        }
      })
      .catch((error) => {});
  };

  const client = useApolloClient();

  const handleBack = () => {
    props.navigation.goBack();
  };

  const renderBottomButtons = () => {
    return (
      <StickyBottomComponent defaultBG>
        <Button
          title="ADD NEW ADDRESS"
          style={{ flex: 1, marginHorizontal: 60 }}
          onPress={() => {
            postPharmacyAddNewAddressClick('My Account');
            props.navigation.navigate(AppRoutes.AddAddressNew, {
              addOnly: true,
              source: 'My Account' as AddressSource,
            });
          }}
        />
      </StickyBottomComponent>
    );
  };
  const updateAddress = (dataname: string, address: any) => {
    //if edit address, then don't ask location permission.
    props.navigation.push(AppRoutes.AddAddressNew, { KeyName: dataname, addressDetails: address });
  };

  const deleteAddress = (address: any) => {
    setshowSpinner(true);
    client
      .mutate<deletePatientAddress, deletePatientAddressVariables>({
        mutation: DELETE_PATIENT_ADDRESS,
        variables: { id: address?.id },
        fetchPolicy: 'no-cache',
      })
      .then((_data: any) => {
        getAddressList();
      })
      .catch((e) => {
        CommonBugFender('AddressBook_DELETE_PATIENT_ADDRESS', e);
        handleGraphQlError(e);
      })
      .finally(() => setshowSpinner(false));
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
        onPress={() => updateAddress('Update', address)} //need to check entire view is clickable
      >
        <View style={[styles.cardStyle]} key={index}>
          <View style={styles.outerAddressView}>
            <View style={{ marginTop: '2%' }}>
              {address.addressType === PATIENT_ADDRESS_TYPE.HOME && (
                <HomeAddressIcon style={styles.addressTypeIcon} />
              )}
              {address.addressType === PATIENT_ADDRESS_TYPE.OFFICE && (
                <OfficeAddressIcon style={[styles.addressTypeIcon, { marginTop: 3 }]} />
              )}
              {address.addressType === PATIENT_ADDRESS_TYPE.OTHER && (
                <LocationIcon style={[styles.addressTypeIcon, { height: 27, width: 25 }]} />
              )}
            </View>
            <View style={styles.innerAddressView}>
              {!!address.name && (
                <View style={styles.userNameView}>
                  <Text style={[styles.textStyle]}>{address.name}</Text>
                  <Text style={[styles.textStyle, styles.addressText]}>
                    ({nameFormater(address?.addressType!, 'default')})
                  </Text>
                </View>
              )}
              <View style={{ width: '83%' }}>
                <Text style={[styles.textStyle, { ...theme.fonts.IBMPlexSansMedium(12) }]}>
                  {formatAddressBookAddress(address)}
                </Text>
              </View>
              {!!address?.mobileNumber && (
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.headingTextStyle}>Mobile: </Text>
                  <Text style={[styles.textStyle, { ...theme.fonts.IBMPlexSansMedium(12) }]}>
                    {address?.mobileNumber.includes('+91') ? '' : '+91 '}
                    {address?.mobileNumber}
                  </Text>
                </View>
              )}
              <View style={{ alignSelf: 'flex-end' }}>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    onPress={() => updateAddress('Update', address)}
                    style={styles.iconTouch}
                  >
                    <EditAddressIcon style={styles.iconStyles} />
                  </TouchableOpacity>
                  <View style={styles.verticalLine} />
                  <TouchableOpacity onPress={() => deleteAddress(address)} style={styles.iconTouch}>
                    <DeleteIconWhite style={styles.iconStyles} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
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
          onPressLeftIcon={() => handleBack()}
        />
        <ScrollView bounces={false}>{renderAddresses()}</ScrollView>
        {renderBottomButtons()}
      </SafeAreaView>
      {showSpinner && <Spinner />}
    </View>
  );
};
