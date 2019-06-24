import React from 'react';
import { NativeRouter, Route, BackButton } from 'react-router-native';
import { IntlProvider } from 'react-intl';
import { Onboarding } from 'app/src/__new__/components/Onboarding';
import { Login } from './Login';
import { ConsultRoom } from 'app/src/__new__/components/ConsultRoom';
import { appRoutes } from 'app/src/__new__/helpers/appRoutes';
import { View } from 'react-native';

const enMessages = {
  welcome: 'Welome! :)',
};

const App: React.FC = () => {
  return (
    <View>
      <Route exact path="/" component={Onboarding} />
      <Route path={appRoutes.onboarding()} component={Onboarding} />
      <Route path={appRoutes.login()} component={Login} />
      <Route path={appRoutes.consultRoom()} component={ConsultRoom} />
    </View>
  );
};

export const AppContainer: React.FC = () => {
  return (
    <IntlProvider locale="en" messages={enMessages}>
      <NativeRouter>
        <BackButton>
          <App />
        </BackButton>
      </NativeRouter>
    </IntlProvider>
  );
};
