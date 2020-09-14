import React, { useEffect, useRef, useState } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import { View, SafeAreaView, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { SelectedAddress } from '@aph/mobile-patients/src/components/MedicineCart/Components/SelectedAddress';
import { ChooseAddress } from '@aph/mobile-patients/src/components/MedicineCart/Components/ChooseAddress';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { pinCodeServiceabilityApi247 } from '@aph/mobile-patients/src/helpers/apiCalls';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { CartItemsList } from '@aph/mobile-patients/src/components/MedicineCart/Components/CartItemsList';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { TatCardwithoutAddress } from '@aph/mobile-patients/src/components/MedicineCart/Components/TatCardwithoutAddress';
import { UploadPrescription } from '@aph/mobile-patients/src/components/MedicineCart/Components/UploadPrescription';
import { Prescriptions } from '@aph/mobile-patients/src/components/MedicineCart/Components/Prescriptions';

export interface CartSummaryProps extends NavigationScreenProps {}

export const CartSummary: React.FC<CartSummaryProps> = (props) => {
  const {
    addresses,
    deliveryAddressId,
    setDeliveryAddressId,
    uploadPrescriptionRequired,
  } = useShoppingCart();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const [loading, setloading] = useState<boolean>(false);
  const [showPopUp, setshowPopUp] = useState<boolean>(false);
  const deliveryTime = props.navigation.getParam('deliveryTime');

  async function checkServicability(address: savePatientAddress_savePatientAddress_patientAddress) {
    setloading(true);
    if (deliveryAddressId && deliveryAddressId == address.id) {
      return;
    }
    const response = await pinCodeServiceabilityApi247(address.zipcode!);
    const { data } = response;
    if (data.response) {
      setloading(false);
      setDeliveryAddressId && setDeliveryAddressId(address.id);
    } else {
      setDeliveryAddressId && setDeliveryAddressId('');
      setloading!(false);
    }
  }

  function showAddressPopup() {
    showAphAlert!({
      title: string.common.selectAddress,
      children: (
        <ChooseAddress
          addresses={addresses}
          deliveryAddressId={deliveryAddressId}
          onPressAddAddress={() => {}}
          onPressEditAddress={(address) => {
            console.log(address);
          }}
          onPressSelectAddress={(address) => {
            checkServicability(address);
            hideAphAlert && hideAphAlert();
          }}
        />
      ),
    });
  }

  const renderHeader = () => {
    return (
      <Header
        container={styles.header}
        leftIcon={'backArrow'}
        title={'ORDER SUMMARY'}
        onPressLeftIcon={() => {
          CommonLogEvent(AppRoutes.YourCart, 'Go back to add items');
          props.navigation.goBack();
        }}
      />
    );
  };

  const renderAddress = () => {
    return <SelectedAddress onPressChange={() => showAddressPopup()} />;
  };

  const renderTatCard = () => {
    return <TatCardwithoutAddress style={{ marginTop: 22 }} deliveryDate={deliveryTime} />;
  };

  const renderCartItems = () => {
    return <CartItemsList screen={'summary'} />;
  };

  const renderuploadPrescriptionPopup = () => {
    return (
      <UploadPrescription
        showPopUp={showPopUp}
        onClickClose={() => setshowPopUp(false)}
        navigation={props.navigation}
      />
    );
  };

  const renderPrescriptions = () => {
    return <Prescriptions />;
  };

  const renderButton = () => {
    return (
      <View style={styles.buttonContainer}>
        <Button
          disabled={false}
          title={'UPLOAD PRESCRIPTION'}
          onPress={() => {
            setshowPopUp(true);
          }}
          titleTextStyle={{ fontSize: 13, lineHeight: 24, marginVertical: 8 }}
          style={{ borderRadius: 10 }}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {renderHeader()}
          {renderAddress()}
          {renderTatCard()}
          {renderCartItems()}
          {uploadPrescriptionRequired && renderPrescriptions()}
        </ScrollView>
        {renderuploadPrescriptionPopup()}
        {renderButton()}
        {loading && <Spinner />}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  prescriptionMsgCard: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 13,
    borderRadius: 5,
    flexDirection: 'row',
    paddingHorizontal: 10,
    backgroundColor: '#F7F8F5',
  },
  prescriptionMsg: {
    marginLeft: 13,
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 24,
    color: '#02475B',
    marginVertical: 6,
  },
  buttonContainer: {
    paddingHorizontal: 50,
    paddingVertical: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
});
