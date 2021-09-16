import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { pinCodeServiceabilityApi247 } from '@aph/mobile-patients/src/helpers/apiCalls';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import {
  formatAddressWithLandmark,
  formatNameNumber,
  formatAddress,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { AddressSource } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';

const styles = StyleSheet.create({
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    margin: 20,
    padding: 16,
    paddingTop: 5,
  },
  subtitleStyle: {
    ...theme.fonts.IBMPlexSansMedium(13),
    color: theme.colors.SHERPA_BLUE,
    marginBottom: 5,
  },
});

export interface SelectDeliveryAddressProps extends NavigationScreenProps {
  isTest?: boolean;
  selectedAddress: string;
  isChanged: (val: boolean, id?: string, pincode?: string) => void;
}

export const SelectDeliveryAddress: React.FC<SelectDeliveryAddressProps> = (props) => {
  const isTest = props.navigation.getParam('isTest');
  const selectedAddress = props.navigation.getParam('selectedAddressId');
  const isChanged = props.navigation.getParam('isChanged');

  const {
    addresses: addressList,
    deliveryAddressId: selectedAddressId,
    setDeliveryAddressId: setSelectedAddressId,
    setAddresses,
  } = isTest ? useDiagnosticsCart() : useShoppingCart();
  const [selectedId, setselectedId] = useState<string>(selectedAddressId || selectedAddress);
  const [selectedPinCode, setselectedPinCode] = useState<string>(selectedAddressId);
  const [loading, setLoading] = useState<boolean>(false);
  const { showAphAlert } = useUIElements();

  const reArrangeAddresses = () => {
    setAddresses!([
      addressList.find((a) => a.id == selectedId)!,
      ...addressList.filter((a) => a.id != selectedId),
    ]);
  };

  const renderBottomButtons = () => {
    return (
      <StickyBottomComponent defaultBG>
        <Button
          title="DONE"
          style={{ flex: 1, marginHorizontal: 60 }}
          disabled={!selectedId}
          onPress={() => {
            setLoading(true);
            if (isTest) {
              reArrangeAddresses();
              isChanged(true, selectedId, selectedPinCode);
              props.navigation.goBack();
            } else {
              pinCodeServiceabilityApi247(selectedPinCode)
                .then(({ data: { response } }) => {
                  const { servicable } = response;
                  if (servicable) {
                    reArrangeAddresses();
                    setSelectedAddressId && setSelectedAddressId(selectedId);
                    props.navigation.goBack();
                    CommonLogEvent(AppRoutes.SelectDeliveryAddress, 'Address selected');
                  } else {
                    showAphAlert!({
                      title: string.common.uhOh,
                      description: string.medicine_cart.pharmaAddressUnServiceableAlert,
                    });
                    CommonLogEvent(AppRoutes.SelectDeliveryAddress, 'Pincode unserviceable.');
                    setSelectedAddressId && setSelectedAddressId('');
                  }
                })
                .catch((e) => {
                  CommonBugFender('SelectDeliveryAddress_pinCodeServiceabilityApi', e);
                  showAphAlert!({
                    title: string.common.uhOh,
                    description: string.medicine_cart.pharmaAddressServiceabilityFailure,
                  });
                })
                .finally(() => {
                  setLoading(false);
                });
            }
          }}
        />
      </StickyBottomComponent>
    );
  };

  const _navigateToEditAddress = (dataname: string, address: any, comingFrom: string) => {
    props.navigation.push(AppRoutes.AddAddressNew, {
      KeyName: dataname,
      addressDetails: address,
      ComingFrom: comingFrom,
      source: isTest ? ('Diagnostics Cart' as AddressSource) : undefined,
    });
  };

  const renderRadioButtonList = () => {
    return addressList.map((address, i) => (
      <RadioSelectionItem
        title={formatAddressWithLandmark(address)}
        showMultiLine={true}
        subtitle={formatNameNumber(address)}
        subtitleStyle={styles.subtitleStyle}
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
        showEditIcon={true}
        onPressEdit={() =>
          _navigateToEditAddress('Update', address, AppRoutes.SelectDeliveryAddress)
        }
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
          onPressLeftIcon={() => {
            isChanged && isChanged(false);
            props.navigation.goBack();
          }}
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
