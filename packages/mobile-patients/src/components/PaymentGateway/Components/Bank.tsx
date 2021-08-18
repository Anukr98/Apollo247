import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { ArrowRight, YellowTickIcon, AlertRed } from '@aph/mobile-patients/src/components/ui/Icons';

export interface BankProps {
  bank: any;
  onPressBank: (bank: any) => void;
  selectedBank: any;
}

export const Bank: React.FC<BankProps> = (props) => {
  const { bank, onPressBank, selectedBank } = props;
  const outageStatus = bank?.outage_status;

  const renderSelectedBank = () => {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.subCont}>
          <Text style={{ ...styles.bankName, color: '#FCB716' }}>{bank?.payment_method_name}</Text>
          <YellowTickIcon />
        </TouchableOpacity>
        {renderOutageStatus()}
      </View>
    );
  };

  const renderBank = () => {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          disabled={outageStatus == 'DOWN' ? true : false}
          style={{ ...styles.subCont, opacity: outageStatus == 'DOWN' ? 0.5 : 1 }}
          onPress={() => onPressBank(bank)}
        >
          <Text style={styles.bankName}>{bank?.payment_method_name}</Text>
          <ArrowRight style={{ opacity: 0.15 }} />
        </TouchableOpacity>
        {renderOutageStatus()}
      </View>
    );
  };

  const renderOutageStatus = () => {
    return outageStatus == 'FLUCTUATE' || outageStatus == 'DOWN' ? (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <AlertRed style={styles.alertIcon} />
        <Text style={styles.outageMsg}>
          {outageStatus == 'FLUCTUATE'
            ? 'Experiencing high failures. Please try another option'
            : 'Disabled due to  high failures. Please try another option'}
        </Text>
      </View>
    ) : null;
  };

  return bank?.payment_method_name == selectedBank?.payment_method_name
    ? renderSelectedBank()
    : renderBank();
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(2, 71, 91, 0.15)',
  },
  subCont: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankName: {
    ...theme.fonts.IBMPlexSansMedium(15),
    lineHeight: 19,
    color: '#02475B',
  },
  outageMsg: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 18,
    color: '#BF2600',
    marginLeft: 7,
  },
  alertIcon: {
    height: 13.33,
    width: 14.67,
  },
});
