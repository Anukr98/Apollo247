import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { NavigationActions, NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';

export interface MyTransactionsProps {}

export const MyTransactions: React.FC<MyTransactionsProps> = (props) => {
  return (
    <View style={{ ...theme.viewStyles.container, backgroundColor: '#fff' }}>
      <Text>MyTransactions</Text>
    </View>
  );
};
