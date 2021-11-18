import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { WalletIcon } from '@aph/mobile-patients/src/components/PaymentGateway/Components/WalletIcon';

export interface LinkedWalletProps {
  wallet: any;
  onPressDelink: (walletId: string, walletName: string) => void;
}

export const LinkedWallet: React.FC<LinkedWalletProps> = (props) => {
  const { wallet, onPressDelink } = props;

  const renderWallet = () => {
    return (
      <View style={styles.wallet}>
        {wallet?.wallet == 'AMAZONPAY' && (
          <WalletIcon
            imageUrl={'https://prodaphstorage.blob.core.windows.net/paymentlogos/amazon_pay.png'}
          />
        )}
        <View style={styles.walletCont}>
          <Text style={styles.walletName}>{wallet?.wallet}</Text>
          <TouchableOpacity onPress={() => onPressDelink(wallet?.id, wallet?.wallet)}>
            <Text style={styles.payNow}>DE-LINK ACCOUNT</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return <View style={styles.ChildComponent}>{renderWallet()}</View>;
};

const styles = StyleSheet.create({
  ChildComponent: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  walletName: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
    color: '#01475B',
    marginLeft: 12,
  },
  payNow: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 17,
    color: '#FC9916',
  },
  walletCont: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  wallet: {
    paddingVertical: 16,
    borderColor: 'rgba(0,0,0,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
