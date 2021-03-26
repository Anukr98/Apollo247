import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { FailedTxn } from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

export interface TxnFailedProps {
  onPressRetry: () => void;
}

export const TxnFailed: React.FC<TxnFailedProps> = (props) => {
  const { onPressRetry } = props;
  const renderTxnFailedTxt = () => {
    return (
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.TxnFailed}>Transaction failed</Text>
        <Text style={styles.FailedMsg}>
          Any amount deducted will be refunded within 5 days. How would you like to proceed?
        </Text>
      </View>
    );
  };

  const retry = () => {
    return (
      <View style={{ alignItems: 'center' }}>
        <Button style={styles.button} title={'RETRY BOOKING'} onPress={onPressRetry} />
      </View>
    );
  };
  return (
    <View style={styles.component}>
      <FailedTxn />
      {renderTxnFailedTxt()}
      {retry()}
    </View>
  );
};
const styles = StyleSheet.create({
  component: {
    marginVertical: 25,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  TxnFailed: {
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 20,
    color: '#FF748E',
    marginVertical: 9,
  },
  FailedMsg: {
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 20,
    color: '#02475B',
    textAlign: 'center',
  },
  button: {
    width: 180,
    borderRadius: 5,
    marginTop: 16,
    marginBottom: 12,
  },
  tryOther: {
    ...theme.fonts.IBMPlexSansBold(14),
    lineHeight: 24,
    color: '#FCB716',
  },
});
