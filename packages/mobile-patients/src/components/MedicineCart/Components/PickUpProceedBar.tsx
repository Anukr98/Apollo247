import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { PickUpUploadPrescription } from '@aph/mobile-patients/src/components/MedicineCart/Components/PickUpUploadPrescription';

export interface PickUpProceedBarProps {
  onPressUploadPrescription: () => void;
  onPressProceedtoPay: () => void;
}

export const PickUpProceedBar: React.FC<PickUpProceedBarProps> = (props) => {
  const {
    grandTotal,
    uploadPrescriptionRequired,
    physicalPrescriptions,
    ePrescriptions,
    showPrescriptionAtStore,
    storeId,
  } = useShoppingCart();
  const { onPressUploadPrescription, onPressProceedtoPay } = props;

  function isPrescriptionRequired() {
    if (uploadPrescriptionRequired) {
      return !(
        showPrescriptionAtStore ||
        physicalPrescriptions.length > 0 ||
        ePrescriptions.length > 0
      );
    } else {
      return false;
    }
  }
  const renderUploadPrescription = () => {
    if (
      uploadPrescriptionRequired &&
      !(physicalPrescriptions.length > 0 || ePrescriptions.length > 0)
    ) {
      return <PickUpUploadPrescription onPressUploadPrescription={onPressUploadPrescription} />;
    }
  };

  const renderTotal = () => {
    return (
      <View>
        <Text style={styles.total}>₹{grandTotal.toFixed(2)}</Text>
        <Text style={styles.text}>{'Total Amount'}</Text>
      </View>
    );
  };

  const renderButton = () => {
    return (
      <Button
        disabled={storeId == '' || isPrescriptionRequired()}
        title={'PROCEED TO PAY'}
        onPress={onPressProceedtoPay}
        titleTextStyle={{ fontSize: 13, lineHeight: 24, marginVertical: 8 }}
        style={{ flex: 1, marginLeft: 15, borderRadius: 5 }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderUploadPrescription()}
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
