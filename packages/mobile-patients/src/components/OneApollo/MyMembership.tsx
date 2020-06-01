import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { NavigationActions, NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';

export interface MyMembershipProps {}

export const MyMembership: React.FC<MyMembershipProps> = (props) => {
  return (
    <View style={{ ...theme.viewStyles.container, backgroundColor: '#fff' }}>
      <Text>MyMembership</Text>
    </View>
  );
};
