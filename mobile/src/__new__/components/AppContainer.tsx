import React from 'react';
import { NativeRouter, Route } from 'react-router-native';
import { IntlProvider } from 'react-intl';
import { Onboarding } from 'app/src/__new__/components/Onboarding';
import { Login } from './Login';
import { ConsultRoom } from 'app/src/__new__/components/ConsultRoom';
import { appRoutes } from 'app/src/__new__/helpers/appRoutes';

const enMessages = {
  welcome: 'Welome! :)',
};

export const AppContainer: React.FC = () => {
  return (
    <IntlProvider locale="en" messages={enMessages}>
      <NativeRouter>
        <Route exact path="/" component={Onboarding} />
        <Route path={appRoutes.onboarding()} component={Onboarding} />
        <Route path={appRoutes.login()} component={Login} />
        <Route path={appRoutes.consultRoom()} component={ConsultRoom} />
      </NativeRouter>
    </IntlProvider>
  );
};
