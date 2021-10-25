import { TatCard } from '@aph/mobile-patients/src/components/MedicineCart/Components/TatCard';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { formatSelectedAddress } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { AddressSource } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';
import { postPharmacyAddNewAddressClick } from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import {
  selectDeliveryAddressClickedEvent,
  uploadPrescriptionClickedEvent,
} from '@aph/mobile-patients/src/components/MedicineCart/Events';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';

export interface ServerCartTatBottomContainerProps extends NavigationScreenProps {
  onPressProceedtoPay?: () => void;
  screen?: string;
}

export const ServerCartTatBottomContainer: React.FC<ServerCartTatBottomContainerProps> = (
  props
) => {
  const {
    grandTotal,
    uploadPrescriptionRequired,
    prescriptionType,
    addresses,
    cartItems,
    minimumCartValue,
    isValidCartValue,
    circleMembershipCharges,

    cartAddressId,
    cartTat,
  } = useShoppingCart();
  const { onPressProceedtoPay, screen } = props;
  const { currentPatient } = useAllCurrentPatients();
  // console.log('cartAddressId >>>>>>> ', cartAddressId);
  const selectedAddress = addresses.find((item) => item.id == cartAddressId);
  const unServiceable = !!cartItems.find(
    ({ unavailableOnline, unserviceable }) => unavailableOnline || unserviceable
  );

  const onPressAddDeliveryAddress = () => {
    props.navigation.navigate(AppRoutes.AddAddressNew, {
      source: 'Cart' as AddressSource,
      addOnly: true,
    });
    postPharmacyAddNewAddressClick('Cart');
  };

  const onPressSelectDeliveryAddress = () => {
    selectDeliveryAddressClickedEvent(currentPatient?.id, JSON.stringify(cartItems));
    // showAddressPopup();
  };

  const onPressUploadPrescription = () => {
    uploadPrescriptionClickedEvent(currentPatient?.id);
    props.navigation.navigate(AppRoutes.MedicineCartPrescription);
  };

  const onPressReviewOrder = () => props.navigation.navigate(AppRoutes.CartSummary);

  const onPressAddMoreMedicines = () => props.navigation.navigate('MEDICINES');

  const onPressTatCard = () => {
    // todo:
    // uploadPrescriptionRequired
    //   ? onPressUploadPrescription()
    //   : physicalPrescriptions?.length > 0
    //   ? uploadPhysicalPrescriptons()
    //   : onPressReviewOrder();
  };

  function getTitle() {
    return !cartAddressId || !selectedAddress
      ? addresses?.length
        ? string.selectDeliveryAddress
        : string.addDeliveryAddress
      : isPrescriptionRequired()
      ? string.proceed
      : screen == 'MedicineCart'
      ? string.reviewOrder
      : string.proceedToPay;
  }

  function isPrescriptionRequired() {
    if (uploadPrescriptionRequired) {
      return screen === 'MedicineCart' ? true : !prescriptionType;
    } else {
      return false;
    }
  }

  function onPressButton() {
    return !cartAddressId
      ? addresses?.length
        ? onPressSelectDeliveryAddress()
        : onPressAddDeliveryAddress()
      : isPrescriptionRequired()
      ? onPressUploadPrescription()
      : screen == 'MedicineCart'
      ? onPressReviewOrder()
      : onPressProceedtoPay?.();
  }

  const renderTotal = () => {
    return (
      <View>
        <Text style={styles.total}>₹{grandTotal.toFixed(2)}</Text>
        <Text style={styles.text}>{screen == 'summary' ? 'Total Amount' : 'Home Delivery'}</Text>
      </View>
    );
  };

  function isdisabled() {
    if (cartItems && cartItems.length && !unServiceable && isValidCartValue) {
      return false;
    } else {
      return true;
    }
  }
  const renderButton = () => {
    return (
      <Button
        disabled={isdisabled()}
        title={getTitle()}
        onPress={() => onPressButton()}
        titleTextStyle={{ fontSize: 13, lineHeight: 24, marginVertical: 8 }}
        style={{ flex: 1, marginLeft: 15, borderRadius: 5 }}
      />
    );
  };

  const renderPrescriptionMessage = () => {
    return (
      <View style={{ backgroundColor: '#F7F8F5' }}>
        <Text style={styles.prescriptionMsg}>
          Items in your cart marked with 'Rx' need prescriptions
        </Text>
      </View>
    );
  };

  const renderTatCard = () => {
    if (selectedAddress) {
      return (
        <TatCard
          deliveryTime={cartTat}
          deliveryAddress={formatSelectedAddress(selectedAddress!)}
          onPressChangeAddress={() => {
            // showAddressPopup()
          }}
          onPressTatCard={screen === 'MedicineCart' && isValidCartValue ? onPressTatCard : () => {}}
        />
      );
    } else {
      return null;
    }
  };

  const renderMinimumCartMessage = () => {
    const cartTotal = circleMembershipCharges ? grandTotal - circleMembershipCharges : grandTotal;
    const toAdd = (minimumCartValue - cartTotal)?.toFixed(2);
    return (
      <View style={styles.minCartContainer}>
        <Text style={styles.minCartMsg}>{`Add items worth ₹${toAdd} more to place an order`}</Text>
        <TouchableOpacity onPress={onPressAddMoreMedicines}>
          <Text style={styles.addMoreText}>ADD MORE</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderTatCard()}
      {cartAddressId != '' && isPrescriptionRequired() && renderPrescriptionMessage()}
      {screen === 'MedicineCart' && !isValidCartValue && renderMinimumCartMessage()}
      <View style={styles.subContainer}>
        {renderTotal()}
        {renderButton()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.WHITE,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  subContainer: {
    flexDirection: 'row',
    paddingHorizontal: 13,
    marginVertical: 9,
  },
  total: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 24,
    color: '#01475B',
  },
  text: {
    ...theme.fonts.IBMPlexSansRegular(14),
    lineHeight: 24,
    color: '#01475B',
  },
  prescriptionMsg: {
    marginLeft: 13,
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 24,
    color: '#02475B',
    marginVertical: 6,
  },
  minCartMsg: {
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 24,
    color: '#02475B',
    marginVertical: 6,
    width: '78%',
  },
  addMoreText: {
    ...theme.fonts.IBMPlexSansBold(15),
    lineHeight: 24,
    color: theme.colors.APP_YELLOW,
    marginVertical: 6,
    width: '100%',
  },
  minCartContainer: {
    backgroundColor: '#F7F8F5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    alignItems: 'center',
  },
});
