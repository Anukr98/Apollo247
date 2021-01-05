import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CollapseView } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CollapseView';

export interface NetBankingProps {
  onPressOtherBanks: () => void;
  onPressBank: () => void;
}

export const NetBanking: React.FC<NetBankingProps> = (props) => {
  const { onPressOtherBanks } = props;

  const renderTopBanks = () => {
    return <View></View>;
  };

  const renderShowOtherBanks = () => {
    return (
      <TouchableOpacity onPress={onPressOtherBanks}>
        <Text style={styles.otherBanks}> Show Other Banks</Text>
      </TouchableOpacity>
    );
  };

  const renderChildComponent = () => {
    return (
      <View style={styles.ChildComponent}>
        {renderTopBanks()}
        {renderShowOtherBanks()}
      </View>
    );
  };

  return <CollapseView Heading={'NET BANKING'} ChildComponent={renderChildComponent()} />;
};

const styles = StyleSheet.create({
  ChildComponent: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    justifyContent: 'center',
  },
  otherBanks: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 17,
    color: '#FCB716',
  },
});
