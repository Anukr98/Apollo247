import { Header } from 'app/src/components/ui/Header';
import React from 'react';
import { SafeAreaView } from 'react-native';
import { theme } from 'app/src/theme/theme';

export interface AppointmentsProps {}

export const Appointments: React.FC<AppointmentsProps> = (props) => {
  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <Header />
    </SafeAreaView>
  );
};
