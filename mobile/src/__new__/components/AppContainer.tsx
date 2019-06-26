import React from 'react';
import { IntlProvider, addLocaleData } from 'react-intl';
import { AppNavigatorContainer } from 'app/src/__new__/components/AppNavigatorContainer';

import en from 'react-intl/locale-data/en';

addLocaleData(en);

// import '@formatjs/intl-relativetimeformat/polyfill';
// import '@formatjs/intl-relativetimeformat/dist/locale-data/de'; // Add locale data for de

const enMessages = {
  welcome: 'Welome! :)',
};

export const AppContainer: React.FC = () => {
  return (
    // <IntlProvider locale="en" messages={enMessages}>
    <>
      <AppNavigatorContainer />
    </>
    // </IntlProvider>
  );
};
