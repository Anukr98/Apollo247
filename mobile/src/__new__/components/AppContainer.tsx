import React from 'react';
import { IntlProvider } from 'react-intl';
import { AppNavigatorContainer } from 'app/src/__new__/components/AppNavigatorContainer';

const enMessages = {
  welcome: 'Welome! :)',
};

export const AppContainer: React.FC = () => {
  return (
    <IntlProvider locale="en" messages={enMessages}>
      <AppNavigatorContainer />
    </IntlProvider>
  );
};
