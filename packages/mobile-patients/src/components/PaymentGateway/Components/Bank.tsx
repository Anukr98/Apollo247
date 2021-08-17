import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { ArrowRight, YellowTickIcon } from '@aph/mobile-patients/src/components/ui/Icons';

export interface BankProps {
  bank: any;
  onPressBank: (bank: any) => void;
  selectedBank: any;
}

export const Bank: React.FC<BankProps> = (props) => {
  const { bank, onPressBank, selectedBank } = props;

  const renderSelectedBank = () => {
    return (
      <TouchableOpacity style={styles.container}>
        <Text style={{ ...styles.bankName, color: '#FCB716' }}>{bank?.payment_method_name}</Text>
        <YellowTickIcon style={{}} />
      </TouchableOpacity>
    );
  };
  const renderBank = () => {
    return (
      <TouchableOpacity style={styles.container} onPress={() => onPressBank(bank)}>
        <Text style={styles.bankName}>{bank?.payment_method_name}</Text>
        <ArrowRight style={{ opacity: 0.15 }} />
      </TouchableOpacity>
    );
  };

  return bank?.payment_method_name == selectedBank?.payment_method_name
    ? renderSelectedBank()
    : renderBank();
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(2, 71, 91, 0.15)',
    alignItems: 'center',
  },
  bankName: {
    ...theme.fonts.IBMPlexSansMedium(15),
    lineHeight: 19,
    color: '#02475B',
  },
});
