import React from 'react';
import { NavigatorContainer } from 'app/src/components/NavigatorContainer';
import { ApiProvider } from 'app/src/components/ApiProvider';

export const AppContainer: React.FC = () => {
  return (
    <ApiProvider>
      <NavigatorContainer />
    </ApiProvider>
  );
};
