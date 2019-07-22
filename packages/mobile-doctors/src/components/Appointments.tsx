import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import * as React from 'react';
import { SafeAreaView } from 'react-native';
import { theme } from '@aph/mobile-doctors/src/theme/theme';

export interface AppointmentsProps {}

export const Appointments: React.FC<AppointmentsProps> = (props) => {
  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <Header />
    </SafeAreaView>
  );
};
