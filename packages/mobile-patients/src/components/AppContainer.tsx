import React from 'react';
import { NavigatorContainer } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { AuthProvider } from './AuthProvider';

export const AppContainer: React.FC = () => {
  return (
    <AuthProvider>
      <NavigatorContainer />
    </AuthProvider>
  );
};
