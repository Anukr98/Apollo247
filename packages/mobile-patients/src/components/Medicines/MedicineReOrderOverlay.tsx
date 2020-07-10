import { AphOverlay, AphOverlayProps } from '@aph/mobile-patients/src/components/ui/AphOverlay';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  textStyle: {
    ...theme.viewStyles.text('M', 12, '#02475b'),
    marginTop: 18,
  },
  circle: {
    backgroundColor: '#68919d',
    height: 6,
    width: 6,
    borderRadius: 3,
    marginHorizontal: 14,
  },
  unavailabilituView: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  unavailableText: {
    ...theme.viewStyles.text('R', 12, '#68919d', 1, 24),
    opacity: 0.8,
    flex: 1,
  },
  continueButton: { marginTop: 45, marginBottom: 16, width: '45%', alignSelf: 'center' },
});

export interface MedicineReOrderOverlayProps {
  itemDetails: { total: number; unavailable: string[] };
  onContinue: () => void;
  onClose: AphOverlayProps['onClose'];
}

export const MedicineReOrderOverlay: React.FC<MedicineReOrderOverlayProps> = (props) => {
  const { total, unavailable } = props.itemDetails;

  const addedToCartText = `${total -
    unavailable.length} out of ${total} items have been added to cart.`;

  const content = (
    <View style={{ paddingHorizontal: 28 }}>
      <Text style={styles.textStyle}>{addedToCartText}</Text>
      <Text style={styles.textStyle}>We couldn't add below items:</Text>
      {unavailable.map((item) => (
        <View style={styles.unavailabilituView}>
          <View style={styles.circle} />
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={[styles.unavailableText]}>
              {item}
            </Text>
          </View>
        </View>
      ))}
      <Text style={[styles.textStyle, { marginTop: 19 }]}>Please continue for purchase.</Text>
    </View>
  );

  const bottomButton = (
    <Button style={styles.continueButton} onPress={props.onContinue} title={'CONTINUE'} />
  );

  return (
    <AphOverlay isVisible={true} heading="Added to Cart" onClose={props.onClose}>
      <View style={styles.containerStyle}>
        {content}
        {bottomButton}
      </View>
    </AphOverlay>
  );
};
