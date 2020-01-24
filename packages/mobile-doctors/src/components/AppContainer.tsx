import * as React from 'react';
import { NavigatorContainer } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { AuthProvider } from '@aph/mobile-doctors/src/components/AuthProvider';
import { UIElementsProvider } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';

export const AppContainer: React.FC = () => {
  console.disableYellowBox = true;
  return (
    <AuthProvider>
      <UIElementsProvider>
        <NavigatorContainer />
      </UIElementsProvider>
    </AuthProvider>
  );
};
