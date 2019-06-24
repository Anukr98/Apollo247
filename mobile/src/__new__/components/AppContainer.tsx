import React from 'react';
import { NativeRouter, Route } from 'react-router-native';
import { IntlProvider } from 'react-intl';
import { Onboarding } from 'app/src/__new__/components/Onboarding';
import { LoginScene } from './LoginScene';
import { ConsultRoom } from 'app/src/__new__/components/ConsultRoom';

const enMessages = {
  welcome: 'Welome! :)',
};

export const AppContainer: React.FC = () => {
  return (
    <IntlProvider locale="en" messages={enMessages}>
      <NativeRouter>
        <Route path="/" component={LoginScene} />
        {/* <Route path="/LoginScene" component={LoginScene} /> */}
        {/* <Route path="/" component={ConsultRoom} /> */}
      </NativeRouter>
    </IntlProvider>
  );
};
