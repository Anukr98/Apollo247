import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Check, UnCheck } from '@aph/mobile-patients/src/components/ui/Icons';

export interface PickUpUploadPrescriptionProps {
  onPressUploadPrescription: () => void;
}

export const PickUpUploadPrescription: React.FC<PickUpUploadPrescriptionProps> = (props) => {
  const { onPressUploadPrescription } = props;
  const { showPrescriptionAtStore, setShowPrescriptionAtStore } = useShoppingCart();

  const renderShowPrescriptionatStore = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}
        onPress={() => setShowPrescriptionAtStore!(!showPrescriptionAtStore)}
      >
        {showPrescriptionAtStore ? <Check /> : <UnCheck />}
        <Text style={{ ...theme.viewStyles.text('M', 14, '#01475b', 1, 24), marginLeft: 8 }}>
          I will show the prescription at the store.
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={{ ...theme.fonts.IBMPlexSansMedium(14), lineHeight: 20, color: '#02475B' }}>
        Items in your cart marked with ‘Rx’ need prescriptions.
      </Text>
      <TouchableOpacity activeOpacity={0.5} onPress={onPressUploadPrescription}>
        <Text style={styles.upload}>UPLOAD PRESCRIPTION</Text>
      </TouchableOpacity>
      <Text style={{ ...theme.fonts.IBMPlexSansSemiBold(14), lineHeight: 24, color: '#01475B' }}>
        OR
      </Text>
      {renderShowPrescriptionatStore()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2,71,91, 0.3)',
  },
  upload: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    color: '#FC9916',
    marginTop: 3,
  },
});
