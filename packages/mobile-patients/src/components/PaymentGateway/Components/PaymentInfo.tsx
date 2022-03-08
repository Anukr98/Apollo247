import React from 'react';
import { StyleSheet, Dimensions, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Copy } from '@aph/mobile-patients/src/components/ui/Icons';

export interface PaymentInfoProps {
  orderIds: any;
  paymentId: any;
  onPressCopy: () => void;
}

export const PaymentInfo: React.FC<PaymentInfoProps> = (props) => {
  const { orderIds, paymentId, onPressCopy } = props;

  const renderPaymentInfo = () => {
    return (
      <View style={{ marginRight: 16 }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.orderId}>Order ID:</Text>
          <Text style={styles.id}>{orderIds}</Text>
        </View>
        <TouchableOpacity activeOpacity={0.5} style={styles.paymentId} onPress={onPressCopy}>
          <Text style={styles.orderId}>Payment Ref. Number:</Text>
          <Text style={styles.id}>{paymentId}</Text>
          <Copy style={styles.iconStyle} />
        </TouchableOpacity>
      </View>
    );
  };

  return <View style={styles.container}>{renderPaymentInfo()}</View>;
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingLeft: 12,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#D4D4D4',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  orderId: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 20,
    color: '#01475B',
  },
  paymentId: {
    flexDirection: 'row',
    marginTop: 7,
    alignItems: 'center',
  },
  id: {
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 20,
    color: '#01475B',
    marginLeft: 5,
  },
  iconStyle: {
    width: 11,
    height: 12.5,
    marginLeft: 8,
  },
});
