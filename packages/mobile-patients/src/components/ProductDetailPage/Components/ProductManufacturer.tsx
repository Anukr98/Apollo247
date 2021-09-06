import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

export interface ProductManufacturerProps {
  address?: string;
  origin?: string;
}

export const ProductManufacturer: React.FC<ProductManufacturerProps> = (props) => {
  const { address, origin } = props;

  return (
    <View style={styles.cardStyle}>
      {!!address && (
        <View>
          <Text style={styles.heading}>Manufacturer/Marketer Address</Text>
          <Text style={styles.subHeading}>{address}</Text>
        </View>
      )}
      {!!origin && (
        <View>
          <Text style={[styles.heading, { marginTop: 7 }]}>Country of Origin</Text>
          <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 25, 0.35)}>{origin}</Text>
        </View>
      )}
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
