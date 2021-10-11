import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

export interface ProductManufacturerProps {
  address?: string | null;
  origin?: string | null;
  packerName?: string | null;
  packerAddress?: string | null;
  importerName?: string | null;
  importerAddress?: string | null;
  importDate?: string | null;
  genericName?: string | null;
}

export const ProductManufacturer: React.FC<ProductManufacturerProps> = (props) => {
  const {
    address,
    origin,
    packerName,
    packerAddress,
    importerName,
    importerAddress,
    importDate,
    genericName,
  } = props;

  return (
    <View style={styles.cardStyle}>
      {!!origin && (
        <View>
          <Text style={[styles.heading, { marginTop: 7 }]}>Country of Origin</Text>
          <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 25, 0.35)}>{origin}</Text>
        </View>
      )}
      {!!address && (
        <View>
          <Text style={styles.heading}>Manufacturer/Marketer Address</Text>
          <Text style={styles.subHeading}>{address}</Text>
        </View>
      )}
      {!!packerName && (
        <View>
          <Text style={styles.heading}>Packer Name</Text>
          <Text style={styles.subHeading}>{packerName}</Text>
        </View>
      )}
      {!!packerAddress && (
        <View>
          <Text style={styles.heading}>Packer Address</Text>
          <Text style={styles.subHeading}>{packerAddress}</Text>
        </View>
      )}
      {!!importerName && (
        <View>
          <Text style={styles.heading}>Importer Name</Text>
          <Text style={styles.subHeading}>{importerName}</Text>
        </View>
      )}
      {!!importerAddress && (
        <View>
          <Text style={styles.heading}>Importer Address</Text>
          <Text style={styles.subHeading}>{importerAddress}</Text>
        </View>
      )}
      {!!importDate && (
        <View>
          <Text style={styles.heading}>Date of Import</Text>
          <Text style={styles.subHeading}>{importDate}</Text>
        </View>
      )}
      {!!genericName && (
        <View>
          <Text style={styles.heading}>Generic Name</Text>
          <Text style={styles.subHeading}>{genericName}</Text>
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
    marginHorizontal: 15,
  },
  heading: {
    ...theme.viewStyles.text('M', 16, '#02475B', 1, 25, 0.35),
    marginBottom: 2,
  },
  subHeading: {
    ...theme.viewStyles.text('R', 14, '#02475B', 1, 25, 0.35),
  },
});
