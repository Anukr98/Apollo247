import React from 'react';
import { NavigatorContainer } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { AuthProvider } from './AuthProvider';
import { ShoppingCartProvider } from '@aph/mobile-patients/src/components/ShoppingCartProvider';

export const AppContainer: React.FC = () => {
  return (
    <AuthProvider>
      <ShoppingCartProvider>
        <NavigatorContainer />
      </ShoppingCartProvider>
    </AuthProvider>
  );
};
