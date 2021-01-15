import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CollapseView } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CollapseView';

export interface WalletsProps {
  onPressPayNow: (wallet: string) => void;
  wallets: any;
}

export const Wallets: React.FC<WalletsProps> = (props) => {
  const { onPressPayNow, wallets } = props;

  const renderWallet = (item: any) => {
    return (
      <TouchableOpacity
        style={{
          ...styles.wallet,
          borderBottomWidth: item?.index == wallets.length - 1 ? 0 : 1,
        }}
        onPress={() => onPressPayNow(item?.item?.method)}
      >
        <Image source={{ uri: item?.item?.image_url }} resizeMode="contain" style={styles.image} />
        <Text style={styles.payNow}>PAY NOW</Text>
      </TouchableOpacity>
    );
  };
  const renderWallets = () => {
    return (
      <View style={styles.ChildComponent}>
        <FlatList data={wallets} renderItem={(item) => renderWallet(item)} />
      </View>
    );
  };

  return !!wallets?.length ? (
    <CollapseView Heading={'WALLETS'} ChildComponent={renderWallets()} />
  ) : null;
};

const styles = StyleSheet.create({
  ChildComponent: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  wallet: {
    flexDirection: 'row',
    paddingBottom: 18,
    marginTop: 15,
    borderColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'space-between',
  },
  image: {
    width: 90,
    height: 27,
  },
  payNow: {
    ...theme.fonts.IBMPlexSansBold(14),
    lineHeight: 24,
    color: '#FC9916',
  },
});
