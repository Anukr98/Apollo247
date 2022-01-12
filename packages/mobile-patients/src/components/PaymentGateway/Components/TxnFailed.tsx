import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { PaymentFailedIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
export interface TxnFailedProps {
  onPressRetry: () => void;
  onPressCOD: () => void;
  businessLine: string;
}

export const TxnFailed: React.FC<TxnFailedProps> = (props) => {
  const { onPressRetry, businessLine, onPressCOD } = props;
  const showCODonDiag = AppConfig.Configuration.Show_COD_While_Retrying_Diag_Payment;
  const showCODonPharma = AppConfig.Configuration.Show_COD_While_Retrying_Pharma_Payment;

  const renderTxnFailedTxt = () => {
    return (
      <View style={{}}>
        <Text style={styles.FailedMsg}>
          If any money is deducted, It will be refunded in 3-5 working days
        </Text>
      </View>
    );
  };

  const renderRetry = () => {
    return (
      <TouchableOpacity style={styles.retryCont} onPress={onPressRetry}>
        <Text style={styles.retry}>RETRY WITH ANOTHER PAYMENT METHOD</Text>
      </TouchableOpacity>
    );
  };

  const renderCOD = () => {
    return (businessLine == 'diagnostics' && showCODonDiag) ||
      (businessLine == 'pharma' && showCODonPharma) ? (
      <TouchableOpacity style={styles.button} onPress={onPressCOD}>
        <Text style={styles.cod}>PLACE ORDER - CASH ON DELIVERY</Text>
      </TouchableOpacity>
    ) : null;
  };

  return (
    <View style={styles.component}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <PaymentFailedIcon style={styles.icon} />
        <Text style={styles.failed}>Payment Failed</Text>
      </View>
      {renderTxnFailedTxt()}
      {renderRetry()}
      {renderCOD()}
    </View>
  );
};
const styles = StyleSheet.create({
  component: {
    marginTop: 16,
    marginBottom: 24,
    marginHorizontal: 16,
  },
  TxnFailed: {
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 20,
    color: '#FF748E',
    marginVertical: 9,
  },
  FailedMsg: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 20,
    color: '#01475B',
    marginLeft: 32,
  },
  button: {
    alignItems: 'center',
    borderRadius: 4,
    marginHorizontal: 16,
    marginTop: 18,
    backgroundColor: '#FCB716',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
  },
  tryOther: {
    ...theme.fonts.IBMPlexSansBold(14),
    lineHeight: 24,
    color: '#FCB716',
  },
  icon: {
    height: 24,
    width: 24,
  },
  failed: {
    ...theme.fonts.IBMPlexSansBold(16),
    lineHeight: 18,
    color: '#01475B',
    marginLeft: 8,
  },
  retryCont: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#FC9916',
    marginHorizontal: 16,
    marginTop: 28,
  },
  retry: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    color: '#FC9916',
    marginVertical: 8,
  },
  codCont: {
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: '#FCB716',
    marginHorizontal: 16,
    marginTop: 18,
  },
  cod: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    marginVertical: 8,
    color: '#FFFFFF',
  },
});
