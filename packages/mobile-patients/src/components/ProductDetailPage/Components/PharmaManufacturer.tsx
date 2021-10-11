import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

export interface PharmaManufacturerProps {
  manufacturer?: string | null;
  composition?: string | null;
  consumeType?: string | null;
  onCompositionClick?: () => void;
  isPharma: boolean;
}

export const PharmaManufacturer: React.FC<PharmaManufacturerProps> = (props) => {
  const { manufacturer, composition, consumeType, onCompositionClick, isPharma } = props;

  return (
    <View style={styles.container}>
      {!!manufacturer && (
        <View style={styles.cardStyle}>
          <Text style={styles.heading}>Manufacturer:</Text>
          <Text style={styles.value}>{manufacturer}</Text>
        </View>
      )}
      {!!composition && !!isPharma && (
        <TouchableOpacity
          onPress={() => {
            onCompositionClick ? onCompositionClick() : null;
          }}
          style={styles.cardStyle}
        >
          <Text style={styles.heading}>Composition:</Text>
          <Text style={styles.compositionLink}>{composition}</Text>
        </TouchableOpacity>
      )}
      {!!consumeType && !!isPharma && (
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
    paddingHorizontal: 15,
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
  compositionLink: {
    ...theme.viewStyles.text('SB', 15, theme.colors.SKY_BLUE, 1, 25, 0.35),
    textDecorationLine: 'underline',
  },
});
