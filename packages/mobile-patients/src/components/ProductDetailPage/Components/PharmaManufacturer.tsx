import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

export interface PharmaManufacturerProps {
  manufacturer?: string | null;
  composition?: string | null;
  consumeType?: string | null;
}

export const PharmaManufacturer: React.FC<PharmaManufacturerProps> = (props) => {
  const { manufacturer, composition, consumeType } = props;

  return (
    <View style={styles.container}>
      {!!manufacturer && (
        <View style={styles.cardStyle}>
          <Text style={styles.heading}>Manufacturer:</Text>
          <Text style={styles.value}>{manufacturer}</Text>
        </View>
      )}
      {!!composition && (
        <View style={styles.cardStyle}>
          <Text style={styles.heading}>Composition:</Text>
          <Text style={styles.value}>{composition}</Text>
        </View>
      )}
      {!!consumeType && (
        <View style={styles.cardStyle}>
          <Text style={styles.heading}>Consume Type:</Text>
          <Text style={styles.value}>{consumeType}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 7,
  },
  cardStyle: {
    marginBottom: 7,
  },
  heading: {
    ...theme.viewStyles.text('M', 16, '#02475B', 1, 25, 0.35),
  },
  value: {
    ...theme.viewStyles.text('R', 15, '#02475B', 1, 25, 0.35),
  },
});
