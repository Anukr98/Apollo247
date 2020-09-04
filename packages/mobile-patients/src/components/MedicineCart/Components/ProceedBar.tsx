import React from 'react';
import { StyleSheet, Text, FlatList, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import string from '@aph/mobile-patients/src/strings/strings.json';

export interface ProceedBarProps {
  onPressAddDeliveryAddress: () => void;
  onPressUploadPrescription: () => void;
}

export const ProceedBar: React.FC<ProceedBarProps> = (props) => {
  const { grandTotal, deliveryAddressId, uploadPrescriptionRequired } = useShoppingCart();
  const { onPressAddDeliveryAddress, onPressUploadPrescription } = props;

  function getTitle() {
    return !deliveryAddressId
      ? 'ADD DELIVERY ADDRESS'
      : uploadPrescriptionRequired
      ? 'UPLOAD PRESCRIPTION'
      : 'PROCEED TO PAY';
  }

  function onPressButton() {
    return !deliveryAddressId
      ? onPressAddDeliveryAddress()
      : uploadPrescriptionRequired
      ? onPressUploadPrescription()
      : onPressAddDeliveryAddress;
  }
  const renderTotal = () => {
    return (
      <View>
        <Text style={styles.total}>₹{grandTotal.toFixed(2)}</Text>
        <Text style={styles.text}>Home Delivery</Text>
      </View>
    );
  };

  const renderButton = () => {
    return (
      <Button
        disabled={false}
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

  return (
    <View style={styles.container}>
      {deliveryAddressId != '' && uploadPrescriptionRequired && renderPrescriptionMessage()}
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
