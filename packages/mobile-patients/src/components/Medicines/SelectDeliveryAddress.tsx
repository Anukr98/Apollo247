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
import { pinCodeServiceabilityApi } from '@aph/mobile-patients/src/helpers/apiCalls';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { formatAddress, getNetStatus } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { NoInterNetPopup } from '../ui/NoInterNetPopup';

const styles = StyleSheet.create({
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    margin: 20,
    padding: 16,
    paddingTop: 5,
  },
});

export interface SelectDeliveryAddressProps extends NavigationScreenProps {
  isTest?: boolean;
  selectedAddress: string;
  isChanged: (val: boolean, id?: string) => void;
}
{
}

export const SelectDeliveryAddress: React.FC<SelectDeliveryAddressProps> = (props) => {
  const isTest = props.navigation.getParam('isTest');
  const selectedAddress = props.navigation.getParam('selectedAddressId');
  const isChanged = props.navigation.getParam('isChanged');
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const {
    addresses: addressList,
    deliveryAddressId: selectedAddressId,
    setDeliveryAddressId: setSelectedAddressId,
  } = isTest ? useDiagnosticsCart() : useShoppingCart();
  const [selectedId, setselectedId] = useState<string>(selectedAddressId || selectedAddress);
  const [selectedPinCode, setselectedPinCode] = useState<string>(selectedAddressId);
  const [loading, setLoading] = useState<boolean>(false);
  const { showAphAlert } = useUIElements();

  const renderBottomButtons = () => {
    return (
      <StickyBottomComponent defaultBG>
        <Button
          title="DONE"
          style={{ flex: 1, marginHorizontal: 60 }}
          disabled={!selectedId}
          onPress={() => {
            getNetStatus().then(async (status) => {
              if (status) {
                setLoading(true);
                if (isTest) {
                  isChanged(true, selectedId);
                  props.navigation.goBack();
                } else {
                  pinCodeServiceabilityApi(selectedPinCode)
                    .then(({ data: { Availability } }) => {
                      if (Availability) {
                        setSelectedAddressId && setSelectedAddressId(selectedId);
                        props.navigation.goBack();
                        CommonLogEvent(AppRoutes.SelectDeliveryAddress, 'Address selected');
                      } else {
                        showAphAlert!({
                          title: 'Uh oh.. :(',
                          description:
                            'Sorry! We’re working hard to get to this area! In the meantime, you can either pick up from a nearby store, or change the pincode.',
                        });
                        CommonLogEvent(AppRoutes.SelectDeliveryAddress, 'Pincode unserviceable.');
                        setSelectedAddressId && setSelectedAddressId('');
                      }
                    })
                    .catch((e) => {
                      CommonBugFender('SelectDeliveryAddress_pinCodeServiceabilityApi', e);
                      Alert.alert('Alert', 'Unable to check if the address is serviceable or not.');
                    })
                    .finally(() => {
                      setLoading(false);
                    });
                }
              } else {
                console.log('setshowOfflinePopup');
                setshowOfflinePopup(true);
              }
            });
          }}
        />
      </StickyBottomComponent>
    );
  };

  const renderRadioButtonList = () => {
    return addressList.map((address, i) => (
      <RadioSelectionItem
        title={formatAddress(address)}
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
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
      {loading && <Spinner />}
    </View>
  );
};
