import { AuthProvider } from '@aph/mobile-patients/src/components/AuthProvider';
import { NavigatorContainer } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { ShoppingCartProvider } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { UIElementsProvider } from '@aph/mobile-patients/src/components/UIElementsProvider';
import React from 'react';

export const AppContainer: React.FC = () => {
  return (
    <AuthProvider>
      <ShoppingCartProvider>
        <UIElementsProvider>
          <NavigatorContainer />
        </UIElementsProvider>
      </ShoppingCartProvider>
    </AuthProvider>
  );
};
