import * as React from 'react';
import { NavigatorContainer } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { AuthProvider } from '@aph/mobile-doctors/src/components/AuthProvider';

export const AppContainer: React.FC = () => {
  console.disableYellowBox = true;
  return (
    <AuthProvider>
      <NavigatorContainer />
    </AuthProvider>
  );
};
