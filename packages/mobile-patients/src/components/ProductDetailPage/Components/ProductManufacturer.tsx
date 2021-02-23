import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

export interface ProductManufacturerProps {
  address: string;
}

export const ProductManufacturer: React.FC<ProductManufacturerProps> = (props) => {
  const { address } = props;

  return (
    <View style={styles.cardStyle}>
      <Text style={styles.heading}>Manufacturer/Marketer address</Text>
      <Text style={styles.subHeading}>{address}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    marginVertical: 10,
    padding: 7,
    borderWidth: 1,
    borderColor: '#02475B',
  },
  heading: {
    ...theme.viewStyles.text('M', 16, '#02475B', 1, 25, 0.35),
    marginBottom: 2,
  },
  subHeading: {
    ...theme.viewStyles.text('R', 14, '#02475B', 1, 25, 0.35),
  },
});
