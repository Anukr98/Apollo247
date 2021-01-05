import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CollapseView } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CollapseView';

export interface CardsProps {
  onPressPayNow: () => void;
}

export const Cards: React.FC<CardsProps> = (props) => {
  const { onPressPayNow } = props;

  const renderPayNow = () => {
    return <TouchableOpacity onPress={onPressPayNow}></TouchableOpacity>;
  };
  const renderChildComponent = () => {
    return <View style={styles.ChildComponent}>{renderPayNow()}</View>;
  };
  return <CollapseView Heading={'CREDIT / DEBIT CARDS'} ChildComponent={renderChildComponent()} />;
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
