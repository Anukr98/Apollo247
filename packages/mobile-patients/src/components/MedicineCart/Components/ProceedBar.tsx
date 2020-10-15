import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { formatSelectedAddress } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { WhiteArrowRight } from '@aph/mobile-patients/src/components/ui/Icons';
import { TatCard } from '@aph/mobile-patients/src/components/MedicineCart/Components/TatCard';

export interface ProceedBarProps {
  onPressAddDeliveryAddress?: () => void;
  onPressUploadPrescription?: () => void;
  onPressProceedtoPay?: () => void;
  deliveryTime?: string;
  onPressChangeAddress?: () => void;
  screen?: string;
}

export const ProceedBar: React.FC<ProceedBarProps> = (props) => {
  const {
    grandTotal,
    deliveryAddressId,
    uploadPrescriptionRequired,
    physicalPrescriptions,
    ePrescriptions,
    addresses,
    cartItems,
  } = useShoppingCart();
  const {
    onPressAddDeliveryAddress,
    onPressUploadPrescription,
    onPressProceedtoPay,
    deliveryTime,
    onPressChangeAddress,
    screen,
  } = props;
  const selectedAddress = addresses.find((item) => item.id == deliveryAddressId);
  const unServiceable = cartItems.find((item) => item.unserviceable);

  function getTitle() {
    return !deliveryAddressId
      ? 'ADD DELIVERY ADDRESS'
      : isPrescriptionRequired()
      ? 'UPLOAD PRESCRIPTION'
      : 'PROCEED TO PAY';
  }

  function isPrescriptionRequired() {
    if (uploadPrescriptionRequired) {
      return physicalPrescriptions.length > 0 || ePrescriptions.length > 0 ? false : true;
    } else {
      return false;
    }
  }
  function onPressButton() {
    return !deliveryAddressId
      ? onPressAddDeliveryAddress!()
      : isPrescriptionRequired()
      ? onPressUploadPrescription!()
      : onPressProceedtoPay!();
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
    if (cartItems && cartItems.length && !unServiceable) {
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
    if (selectedAddress && deliveryTime) {
      return (
        <TatCard
          deliveryTime={deliveryTime}
          deliveryAddress={formatSelectedAddress(selectedAddress!)}
          onPressChangeAddress={onPressChangeAddress!}
        />
      );
    } else {
      return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderTatCard()}
      {deliveryAddressId != '' && isPrescriptionRequired() && renderPrescriptionMessage()}
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
});
