import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, Alert, Platform } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { Spinner } from '../ui/Spinner';
import { pinCodeServiceabilityApi } from '../../helpers/apiCalls';
import { CommonLogEvent } from '../../FunctionHelpers/DeviceHelper';
import { AppRoutes } from '../NavigatorContainer';
import { useDiagnosticsCart } from '../DiagnosticsCartProvider';

const styles = StyleSheet.create({
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    margin: 20,
    padding: 16,
    paddingTop: 5,
  },
});

export interface SelectDeliveryAddressProps extends NavigationScreenProps {}

export const SelectDeliveryAddress: React.FC<SelectDeliveryAddressProps> = (props) => {
  const isTest = props.navigation.getParam('isTest');

  const {
    addresses: addressList,
    deliveryAddressId: selectedAddressId,
    setDeliveryAddressId: setSelectedAddressId,
  } = isTest ? useDiagnosticsCart() : useShoppingCart();
  const [selectedId, setselectedId] = useState<string>(selectedAddressId);
  const [selectedPinCode, setselectedPinCode] = useState<string>(selectedAddressId);
  const [loading, setLoading] = useState<boolean>(false);
  const renderBottomButtons = () => {
    return (
      <StickyBottomComponent defaultBG>
        <Button
          title="DONE"
          style={{ flex: 1, marginHorizontal: 60 }}
          onPress={() => {
            setLoading(true);
            if (isTest) {
              setSelectedAddressId && setSelectedAddressId(selectedId);
              props.navigation.goBack();
            } else {
              pinCodeServiceabilityApi(selectedPinCode)
                .then(({ data: { Availability } }) => {
                  setLoading(false);
                  if (Availability) {
                    setSelectedAddressId && setSelectedAddressId(selectedId);
                    props.navigation.goBack();
                    CommonLogEvent(AppRoutes.SelectDeliveryAddress, 'Address selected');
                  } else {
                    Alert.alert(
                      'Alert',
                      'Sorry! We’re working hard to get to this area! In the meantime, you can either pick up from a nearby store, or change the pincode.'
                    );
                    CommonLogEvent(
                      AppRoutes.SelectDeliveryAddress,
                      'Sorry! We’re working hard to get to this area! In the meantime, you can either pick up from a nearby store, or change the pincode.'
                    );
                    setSelectedAddressId && setSelectedAddressId('');
                  }
                })
                .catch((e) => {
                  setLoading(false);
                  Alert.alert('Alert', 'Unable to check if the address is serviceable or not.');
                });
            }
          }}
        />
      </StickyBottomComponent>
    );
  };

  const renderRadioButtonList = () => {
    return addressList.map((address, i) => (
      <RadioSelectionItem
        title={`${address.addressLine1}, ${address.addressLine2}\n${address.landmark}${
          address.landmark ? ',\n' : ''
        }${address.city}, ${address.state} - ${address.zipcode}`}
        isSelected={selectedId === address.id}
        onPress={() => {
          CommonLogEvent(AppRoutes.SelectDeliveryAddress, 'Select pincode and Id');
          setselectedPinCode(address.zipcode!);
          setselectedId(address.id);
        }}
        key={i}
        containerStyle={{
          paddingTop: 15,
        }}
        hideSeparator={i + 1 === addressList.length}
      />
    ));
  };

  const renderAddresses = () => {
    return <View style={styles.cardStyle}>{renderRadioButtonList()}</View>;
  };

  return (
    <View style={{ flex: 1 }}>
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
        <ScrollView bounces={false}>
          {renderAddresses()}
          <View style={{ height: 80 }} />
        </ScrollView>
        {renderBottomButtons()}
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
  );
};
