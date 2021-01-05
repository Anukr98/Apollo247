import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CollapseView } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CollapseView';

export interface WalletsProps {
  onPressPayNow: () => void;
}

export const Wallets: React.FC<WalletsProps> = (props) => {
  const { onPressPayNow } = props;

  const renderChildComponent = () => {
    return <View style={styles.ChildComponent}></View>;
  };

  return <CollapseView Heading={'WALLETS'} ChildComponent={renderChildComponent()} />;
};

const styles = StyleSheet.create({
  ChildComponent: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
});
