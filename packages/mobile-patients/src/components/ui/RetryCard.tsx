import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface RetryCardProps {
  onPressRetry?: () => void;
}

export const RetryCard: React.FC<RetryCardProps> = ({ onPressRetry }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.genericError}>{string.genericError}</Text>
      {!!onPressRetry && (
        <View style={styles.retryContainer}>
          <Button onPress={onPressRetry} title={string.retry.toUpperCase()} />
        </View>
      )}
    </View>
  );
};

const { text, card } = theme.viewStyles;
const { LIGHT_BLUE } = theme.colors;
const styles = StyleSheet.create({
  container: {
    ...card(),
    alignItems: 'center',
  },
  genericError: {
    ...text('M', 16, LIGHT_BLUE),
    textAlign: 'center',
  },
  retryContainer: {
    width: '60%',
    marginTop: 25,
    marginBottom: 10,
  },
});
